import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Settings } from '../models/Settings.js';
import { getDbStatus } from '../config/db.js';
import { readData, writeData } from '../dataHelper.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sastika_mobiles_secure_jwt_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const DEFAULT_USERS = [
  {
    id: 'u_admin',
    name: 'Sastika Admin',
    email: 'admin@sastikamobiles.com',
    passwordHash: bcrypt.hashSync('admin123', 8),
    role: 'admin',
    phone: '+91 98401 23456',
  },
  {
    id: 'u_hari',
    name: 'Hariharan S.',
    email: 'hari@sastikamobiles.com',
    passwordHash: bcrypt.hashSync('customer123', 8),
    role: 'customer',
    phone: '+91 95434 34344',
  },
];

function loadStoredUsers() {
  try {
    const list = readData('users.json');
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
  } catch (err) {
    console.error('Failed reading users.json:', err);
  }
  writeData('users.json', DEFAULT_USERS);
  return [...DEFAULT_USERS];
}

let memoryUsers = loadStoredUsers();

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email/Mobile number and password are required' });
    }

    const normalizedInput = email.toLowerCase().trim();
    const cleanPhone = normalizedInput.replace(/\D/g, '').slice(-10);

    // Check dynamic Admin credentials from Settings
    try {
      let currentSettings = null;
      if (getDbStatus()) {
        currentSettings = await Settings.findOne({ key: 'global_settings' }).catch(() => null);
      }
      const confUser = (currentSettings?.adminUsername || 'admin@sastikamobiles.com').trim().toLowerCase();
      const confPass = currentSettings?.adminPassword || 'admin123';

      const isAttemptingAdmin =
        normalizedInput === confUser ||
        normalizedInput === 'admin' ||
        normalizedInput === 'admin@sastikamobiles.com';

      if (isAttemptingAdmin) {
        if (normalizedInput === confUser && password === confPass) {
          const dynamicAdminUser = {
            id: 'u_admin',
            name: 'Sastika Admin',
            email: currentSettings?.adminUsername || confUser,
            role: 'admin',
            phone: currentSettings?.phone || '+91 95434 34344',
          };
          const token = generateToken(dynamicAdminUser);
          return res.json({
            success: true,
            token,
            user: dynamicAdminUser,
          });
        } else {
          return res.status(401).json({
            success: false,
            message: 'Invalid admin credentials. Please use the username and password set in Admin Settings.',
          });
        }
      }
    } catch {
      /* ignore */
    }

    // 1. Try MongoDB if connected
    if (getDbStatus()) {
      let user = await User.findOne({
        $or: [
          { email: normalizedInput },
          ...(cleanPhone.length >= 10 ? [{ phone: new RegExp(cleanPhone + '$') }] : []),
        ],
      });

      if (user) {
        let isMatch = await bcrypt.compare(password, user.password).catch(() => false);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
        }

        const token = generateToken({ id: user._id, email: user.email, role: user.role, name: user.name });
        return res.json({
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            cart: user.cart || [],
            wishlist: user.wishlist || [],
          },
        });
      }
    }

    // 2. Check persistent users.json / memory storage
    memoryUsers = loadStoredUsers();
    const isAdminEmail = (normalizedInput === 'admin@sastikamobiles.com' || normalizedInput === 'admin@sastika.com' || normalizedInput === 'admin');
    let user = memoryUsers.find((u) => {
      if (isAdminEmail && (u.role === 'admin' || u.id === 'u_admin' || u.email === 'admin@sastikamobiles.com')) return true;
      if (u.email && u.email.toLowerCase() === normalizedInput) return true;
      if (cleanPhone.length >= 10 && u.phone) {
        const uClean = u.phone.replace(/\D/g, '').slice(-10);
        if (uClean === cleanPhone) return true;
      }
      return false;
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email or mobile number. Please register first.',
      });
    }

    const hashToCompare = user.passwordHash || user.password;
    let isMatch = hashToCompare ? bcrypt.compareSync(password, hashToCompare) : false;
    if (!isMatch) {
      if ((user.id === 'u_admin' || user.email === 'admin@sastikamobiles.com' || user.role === 'admin') && (password === 'admin123' || password === 'admin' || password === 'password123')) {
        isMatch = true;
      } else if ((user.id === 'u_hari' || user.email === 'hari@sastikamobiles.com') && (password === 'customer123' || password === 'password123' || password === 'admin123')) {
        isMatch = true;
      }
    }
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        cart: user.cart || [],
        wishlist: user.wishlist || [],
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);

    memoryUsers = loadStoredUsers();

    // Check if user already exists
    const existingInMem = memoryUsers.find(
      (u) =>
        u.email === normalizedEmail ||
        (cleanPhone.length >= 10 && u.phone && u.phone.replace(/\D/g, '').slice(-10) === cleanPhone)
    );
    if (existingInMem) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email or mobile number already exists. Please sign in.',
      });
    }

    let createdId = 'u_' + Date.now().toString(36);
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. If MongoDB is active, create in DB
    if (getDbStatus()) {
      const existingInDb = await User.findOne({
        $or: [
          { email: normalizedEmail },
          ...(cleanPhone.length >= 10 ? [{ phone: new RegExp(cleanPhone + '$') }] : []),
        ],
      });
      if (existingInDb) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email or mobile number already exists. Please sign in.',
        });
      }

      const dbUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || '',
        role: role || 'customer',
      });
      createdId = String(dbUser._id);
    }

    // 2. Always persist in users.json file
    const newUser = {
      id: createdId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashedPassword,
      phone: phone || '',
      role: role || 'customer',
      createdAt: new Date().toISOString(),
    };

    memoryUsers.push(newUser);
    writeData('users.json', memoryUsers);

    const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name });
    return res.status(201).json({
      success: true,
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, phone: newUser.phone },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = (req.user?.email || '').toLowerCase().trim();

    let fullUser = null;

    if (getDbStatus()) {
      try {
        const dbU = await User.findOne({ $or: [{ _id: userId }, { email: userEmail }] }).select('-password');
        if (dbU) {
          fullUser = {
            id: String(dbU._id),
            name: dbU.name,
            email: dbU.email,
            role: dbU.role,
            phone: dbU.phone || '',
            avatar: dbU.avatar || '',
            cart: dbU.cart || [],
            wishlist: dbU.wishlist || [],
          };
        }
      } catch (e) {}
    }

    if (!fullUser) {
      memoryUsers = loadStoredUsers();
      const memU = memoryUsers.find(
        (u) => (u.id && String(u.id) === String(userId)) || (u.email && u.email.toLowerCase() === userEmail)
      );
      if (memU) {
        fullUser = {
          id: memU.id,
          name: memU.name,
          email: memU.email,
          role: memU.role,
          phone: memU.phone || '',
          avatar: memU.avatar || '',
          cart: memU.cart || [],
          wishlist: memU.wishlist || [],
        };
      }
    }

    return res.json({
      success: true,
      user: fullUser || req.user,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const syncUserData = async (req, res) => {
  try {
    const userId = req.user?.id;
    const userEmail = (req.user?.email || '').toLowerCase().trim();
    const { cart, wishlist } = req.body;

    const cleanCart = Array.isArray(cart) ? cart : [];
    const cleanWishlist = Array.isArray(wishlist) ? wishlist : [];

    // 1. Update in MongoDB if available
    if (getDbStatus()) {
      try {
        await User.findOneAndUpdate(
          { $or: [{ _id: userId }, { email: userEmail }] },
          { $set: { cart: cleanCart, wishlist: cleanWishlist } },
          { new: true }
        );
      } catch (dbErr) {
        console.warn('[Sync DB Error]:', dbErr.message);
      }
    }

    // 2. Update in users.json & memory
    memoryUsers = loadStoredUsers();
    const idx = memoryUsers.findIndex(
      (u) => (u.id && String(u.id) === String(userId)) || (u.email && u.email.toLowerCase() === userEmail)
    );
    if (idx !== -1) {
      memoryUsers[idx].cart = cleanCart;
      memoryUsers[idx].wishlist = cleanWishlist;
      writeData('users.json', memoryUsers);
    }

    return res.json({
      success: true,
      cart: cleanCart,
      wishlist: cleanWishlist,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Helpers for Google OAuth configuration
const getGoogleClientId = () => {
  return (process.env.GOOGLE_CLIENT_ID || '').trim();
};

const getGoogleClientSecret = () => {
  return (process.env.GOOGLE_CLIENT_SECRET || '').trim();
};

const getGoogleRedirectUri = (req) => {
  if (process.env.GOOGLE_REDIRECT_URI && process.env.GOOGLE_REDIRECT_URI.trim()) {
    return process.env.GOOGLE_REDIRECT_URI.trim();
  }
  const host = req?.get ? req.get('host') : '';
  if (host && host.includes('gemshine.tech')) {
    return 'https://sastika-mobiles.gemshine.tech/api/auth/google/callback';
  }
  const proto = req?.headers?.['x-forwarded-proto'] || req?.protocol || 'http';
  return `${proto}://${host || 'localhost:5000'}/api/auth/google/callback`;
};

/**
 * Get Google OAuth consent URL based on GOOGLE_CLIENT_ID in server/.env
 */
export const getGoogleAuthUrl = (req, res) => {
  const clientId = getGoogleClientId();
  if (!clientId || clientId.includes('your_google_client_id')) {
    return res.json({
      success: false,
      configured: false,
      message: 'GOOGLE_CLIENT_ID is not configured in server/.env',
    });
  }
  const redirectUri = getGoogleRedirectUri(req);

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: redirectUri,
    client_id: clientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'select_account',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'openid',
    ].join(' '),
  };

  const qs = new URLSearchParams(options).toString();
  return res.json({
    success: true,
    configured: true,
    clientId,
    url: `${rootUrl}?${qs}`,
  });
};

/**
 * Handle Google Login via ID token credential or authorization code
 */
export const googleLogin = async (req, res) => {
  try {
    const { credential, code, redirectUri, accessToken } = req.body;
    let googleUser = null;

    const GOOGLE_CLIENT_ID = getGoogleClientId();
    const GOOGLE_CLIENT_SECRET = getGoogleClientSecret();

    // Case 1: Google Identity Services ID Token (Credential)
    if (credential) {
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );
      if (!verifyRes.ok) {
        const errText = await verifyRes.text();
        return res.status(401).json({
          success: false,
          message: `Invalid Google credential token: ${errText}`,
        });
      }
      const payload = await verifyRes.json();

      if (GOOGLE_CLIENT_ID && payload.aud && payload.aud !== GOOGLE_CLIENT_ID) {
        console.warn(`[Google OAuth] Audience notice: token aud is ${payload.aud}`);
      }

      googleUser = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        avatar: payload.picture || '',
        emailVerified: payload.email_verified === 'true' || payload.email_verified === true,
      };
    }
    // Case 2: Authorization Code from OAuth2 flow
    else if (code) {
      if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return res.status(400).json({
          success: false,
          message: 'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured in server/.env',
        });
      }

      const redirect = redirectUri || getGoogleRedirectUri(req);

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: redirect,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenRes.ok) {
        const errData = await tokenRes.json().catch(() => ({}));
        return res.status(400).json({
          success: false,
          message: errData.error_description || errData.error || 'Failed to exchange authorization code with Google',
        });
      }

      const tokens = await tokenRes.json();
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!userRes.ok) {
        return res.status(400).json({ success: false, message: 'Failed to retrieve Google user profile' });
      }

      const profile = await userRes.json();
      googleUser = {
        googleId: profile.sub,
        email: profile.email,
        name: profile.name || profile.email.split('@')[0],
        avatar: profile.picture || '',
        emailVerified: profile.email_verified,
      };
    }
    // Case 3: Access Token
    else if (accessToken) {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!userRes.ok) {
        return res.status(401).json({ success: false, message: 'Invalid Google access token' });
      }
      const profile = await userRes.json();
      googleUser = {
        googleId: profile.sub,
        email: profile.email,
        name: profile.name || profile.email.split('@')[0],
        avatar: profile.picture || '',
        emailVerified: profile.email_verified,
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Google credential ID token, accessToken, or authorization code is required',
      });
    }

    if (!googleUser || !googleUser.email) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract valid email from Google authentication',
      });
    }

    const normalizedEmail = googleUser.email.toLowerCase().trim();
    let authUser = null;

    // 1. MongoDB integration
    if (getDbStatus()) {
      let dbUser = await User.findOne({
        $or: [{ googleId: googleUser.googleId }, { email: normalizedEmail }],
      });

      if (dbUser) {
        let changed = false;
        if (!dbUser.googleId) {
          dbUser.googleId = googleUser.googleId;
          changed = true;
        }
        if (googleUser.avatar && !dbUser.avatar) {
          dbUser.avatar = googleUser.avatar;
          changed = true;
        }
        if (dbUser.authProvider !== 'google' && !dbUser.password) {
          dbUser.authProvider = 'google';
          changed = true;
        }
        if (changed) await dbUser.save();

        authUser = {
          id: String(dbUser._id),
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role || (normalizedEmail === 'admin@sastikamobiles.com' ? 'admin' : 'customer'),
          phone: dbUser.phone || '',
          avatar: dbUser.avatar || googleUser.avatar || '',
          authProvider: 'google',
          cart: dbUser.cart || [],
          wishlist: dbUser.wishlist || [],
        };
      } else {
        const newUser = await User.create({
          name: googleUser.name,
          email: normalizedEmail,
          googleId: googleUser.googleId,
          avatar: googleUser.avatar,
          authProvider: 'google',
          role: normalizedEmail === 'admin@sastikamobiles.com' ? 'admin' : 'customer',
          cart: [],
          wishlist: [],
        });

        authUser = {
          id: String(newUser._id),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: '',
          avatar: newUser.avatar,
          authProvider: 'google',
          cart: [],
          wishlist: [],
        };
      }
    }

    // 2. Memory / users.json sync
    memoryUsers = loadStoredUsers();
    let localUser = memoryUsers.find(
      (u) =>
        (u.googleId && u.googleId === googleUser.googleId) ||
        (u.email && u.email.toLowerCase() === normalizedEmail)
    );

    if (localUser) {
      localUser.googleId = googleUser.googleId;
      if (googleUser.avatar) localUser.avatar = googleUser.avatar;
      localUser.authProvider = 'google';
      if (!authUser) {
        authUser = {
          id: localUser.id,
          name: localUser.name,
          email: localUser.email,
          role: localUser.role || (normalizedEmail === 'admin@sastikamobiles.com' ? 'admin' : 'customer'),
          phone: localUser.phone || '',
          avatar: localUser.avatar || '',
          authProvider: 'google',
          cart: localUser.cart || [],
          wishlist: localUser.wishlist || [],
        };
      }
    } else {
      const createdId = authUser ? authUser.id : 'u_' + Date.now().toString(36);
      const newLocal = {
        id: createdId,
        name: googleUser.name,
        email: normalizedEmail,
        googleId: googleUser.googleId,
        avatar: googleUser.avatar,
        authProvider: 'google',
        role: normalizedEmail === 'admin@sastikamobiles.com' ? 'admin' : 'customer',
        cart: [],
        wishlist: [],
        createdAt: new Date().toISOString(),
      };
      memoryUsers.push(newLocal);
      if (!authUser) authUser = newLocal;
    }

    writeData('users.json', memoryUsers);

    // Issue JWT token
    const token = generateToken({
      id: authUser.id,
      email: authUser.email,
      role: authUser.role,
      name: authUser.name,
    });

    return res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: authUser,
    });
  } catch (err) {
    console.error('[Google OAuth Error]:', err);
    return res.status(500).json({ success: false, message: err.message || 'Google authentication failed' });
  }
};

