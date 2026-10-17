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

/** Infinite horizontal ticker. */
export function Marquee({ children, speed = 26 }: { children: ReactNode; speed?: number }) {
  return (
    <div style={{ overflow: 'hidden', width: '100%' }}>
      <div style={{ display: 'flex', width: 'max-content', animation: `marquee ${speed}s linear infinite` }}>
        <div style={{ display: 'flex', gap: 12, paddingRight: 12 }}>{children}</div>
        <div style={{ display: 'flex', gap: 12, paddingRight: 12 }} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Live countdown to a moving target (resets daily at midnight-ish). */
export function useCountdown(hours = 6): { h: string; m: string; s: string } {
  const [left, setLeft] = useState(hours * 3600 - 2 * 60 - 17);
  useEffect(() => {
    const t = window.setInterval(() => setLeft((n) => (n <= 0 ? hours * 3600 : n - 1)), 1000);
    return () => window.clearInterval(t);
  }, [hours]);
  const p = (n: number) => String(n).padStart(2, '0');
  return { h: p(Math.floor(left / 3600)), m: p(Math.floor((left % 3600) / 60)), s: p(left % 60) };
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
