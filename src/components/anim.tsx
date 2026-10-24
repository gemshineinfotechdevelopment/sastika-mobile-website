import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/** Returns [ref, seen] — flips to true once the element scrolls into view. */
export function useInView<T extends HTMLElement>(threshold = 0.15): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

type Dir = 'up' | 'left' | 'right' | 'zoom' | 'fade';

const FROM: Record<Dir, string> = {
  up: 'translateY(28px)',
  left: 'translateX(-34px)',
  right: 'translateX(34px)',
  zoom: 'scale(.88)',
  fade: 'none',
};

/** Scroll-triggered reveal wrapper. */
export function Reveal({
  children,
  delay = 0,
  dir = 'up',
  style,
}: {
  children: ReactNode;
  delay?: number;
  dir?: Dir;
  style?: CSSProperties;
}) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? 'none' : FROM[dir],
        transition: `opacity .7s ease ${delay}ms, transform .7s cubic-bezier(.2,.8,.2,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Counts up to a number when scrolled into view. */
export function CountUp({
  to,
  duration = 1600,
  prefix = '',
  suffix = '',
  decimals = 0,
  start,
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  start?: boolean;
}) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.3);
  const [val, setVal] = useState(0);
  const go = start ?? seen;
  useEffect(() => {
    if (!go) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go, to, duration]);
  const shown = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString('en-IN');
  return (
    <span ref={ref}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

/** Cycles through words with a typing / deleting effect. */
export function Typewriter({ words, speed = 90, pause = 1400 }: { words: string[]; speed?: number; pause?: number }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [del, setDel] = useState(false);
  useEffect(() => {
    const word = words[i % words.length];
    let t: number;
    if (!del && text === word) t = window.setTimeout(() => setDel(true), pause);
    else if (del && text === '') {
      setDel(false);
      setI((n) => n + 1);
    } else {
      t = window.setTimeout(
        () => setText(del ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)),
        del ? speed / 2 : speed,
      );
    }
    return () => window.clearTimeout(t);
  }, [text, del, i, words, speed, pause]);
  return (
    <span>
      {text}
      <span style={{ animation: 'blink 1s steps(1) infinite', marginLeft: 2 }}>|</span>
    </span>
  );
}

/** Infinite horizontal ticker with seamless continuous rotation. */
export function Marquee({
  children,
  speed = 28,
  pauseOnHover = true,
  repeat = 4,
}: {
  children: ReactNode;
  speed?: number;
  pauseOnHover?: boolean;
  repeat?: number;
}) {
  const reps = Array.from({ length: Math.max(1, repeat) });
  return (
    <div
      className={pauseOnHover ? 'marquee-wrap' : ''}
      style={{
        overflow: 'hidden',
        width: '100%',
        position: 'relative',
        maskImage: 'linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)',
      }}
    >
      <div
        className="marquee-track"
        style={{
          display: 'flex',
          width: 'max-content',
          animation: `marquee ${speed}s linear infinite`,
          willChange: 'transform',
        }}
      >
        <div style={{ display: 'flex', gap: 12, paddingRight: 12, alignItems: 'center' }}>
          {reps.map((_, i) => (
            <div key={`track1-grp-${i}`} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {children}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, paddingRight: 12, alignItems: 'center' }} aria-hidden="true">
          {reps.map((_, i) => (
            <div key={`track2-grp-${i}`} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {children}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Live countdown supporting either hours duration or specific target timestamp string. */
export function useCountdown(hoursOrTarget?: number | string): {
  d: string;
  h: string;
  hh: string;
  m: string;
  s: string;
  days: number;
  hours: number;
  mins: number;
  secs: number;
  totalSeconds: number;
  isExpired: boolean;
} {
  const calculateLeft = () => {
    if (typeof hoursOrTarget === 'string' && hoursOrTarget.trim()) {
      const targetTime = new Date(hoursOrTarget).getTime();
      if (!isNaN(targetTime)) {
        return Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
      }
    }
    const hrs = typeof hoursOrTarget === 'number' ? hoursOrTarget : 6;
    return Math.max(0, hrs * 3600);
  };

  const [left, setLeft] = useState(calculateLeft);

  useEffect(() => {
    setLeft(calculateLeft());
    const t = window.setInterval(() => {
      setLeft((n) => {
        if (typeof hoursOrTarget === 'string' && hoursOrTarget.trim()) {
          const targetTime = new Date(hoursOrTarget).getTime();
          if (!isNaN(targetTime)) {
            return Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
          }
        }
        return Math.max(0, n - 1);
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [hoursOrTarget]);

  const p = (n: number) => String(Math.max(0, n)).padStart(2, '0');
  const d = Math.floor(left / 86400);
  const h = Math.floor((left % 86400) / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  const totalHours = Math.floor(left / 3600);

  return {
    d: p(d),
    h: p(totalHours),
    hh: p(h),
    m: p(m),
    s: p(s),
    days: d,
    hours: totalHours,
    mins: m,
    secs: s,
    totalSeconds: left,
    isExpired: left <= 0,
  };
}

/** Animated bar that fills when visible. */
export function FillBar({ pct, color, bg, height = 8 }: { pct: number; color: string; bg: string; height?: number }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.3);
  return (
    <div ref={ref} style={{ height, background: bg, borderRadius: 99, overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          width: seen ? `${pct}%` : '0%',
          background: color,
          borderRadius: 99,
          transition: 'width 1.2s cubic-bezier(.2,.8,.2,1) .2s',
        }}
      />
    </div>
  );
}