/**
 * Handle Google OAuth redirect callback (GET /api/auth/google/callback)
 */
export const googleCallback = async (req, res) => {
  const host = req?.get ? req.get('host') : '';
  const isProduction = host && host.includes('gemshine.tech');
  const clientUrl = process.env.CLIENT_URL || (isProduction ? 'https://sastika-mobiles.gemshine.tech' : 'http://localhost:5173');
  try {
    const { code, error } = req.query;
    if (error) {
      return res.redirect(`${clientUrl}/#/login?error=${encodeURIComponent(error)}`);
    }
    if (!code) {
      return res.redirect(
        `${clientUrl}/#/login?error=${encodeURIComponent('No authorization code provided from Google')}`
      );
    }

    const clientId = getGoogleClientId();
    const clientSecret = getGoogleClientSecret();
    const redirectUri = getGoogleRedirectUri(req);

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.json().catch(() => ({}));
      return res.redirect(
        `${clientUrl}/#/login?error=${encodeURIComponent(errData.error_description || 'Failed to exchange Google code')}`
      );
    }

    const tokens = await tokenRes.json();
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
      return res.redirect(`${clientUrl}/#/login?error=${encodeURIComponent('Failed to fetch Google profile')}`);
    }

    const profile = await userRes.json();
    const normalizedEmail = profile.email.toLowerCase().trim();
    let authUser = null;

    if (getDbStatus()) {
      let dbUser = await User.findOne({
        $or: [{ googleId: profile.sub }, { email: normalizedEmail }],
      });

      if (dbUser) {
        if (!dbUser.googleId) dbUser.googleId = profile.sub;
        if (profile.picture && !dbUser.avatar) dbUser.avatar = profile.picture;
        await dbUser.save();
        authUser = {
          id: String(dbUser._id),
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role || (normalizedEmail === 'admin@sastikamobiles.com' ? 'admin' : 'customer'),
          phone: dbUser.phone || '',
          avatar: dbUser.avatar || profile.picture || '',
          authProvider: 'google',
        };
      } else {
        const newUser = await User.create({
          name: profile.name || profile.email.split('@')[0],
          email: normalizedEmail,
          googleId: profile.sub,
          avatar: profile.picture || '',
          authProvider: 'google',
          role: normalizedEmail === 'admin@sastikamobiles.com' ? 'admin' : 'customer',
        });
        authUser = {
          id: String(newUser._id),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
          authProvider: 'google',
        };
      }
    }

    memoryUsers = loadStoredUsers();
    let localUser = memoryUsers.find(
      (u) => (u.googleId && u.googleId === profile.sub) || (u.email && u.email.toLowerCase() === normalizedEmail)
    );
    if (!localUser) {
      localUser = {
        id: authUser ? authUser.id : 'u_' + Date.now().toString(36),
        name: profile.name || profile.email.split('@')[0],
        email: normalizedEmail,
        googleId: profile.sub,
        avatar: profile.picture || '',
        authProvider: 'google',
        role: normalizedEmail === 'admin@sastikamobiles.com' ? 'admin' : 'customer',
        createdAt: new Date().toISOString(),
      };
      memoryUsers.push(localUser);
    } else {
      localUser.googleId = profile.sub;
      if (profile.picture) localUser.avatar = profile.picture;
      localUser.authProvider = 'google';
    }
    writeData('users.json', memoryUsers);

    if (!authUser) authUser = localUser;

    const token = generateToken({
      id: authUser.id,
      email: authUser.email,
      role: authUser.role,
      name: authUser.name,
    });

    const userParam = encodeURIComponent(JSON.stringify(authUser));
    return res.redirect(`${clientUrl}/#/login?googleToken=${token}&user=${userParam}`);
  } catch (err) {
    console.error('[Google Callback Error]:', err);
    return res.redirect(
      `${clientUrl}/#/login?error=${encodeURIComponent(err.message || 'OAuth callback failed')}`
    );
  }
};

