import type { ReactNode } from 'react';

export function Wordmark({ width = 158 }: { width?: number }) {
  return (
    <svg width={width} height={width * (66 / 320) * 0.98} viewBox="0 0 320 66" aria-label="duitback" role="img">
      <text x="2" y="56" fontFamily="var(--font-heading)" fontSize="36" fontWeight="800" letterSpacing="-1" fill="#201e1d">
        du&#305;tback<tspan fill="#ec3013">.</tspan>
      </text>
      <g transform="translate(50,24)">
        <g fill="#ec3013">
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse key={deg} cx="0" cy="-5.4" rx="3.4" ry="5.4" transform={`rotate(${deg})`} />
          ))}
        </g>
        <circle r="1.8" fill="#201e1d" />
        <line x1="0.7" y1="-1" x2="5.8" y2="-7.1" stroke="#201e1d" strokeWidth="0.9" />
        <g fill="#201e1d">
          <circle cx="6.4" cy="-7.8" r="0.8" />
          <circle cx="7.8" cy="-7.8" r="0.8" />
          <circle cx="6.4" cy="-9.1" r="0.8" />
          <circle cx="7.8" cy="-9.1" r="0.8" />
        </g>
      </g>
    </svg>
  );
}

export function Kicker({ children, onRed = false }: { children: ReactNode; onRed?: boolean }) {
  return (
    <div
      className="kick"
      style={{
        color: onRed ? 'inherit' : 'var(--color-accent)',
        textTransform: 'uppercase',
        letterSpacing: '.1em',
        fontFamily: 'var(--font-heading)',
        fontWeight: 800,
        fontSize: 11,
      }}
    >
      {children}
    </div>
  );
}

type CtaVariant = 'primary' | 'secondary' | 'ghost';

export function CtaLink({
  href,
  variant = 'primary',
  external = false,
  children,
}: {
  href: string;
  variant?: CtaVariant;
  external?: boolean;
  children: ReactNode;
}) {
  return (
    <a className={`btn btn-${variant}`} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
    </a>
  );
}

export function Section({
  id,
  kicker,
  title,
  children,
}: {
  id?: string;
  kicker: ReactNode;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="wrap section" id={id}>
      <Kicker>{kicker}</Kicker>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function FeatureCell({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="cell">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

export function Step({ n, title, children }: { n: number; title: ReactNode; children: ReactNode }) {
  return (
    <div className="step">
      <div className="num">{n}</div>
      <div>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </div>
  );
}
