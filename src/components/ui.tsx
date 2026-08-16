import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand text-white hover:bg-brand-deep active:translate-y-px shadow-[0_1px_2px_rgba(16,32,64,.16)]',
  secondary:
    'bg-white text-ink border border-line hover:border-brand hover:text-brand active:translate-y-px',
  ghost: 'text-ink-soft hover:text-brand',
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...rest}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-[0.95rem] font-medium transition-[background-color,color,border-color,transform] duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 flex items-center gap-2.5 text-sm font-medium text-brand">
      <span className="rule-accent" aria-hidden="true" />
      {children}
    </p>
  );
}

export function Band({
  tone = 'white',
  children,
  className = '',
  id,
}: {
  tone?: 'white' | 'tint' | 'deep';
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const tones = {
    white: 'bg-white',
    tint: 'bg-surface',
    deep: 'bg-brand-deep text-white',
  };
  return (
    <section id={id} className={`${tones[tone]} ${className}`}>
      <div className="shell py-14 md:py-20">{children}</div>
    </section>
  );
}

/**
 * The connectivity motif: nodes joined by traced strokes. Used as the hero
 * ground and again on the processing screen so the two read as one system.
 */
export function NodeField({ className = '' }: { className?: string }) {
  const nodes = [
    [10, 68],
    [26, 30],
    [44, 76],
    [58, 38],
    [76, 62],
    [90, 26],
  ];
  const links: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [1, 3],
    [2, 4],
  ];
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      {links.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="currentColor"
          strokeWidth="0.28"
          strokeDasharray="60"
          strokeDashoffset="60"
          style={{ animation: `trace 1.4s ${0.15 * i}s var(--ease-out-expo) forwards` }}
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="1.5"
          fill="currentColor"
          style={{ animation: `pulse-node 4s ${0.3 * i}s ease-in-out infinite` }}
        />
      ))}
    </svg>
  );
}

export function Dial({ value, label }: { value: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative grid h-40 w-40 shrink-0 place-items-center">
      <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-line)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.1s var(--ease-out-expo)' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="tnum font-display text-[2.75rem] leading-none text-ink">{value}</div>
        <div className="mt-1 text-xs text-ink-mute">{label}</div>
      </div>
    </div>
  );
}

export function Meter({
  label,
  value,
  confidence,
}: {
  label: string;
  value: number;
  confidence: 'low' | 'moderate' | 'good';
}) {
  return (
    <div className="print-block py-3">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[0.9rem] font-medium text-ink">{label}</span>
        <span className="tnum text-[0.9rem] text-ink-soft">
          {value}
          <span className="text-ink-mute">/100</span>
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-soft">
          <div
            className="h-full rounded-full bg-cyan-deep"
            style={{ width: `${value}%`, transition: 'width 0.9s var(--ease-out-expo)' }}
          />
        </div>
        <span className="w-28 shrink-0 text-right text-xs whitespace-nowrap text-ink-mute">
          {confidence} evidence
        </span>
      </div>
    </div>
  );
}

export function Note({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warn' }) {
  return (
    <p
      className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${
        tone === 'warn'
          ? 'border-gold/50 bg-gold/8 text-ink'
          : 'border-line bg-surface text-ink-soft'
      }`}
    >
      {children}
    </p>
  );
}
