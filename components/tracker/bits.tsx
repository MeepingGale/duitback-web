import type { CSSProperties, ReactNode } from 'react';

export function Kick({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div className="kick" style={style}>{children}</div>;
}

export function Bar({ pct, over }: { pct: number; over?: boolean }) {
  return (
    <div className="bar">
      <i className={over ? 'over' : ''} style={{ width: pct + '%' }} />
    </div>
  );
}

export interface YaTab {
  label: string;
  on: boolean;
  pick: () => void;
}

export function YaTabs({ tabs, onAddYear }: { tabs: YaTab[]; onAddYear?: () => void }) {
  return (
    <div style={{ display: 'inline-flex', border: '1px solid var(--color-divider)' }}>
      {tabs.map((t) => (
        <span key={t.label} className={'yatab' + (t.on ? ' on' : '')} onClick={t.pick}>
          {t.label}
        </span>
      ))}
      {onAddYear && (
        <span className="yatab" onClick={onAddYear} title="Add next year">
          +
        </span>
      )}
    </div>
  );
}

export function Wordmark({ width = 132 }: { width?: number }) {
  const h = Math.round(width * (27 / 132));
  return (
    <svg width={width} height={h} viewBox="0 0 320 66" aria-label="duitback">
      <text x="2" y="56" fontFamily="Archivo, Arial, sans-serif" fontSize="36" fontWeight="800" letterSpacing="-1" fill="#201e1d">
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

export const pagepad = (maxWidth: number): CSSProperties => ({
  padding: '28px 36px 40px',
  maxWidth,
  width: '100%',
  margin: '0 auto',
  boxSizing: 'border-box',
});

export const yaHead: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
};

export const right: CSSProperties = { textAlign: 'right' };
export const heading800: CSSProperties = { fontFamily: 'var(--font-heading)', fontWeight: 800 };
