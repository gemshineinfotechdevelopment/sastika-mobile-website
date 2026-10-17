import type { CSSProperties, ReactNode } from 'react';
import { C } from '../theme';
import Icon, { type IconName } from '../components/Icon';
import { CountUp } from '../components/anim';

export const panel: CSSProperties = {
  background: '#fff',
  border: `1px solid ${C.border}`,
  borderRadius: 18,
  padding: 20,
  boxShadow: '0 4px 18px rgba(11,74,67,.05)',
};

export const th: CSSProperties = {
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 0.8,
  color: C.muted,
  padding: '10px 14px',
  borderBottom: `1px solid ${C.border}`,
  whiteSpace: 'nowrap',
};

export const td: CSSProperties = {
  padding: '13px 14px',
  fontSize: 13.5,
  borderBottom: `1px solid ${C.border}`,
  verticalAlign: 'middle',
};

export const field: CSSProperties = {
  width: '100%',
  padding: '11px 13px',
  borderRadius: 11,
  border: `1.5px solid ${C.border}`,
  background: '#fff',
  fontSize: 13.5,
};

export function PageTitle({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22, animation: 'fadeUp .45s ease both' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: -0.7 }}>{title}</h1>
        {sub && <p style={{ margin: '5px 0 0', color: C.muted, fontSize: 13.5 }}>{sub}</p>}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>{actions}</div>
    </div>
  );
}

export function AButton({
  children,
  onClick,
  variant = 'primary',
  small,
  disabled,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'accent' | 'ghost' | 'danger' | 'soft';
  small?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const v: Record<string, CSSProperties> = {
    primary: { background: C.primary, color: '#fff' },
    accent: { background: C.accent, color: C.primaryDark },
    ghost: { background: '#fff', color: C.primary, border: `1.5px solid ${C.border}` },
    danger: { background: C.dangerSoft, color: C.danger },
    soft: { background: C.tint, color: C.primary },
  };
  return (
    <button
      type={type}
      className="tap"
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: small ? '7px 12px' : '10px 16px',
        borderRadius: 11,
        fontWeight: 700,
        fontSize: small ? 12 : 13.5,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        opacity: disabled ? 0.5 : 1,
        whiteSpace: 'nowrap',
        ...v[variant],
      }}
    >
      {children}
    </button>
  );
}

export function Tag({ children, tone }: { children: ReactNode; tone: 'green' | 'red' | 'amber' | 'blue' | 'gray' | 'dark' }) {
  const t: Record<string, CSSProperties> = {
    green: { background: C.successSoft, color: C.success },
    red: { background: C.dangerSoft, color: C.danger },
    amber: { background: C.warnSoft, color: C.warn },
    blue: { background: C.infoSoft, color: C.info },
    gray: { background: '#eef2f1', color: C.muted },
    dark: { background: C.primary, color: '#fff' },
  };
  return (
    <span style={{ ...t[tone], fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 99, whiteSpace: 'nowrap', display: 'inline-block' }}>
      {children}
    </span>
  );
}

export function Kpi({
  icon,
  label,
  value,
  prefix,
  suffix,
  decimals,
  delta,
  tone = 'green',
  delay = 0,
}: {
  icon: IconName;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delta?: string;
  tone?: 'green' | 'red' | 'amber';
  delay?: number;
}) {
  const col = tone === 'green' ? C.success : tone === 'red' ? C.danger : C.warn;
  return (
    <div className="lift" style={{ ...panel, padding: 18, animation: `fadeUp .5s ease ${delay}ms both` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: C.tint, display: 'grid', placeItems: 'center' }}>
          <Icon name={icon} size={19} color={C.primary} />
        </div>
        {delta && <Tag tone={tone}>{delta}</Tag>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, margin: '14px 0 2px', color: tone === 'red' ? col : C.text }}>
        <CountUp to={value} prefix={prefix} suffix={suffix} decimals={decimals ?? 0} duration={1300} />
      </div>
      <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export function Modal({ title, onClose, children, width = 560 }: { title: string; onClose: () => void; children: ReactNode; width?: number }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'grid', placeItems: 'center', background: 'rgba(6,51,46,.5)', animation: 'fadeIn .2s ease' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width, maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 22, padding: 24, animation: 'bounceIn .35s ease', boxShadow: '0 30px 80px rgba(0,0,0,.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{title}</h2>
          <button onClick={onClose} aria-label="Close"><Icon name="x" size={22} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 11.5, fontWeight: 800, color: C.muted, marginBottom: 6, letterSpacing: 0.3 }}>{label}</div>
      {children}
    </label>
  );
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{ width: 44, height: 25, borderRadius: 99, background: on ? C.primary : C.border, position: 'relative', transition: 'background .25s ease', flexShrink: 0 }}
    >
      <span style={{ position: 'absolute', top: 3, left: on ? 22 : 3, width: 19, height: 19, borderRadius: 99, background: '#fff', transition: 'left .25s ease', boxShadow: '0 1px 4px rgba(0,0,0,.25)' }} />
    </button>
  );
}
