import { useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { TinPrefix, clamp2dpStr, composeTin, fmtAmountStr, parseTin } from '@/lib/tax';

/** Money entry: raw string while editing (so a trailing "." survives each
 *  keystroke), thousands-grouped on blur (1000.5 → 1,000.50). Accepts at
 *  most two decimals as you type. */
export function MoneyInput({ value, onChange, ariaLabel }: { value: string; onChange: (s: string) => void; ariaLabel?: string }) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft !== null ? draft : value === '' ? '' : fmtAmountStr(value);
  return (
    <input
      className="input mono"
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder="0"
      aria-label={ariaLabel}
      value={shown}
      onFocus={() => setDraft(value)}
      onBlur={() => setDraft(null)}
      onChange={(e) => {
        const c = clamp2dpStr(e.target.value);
        setDraft(c);
        onChange(c);
      }}
    />
  );
}

/** Format-enforcing TIN input: prefix picker + digits-only box (max 11).
 *  You can't type an invalid TIN — non-digits are stripped, pasting a full
 *  "IG845462070" routes the prefix automatically, and a live counter shows
 *  progress to the 9–11 digit LHDN format. */
export function TinInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { prefix, digits } = parseTin(value);
  const digitsRef = useRef<HTMLInputElement>(null);
  const set = (p: TinPrefix, d: string) => onChange(composeTin(p, d));
  const n = digits.length;
  return (
    <>
      <div style={{ display: 'flex', gap: 8 }}>
        <select
          className="input"
          aria-label="TIN prefix"
          style={{ width: 86, flex: 'none' }}
          value={prefix}
          onChange={(e) => { set(e.target.value as TinPrefix, digits); digitsRef.current?.focus(); }}
        >
          <option value="IG">IG</option>
          <option value="SG">SG</option>
          <option value="OG">OG</option>
        </select>
        <input
          ref={digitsRef}
          className="input mono"
          inputMode="numeric"
          autoComplete="off"
          placeholder="845462070"
          aria-label="TIN digits"
          maxLength={11}
          value={digits}
          onChange={(e) => {
            const v = e.target.value;
            const pasted = v.trim().toUpperCase().match(/^(IG|SG|OG)/);
            set(pasted ? (pasted[1] as TinPrefix) : prefix, v);
          }}
        />
      </div>
      <div className="text-muted" style={{ fontSize: 11.5, marginTop: 4 }}>
        {n === 0 ? (
          <>Optional — IG + 9–11 digits, from MyTax · <span lang="ms">Pilihan — IG diikuti 9–11 digit</span></>
        ) : n < 9 ? (
          <>{n} of 9–11 digits · <span lang="ms">{9 - n} digit lagi minimum</span></>
        ) : (
          <>✓ Valid format · <span lang="ms">Format betul</span> ({n}/11)</>
        )}
      </div>
    </>
  );
}

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
