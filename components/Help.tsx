'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CATS, CHILDSUB, SUBLIMITS, capFor, fmt, subCap } from '@/lib/tax';
import { RELIEF_HELP } from '@/lib/reliefHelp';

const NARROW = '(max-width: 719px)';

/** An "i" button that opens a popover: anchored under the button on wide screens, a bottom sheet on
 *  phones. Non-modal — Escape, the Close button, or a tap outside closes it. Used on the claims table,
 *  in the claim form and on the public reliefs page, so every "what counts" looks the same. */
export function Help({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const close = () => { setOpen(false); btn.current?.focus(); };

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const b = btn.current, p = pop.current;
      if (!b || !p) return;
      if (typeof matchMedia === 'function' && matchMedia(NARROW).matches) { setPos(null); return; }
      const r = b.getBoundingClientRect();
      const w = p.offsetWidth, h = p.offsetHeight, gap = 8, edge = 12;
      const left = Math.max(edge, Math.min(r.left - 10, window.innerWidth - w - edge));
      const fitsBelow = r.bottom + gap + h <= window.innerHeight - edge;
      const top = fitsBelow || r.top - gap - h < edge ? Math.min(r.bottom + gap, window.innerHeight - h - edge) : r.top - gap - h;
      setPos({ top: Math.max(edge, top), left });
    };
    place();
    pop.current?.focus();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { const t = e.target as Node; if (!pop.current?.contains(t) && !btn.current?.contains(t)) setOpen(false); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);

  return (
    <span className="help" onClick={(e) => e.stopPropagation()}>
      <button ref={btn} type="button" className="help-btn" aria-label={label} title={label} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}><span aria-hidden="true">i</span></button>
      {open && createPortal(
        <>
          <div className="help-dim" onClick={close} />
          <div ref={pop} className="help-pop" role="dialog" aria-label={label} tabIndex={-1} style={pos ? { top: pos.top, left: pos.left } : undefined}
            onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } }}>
            <div className="help-panel">{children}</div>
            <button type="button" className="help-close" aria-label="Close · Tutup" onClick={close}>×</button>
          </div>
        </>,
        document.body,
      )}
    </span>
  );
}

/** What one relief category covers this year: cap, sub-limits, who, counts, doesn't count, proof. */
export function CatHelp({ id, ya }: { id: string; ya: number }) {
  const cat = CATS.find((c) => c.id === id);
  const h = RELIEF_HELP[id];
  if (!cat || !h) return null;
  const cap = cat.cap === null ? null : capFor(id, ya);
  const subs = SUBLIMITS[id];
  const capLine = id === 'donation' ? '10% of aggregate income; gifts to government unlimited'
    : id === 'child' ? 'per child, no overall ceiling'
    : cap === 0 ? 'not available in YA' + ya
    : fmt(cap ?? 0) + ' · YA' + ya;
  return (
    <Help label={'What counts · ' + cat.en}>
      <div className="help-head">
        <div className="help-title">{cat.en} <span lang="ms">· {cat.bm}</span></div>
        <div className="help-cap">{capLine}</div>
      </div>
      <div className="help-who">For: {h.who}</div>
      {subs && (
        <table className="help-subs"><tbody>
          {subs.map((s) => { const sc = subCap(id, s.id, ya); return <tr key={s.id}><td>{s.label}</td><td>{sc === null ? 'up to cap' : fmt(sc)}</td></tr>; })}
        </tbody></table>
      )}
      {id === 'child' && (
        <table className="help-subs"><tbody>{CHILDSUB.map((s) => <tr key={s.id}><td colSpan={2}>{s.label}</td></tr>)}</tbody></table>
      )}
      <div className="help-h can">Counts</div>
      <ul className="can">{h.can.map((t, i) => <li key={i}>{t}</li>)}</ul>
      {h.lists?.map((l) => (
        <p key={l.title} className="help-list"><b>{l.title}:</b> {l.items.join(', ')}.</p>
      ))}
      <div className="help-h cant">Doesn't count</div>
      <ul className="cant">{h.cant.map((t, i) => <li key={i}>{t}</li>)}</ul>
      <p className="help-proof"><b>Keep:</b> {h.proof}</p>
      <p lang="ms">{h.bm}</p>
    </Help>
  );
}
