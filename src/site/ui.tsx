import { useNavigate } from 'react-router-dom';
import type { CSSProperties, ReactNode } from 'react';
import { C } from '../theme';
import Icon from '../components/Icon';

export function Btn({
  children,
  onClick,
  variant = 'primary',
  full,
  style,
  disabled,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'accent' | 'ghost' | 'light';
  full?: boolean;
  style?: CSSProperties;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const v: Record<string, CSSProperties> = {
    primary: { background: C.primary, color: '#fff' },
    accent: { background: C.accent, color: C.primaryDark },
    ghost: { background: 'transparent', color: C.primary, border: `1.5px solid ${C.primary}` },
    light: { background: C.tint, color: C.primary },
  };
  return (
    <button
      type={type}
      className="tap"
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: '13px 18px',
        borderRadius: 14,
        fontWeight: 700,
        fontSize: 14,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: full ? '100%' : undefined,
        opacity: disabled ? 0.55 : 1,
        position: 'relative',
        overflow: 'hidden',
        ...v[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function SectionHead({ title, sub, action, onAction }: { title: string; sub?: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 18px', marginBottom: 14 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: -0.4 }}>{title}</h2>
        {sub && <p style={{ margin: '3px 0 0', fontSize: 12.5, color: C.muted }}>{sub}</p>}
      </div>
      {action && (
        <button onClick={onAction} style={{ color: C.primary, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 2 }}>
          {action}
          <Icon name="right" size={14} />
        </button>
      )}
    </div>
  );
}

export function PageHead({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  const nav = useNavigate();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px 8px' }}>
      <button
        className="tap"
        onClick={() => nav(-1)}
        style={{ width: 38, height: 38, borderRadius: 12, background: '#fff', border: `1px solid ${C.border}`, display: 'grid', placeItems: 'center' }}
        aria-label="Back"
      >
        <Icon name="left" size={18} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: -0.3 }}>{title}</h1>
        {sub && <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

export function Pill({ children, tone = 'tint' }: { children: ReactNode; tone?: 'tint' | 'accent' | 'success' | 'danger' | 'warn' | 'dark' }) {
  const t: Record<string, CSSProperties> = {
    tint: { background: C.tint, color: C.primary },
    accent: { background: C.accent, color: C.primaryDark },
    success: { background: C.successSoft, color: C.success },
    danger: { background: C.dangerSoft, color: C.danger },
    warn: { background: C.warnSoft, color: C.warn },
    dark: { background: C.primary, color: '#fff' },
  };
  return (
    <span style={{ ...t[tone], fontSize: 10.5, fontWeight: 800, padding: '4px 9px', borderRadius: 99, letterSpacing: 0.3, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

export const input: CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  borderRadius: 12,
  border: `1.5px solid ${C.border}`,
  background: '#fff',
  fontSize: 14,
};

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>{label}</div>
      {children}
    </label>
  );
}

export function Stars({ value, size = 12 }: { value: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name="star" size={size} color={C.accentDark} fill={n <= Math.round(value) ? C.accent : 'none'} stroke={1.5} />
      ))}
    </span>
  );
}
