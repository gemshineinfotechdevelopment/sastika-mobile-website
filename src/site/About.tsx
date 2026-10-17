import { useNavigate } from 'react-router-dom';
import { C } from '../theme';
import Icon, { type IconName } from '../components/Icon';
import { CountUp, Reveal } from '../components/anim';
import { Btn } from './ui';
import { useStore } from '../store';
import defaultLogo from '../assets/logo.png';

const PILLARS: { icon: IconName; t: string; s: string }[] = [
  {
    icon: 'award',
    t: '100% Original Sealed Mobiles',
    s: 'அனைத்து புதிய மொபைல்களுக்கும் நிறுவனத்தின் 1 வருட அதிகாரப்பூர்வ வாரண்டி மற்றும் ஜிஎஸ்டி பில் (GSTIN: 33BQTPJ5275L1Z6) உண்டு.',
  },
  {
    icon: 'tool',
    t: 'Multi-Brand Sales & Expert Service',
    s: 'சேல்ஸ் மற்றும் சர்வீஸ் இரண்டும் ஒரே இடத்தில். அனுபவம் வாய்ந்த டெக்னீஷியன்கள் மூலம் சிறந்த முறையில் பழுது நீக்கம்.',
  },
  {
    icon: 'tag',
    t: 'Best Price Guarantee in Sivakasi',
    s: 'சிவகாசி மற்றும் சுற்றுவட்டாரப் பகுதியில் சிறந்த விலை மற்றும் சிறப்பு சலுகைகளுடன் முன்னணி பிராண்ட் மொபைல்கள்.',
  },
  {
    icon: 'shield',
    t: 'Authorized Company Service Support',
    s: 'ஏதேனும் பழுது ஏற்பட்டால் அந்தந்த நிறுவனத்தின் அங்கீகரிக்கப்பட்ட சர்வீஸ் சென்டரில் தடையின்றி சர்வீஸ் பெற முழு வழிகாட்டுதல்.',
  },
];

const RULES = [
  {
    no: '1',
    title: '1 Year Brand Warranty',
    desc: 'அனைத்து புதிய மொபைல்களுக்கும் 1 வருடம் கம்பெனி வாரண்டி உண்டு.',
  },
  {
    no: '2',
    title: 'Company Service Center Assistance',
    desc: 'ஏதேனும் பழுது ஏற்பட்டால் அந்தந்த கம்பெனி சர்வீஸ் சென்டரில் விரைவாக சர்வீஸ் செய்து கொள்ளலாம்.',
  },
  {
    no: '3',
    title: 'Genuine Accessories & Care',
    desc: 'அசல் உதிரி பாகங்கள், உயர்தர சார்ஜர்கள், கவர்கள் மற்றும் டெம்பர்டு கிளாஸ் கிடைக்கும்.',
  },
  {
    no: '4',
    title: 'Transparent GST Billing',
    desc: 'ஒவ்வொரு விற்பனைக்கும் முறையான GST Tax Invoice (GSTIN: 33BQTPJ5275L1Z6) வழங்கப்படும்.',
  },
  {
    no: '5',
    title: 'Friendly After-Sales Support',
    desc: 'மொபைல் டேட்டா மாற்றம் மற்றும் புதிய போன் செட்டிங்ஸ் செய்ய எங்களின் பணியாளர்கள் எப்போதும் உதவுவார்கள்.',
  },
];

