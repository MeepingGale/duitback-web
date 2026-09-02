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
  // Small accent text uses the deep ramp step (DS guidance: the base accent is
  // only 3.75:1 on this ground — enough for large text, not small). On the red
  // poster the kicker goes display-grade instead, where 3:1 is the bar.
  return (
    <div
      className="kick"
      style={{
        color: onRed ? 'inherit' : 'var(--color-accent-700)',
        textTransform: 'uppercase',
        letterSpacing: '.1em',
        fontFamily: 'var(--font-heading)',
        fontWeight: 800,
        fontSize: onRed ? 19 : 11,
      }}
    >
      {children}
    </div>
  );
}

type CtaVariant = 'primary' | 'secondary' | 'ghost' | 'onRed';
/* onRed: the light button that sits on a red poster band — display-grade so it clears contrast */
const ON_RED = { background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 19, fontWeight: 800 } as const;

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
    <a className={variant === 'onRed' ? 'btn' : `btn btn-${variant}`} style={variant === 'onRed' ? ON_RED : undefined} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
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

// One header bar for the whole site — the same .nav shell the tracker uses,
// so landing, reliefs page and app read as one product.
export function SiteHeader({ home = './' }: { home?: string }) {
  return (
    <header className="nav" style={{ flexWrap: 'wrap', position: 'sticky', top: 0, background: 'var(--color-bg)', zIndex: 5 }}>
      <span className="nav-brand" style={{ display: 'inline-flex', alignItems: 'center' }}>
        <a href={home} aria-label="duıtback. — home" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <Wordmark width={132} />
        </a>
      </span>
      <a href={home + 'reliefs/'}>Relief list · Pelepasan</a>
      <a href={home + 'pcb/'}>PCB calculator</a>
      <a className="btn btn-primary" href={home + 'app/'} style={{ fontSize: 14 }}>
        Open the tracker →
      </a>
    </header>
  );
}

// One footer everywhere; the app passes the tax-file number it shows.
export function SiteFooter({ taxNo, wide = false }: { taxNo?: string; wide?: boolean }) {
  return (
    <footer
      className={wide ? 'site-footer no-print' : 'wrap site-footer no-print'}
      style={wide ? { paddingInline: 36, marginTop: 'auto' } : undefined}
    >
      <span>
        DuitBack — unofficial tracker · YA2025 schedule · estimates only · <span lang="ms">anggaran sahaja</span> · not
        affiliated with LHDN — confirm every figure in MyTax before filing.
      </span>
      <span style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <a href="https://ko-fi.com/duitback" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          DuitBack is free · belanja teh tarik →
        </a>
        <a href="https://github.com/MeepingGale/duitback-web" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        {taxNo ? <span style={{ color: 'var(--color-neutral-700)' }}>{taxNo}</span> : null}
      </span>
    </footer>
  );
}