export default function About() {
  const nav = useNavigate();
  const { logo } = useStore();

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Devotional Invocations Banner from original bill */}
      <div
        style={{
          background: '#fff3dc',
          borderBottom: '1px solid #ffd899',
          padding: '8px 14px',
          textAlign: 'center',
          fontSize: 11,
          fontWeight: 800,
          color: '#995c00',
          letterSpacing: 0.3,
        }}
      >
        ஸ்ரீ பால முருகன் துணை &bull; ஸ்ரீ கோட்டை கருப்பசாமி துணை &bull; ஸ்ரீ குருவம்மாள் துணை
      </div>

      {/* Hero Card */}
      <div
        style={{
          margin: '14px 14px 0',
          padding: '24px 20px',
          borderRadius: 28,
          color: '#fff',
          background: `linear-gradient(140deg, ${C.primaryDark}, ${C.primarySoft})`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            position: 'absolute',
            width: 200,
            height: 200,
            right: -60,
            bottom: -80,
            borderRadius: '50%',
            background: 'rgba(246,196,69,.18)',
            animation: 'orb 10s ease-in-out infinite',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <img
            src={logo || defaultLogo}
            alt="Sastika Mobiles Logo"
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #d4af37',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              background: '#fff',
            }}
          />
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.5, color: C.accent }}>
              TAX INVOICE &bull; GSTIN: 33BQTPJ5275L1Z6
            </div>
            <h1
              style={{
                margin: '2px 0 0',
                fontSize: 26,
                lineHeight: 1.15,
                fontWeight: 900,
                letterSpacing: -0.5,
              }}
            >
              சஷ்டிகா மொபைல்ஸ்
            </h1>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e4f3ef', letterSpacing: 0.5 }}>
              SASTIKA MOBILES &bull; சேல்ஸ் &amp; சர்வீஸ்
            </div>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>
          சித்துராஜபுரம் மற்றும் சிவகாசியில் அமைந்துள்ள முன்னணி மல்டி பிராண்ட் மொபைல் ஷோரூம் மற்றும் சர்வீஸ் மையம்.
        </p>

        <div style={{ display: 'flex', gap: 24, marginTop: 18 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.accent }}>
              <CountUp to={2} suffix=" கிளைகள்" />
            </div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>சித்துராஜபுரம் & சிவகாசி</div>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.accent }}>
              <CountUp to={10} suffix="K+" />
            </div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>நம்பகமான வாடிக்கையாளர்கள்</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 18px 0' }}>
        {/* Branches Section */}
        <Reveal>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, color: C.primarySoft }}>
            OUR BRANCHES &bull; எங்களின் கிளைகள்
          </div>
          <h2 style={{ margin: '4px 0 14px', fontSize: 21, fontWeight: 800, letterSpacing: -0.5 }}>
            Visit Us in Sithurajapuram &amp; Sivakasi
          </h2>

          <div style={{ display: 'grid', gap: 12 }}>
            <div
              className="lift"
              style={{
                padding: 16,
                background: '#fff',
                borderRadius: 20,
                border: `1.5px solid ${C.border}`,
                boxShadow: '0 4px 14px rgba(11,74,67,.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: 8,
                    background: C.primary,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  கிளை 1 (Branch 1)
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.primarySoft }}>Main Showroom</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 4 }}>
                ஸ்ரீ ரெங்கா காம்ப்ளக்ஸ், சித்துராஜபுரம்
              </div>
              <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
                கென்னடி மெடிக்கல் அருகில், சித்துராஜபுரம், தமிழ்நாடு.
                <br />
                (Near Kennedy Medical, Sithurajapuram)
              </div>
            </div>

            <div
              className="lift"
              style={{
                padding: 16,
                background: '#fff',
                borderRadius: 20,
                border: `1.5px solid ${C.border}`,
                boxShadow: '0 4px 14px rgba(11,74,67,.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: 8,
                    background: C.accentDark,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  கிளை 2 (Branch 2)
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.accentDark }}>Express Service</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 4 }}>
                சிவகாசி பஸ் நிலையம், சிவகாசி
              </div>
              <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
                சிவகாசி பேருந்து நிலையம் அருகில், சிவகாசி, தமிழ்நாடு.
                <br />
                (Sivakasi Bus Stand, Sivakasi)
              </div>
            </div>
          </div>
        </Reveal>

        {/* 4 Pillars of Trust */}
        <h2 style={{ margin: '28px 0 12px', fontSize: 21, fontWeight: 800 }}>
          எங்களின் சிறப்பு நன்மைகள் (Our Highlights)
        </h2>
        {PILLARS.map((p, i) => (
          <Reveal key={p.t} delay={i * 90}>
            <div
              className="lift"
              style={{
                display: 'flex',
                gap: 14,
                padding: 14,
                background: '#fff',
                borderRadius: 18,
                border: `1px solid ${C.border}`,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 13,
                  background: C.primary,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name={p.icon} size={20} color={C.accent} />
              </span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{p.t}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, marginTop: 3 }}>
                  {p.s}
                </div>
              </div>
            </div>
          </Reveal>
        ))}

        {/* Customer Guidelines from Invoice */}
        <div style={{ marginTop: 26 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.4, color: C.primarySoft }}>
            CUSTOMER TERMS &bull; வாடிக்கையாளர் குறிப்புகள்
          </div>
          <h2 style={{ margin: '4px 0 12px', fontSize: 20, fontWeight: 800 }}>
            Service &amp; Warranty Guidelines
          </h2>

          <div style={{ display: 'grid', gap: 9 }}>
            {RULES.map((r) => (
              <div
                key={r.no}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '12px 14px',
                  background: C.tint2,
                  borderRadius: 14,
                  border: `1px solid ${C.border}`,
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 99,
                    background: C.primary,
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: 11,
                    flexShrink: 0,
                  }}
                >
                  {r.no}
                </span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: C.text }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <Reveal>
          <div style={{ marginTop: 24, padding: 20, borderRadius: 24, background: C.primary, color: '#fff' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800 }}>
              மொபைல் வாங்க அல்லது சர்வீஸ் செய்ய தொடர்பு கொள்ளுங்கள்
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: 12.5, opacity: 0.88 }}>
              எங்கள் இரண்டு கிளைகளிலும் உங்களுக்கு உதவ எங்கள் நிபுணர்கள் தயாராக உள்ளனர்.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="accent" onClick={() => nav('/services')} style={{ flex: 1 }}>
                Book Service
              </Btn>
              <Btn
                variant="ghost"
                onClick={() => nav('/contact')}
                style={{ flex: 1, color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}
              >
                Find Stores
              </Btn>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
