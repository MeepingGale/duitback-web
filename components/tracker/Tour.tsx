import { useEffect, useState } from 'react';
import type { Screen } from './App';
import { Kick } from './bits';

export interface TourStep {
  screen: Screen;
  target: string;
  t: string;
  b: string;
}

// The guided tour: each step switches to a screen and spotlights the element
// carrying the matching data-tour attribute.
export const TOUR: TourStep[] = [
  {
    screen: 'dash',
    target: 'new-claim',
    t: 'Add claims as you spend',
    b: 'This button follows you on every screen. Hit it whenever you spend on something claimable — books, clinic visits, PRS top-ups — and totals, caps and the refund estimate update live.',
  },
  {
    screen: 'claims',
    target: 'caps-table',
    t: 'Watch your caps',
    b: 'Every LHDN relief with its cap and what is left this year. Click a row to see the claim lines behind it; over-cap entries are saved but flagged — only the allowed amount counts.',
  },
  {
    screen: 'receipts',
    target: 'drop-zone',
    t: 'Drop receipts in the vault',
    b: 'Drag receipts here and tag them to a relief. LHDN can audit up to 7 years back — the vault keeps the evidence next to the claim.',
  },
  {
    screen: 'pack',
    target: 'pack-sheet',
    t: 'File from the pack in March',
    b: 'When e-Filing opens, this cheat-sheet shows every number to type into MyTax, with the receipts behind each line. Print it or save as PDF — and always confirm figures in MyTax.',
  },
  {
    screen: 'dash',
    target: 'poster',
    t: 'Your running total',
    b: 'This block keeps score all year — what you have claimed and the live refund estimate. That is the whole loop. Jom mula!',
  },
];

const CARD_W = 400;
const GAP = 14;

interface Box { top: number; left: number; width: number; height: number }

// Clamp a target's rect to the visible viewport, so a target taller than the
// screen still reads as a spotlight instead of swallowing the dim layer.
function clampToViewport(r: DOMRect): Box {
  const vw = window.innerWidth, vh = window.innerHeight;
  let top = Math.max(r.top, 0);
  // only big targets get pushed below the sticky nav — small ones (like the
  // nav's own button) must keep their true position
  if (r.height > vh * 0.5) top = Math.max(top, 64);
  const bottom = Math.min(r.bottom, vh - 24);
  const left = Math.max(r.left, 8);
  const right = Math.min(r.right, vw - 8);
  return { top, left, width: Math.max(40, right - left), height: Math.max(40, bottom - top) };
}

export function Tour({ step, onNext, onBack, onDone }: { step: number; onNext: () => void; onBack: () => void; onDone: () => void }) {
  const info = TOUR[step - 1];
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    let raf = 0;
    let tries = 0;
    let cancelled = false;
    setBox(null);
    const find = () => document.querySelector(`[data-tour="${info.target}"]`);
    const measure = () => {
      if (cancelled) return;
      const el = find();
      if (!el) {
        if (tries++ < 30) raf = requestAnimationFrame(measure);
        return;
      }
      const tall = el.getBoundingClientRect().height > window.innerHeight * 0.7;
      el.scrollIntoView({ block: tall ? 'start' : 'center' });
      // let the scroll settle before reading the rect
      raf = requestAnimationFrame(() => { if (!cancelled) setBox(clampToViewport(el.getBoundingClientRect())); });
    };
    measure();
    const sync = () => { const el = find(); if (el && !cancelled) setBox(clampToViewport(el.getBoundingClientRect())); };
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, [step, info.target]);

  const last = step >= TOUR.length;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const rect = box;
  const cardLeft = rect ? Math.min(Math.max(16, rect.left), Math.max(16, vw - CARD_W - 16)) : undefined;
  const below = rect ? rect.top + rect.height + 240 < vh || rect.top < 220 : true;

  return (
    <>
      {/* click blocker while the tour drives */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 55 }} />
      {/* spotlight — the dim layer is this element's giant shadow, so the target stays bright */}
      {rect ? (
        <div
          style={{
            position: 'fixed',
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: '0 0 0 9999px color-mix(in srgb, var(--color-text) 55%, transparent)',
            outline: '3px solid var(--color-accent)',
            zIndex: 56,
            pointerEvents: 'none',
            transition: 'top .25s, left .25s, width .25s, height .25s',
          }}
        />
      ) : (
        <div style={{ position: 'fixed', inset: 0, background: 'color-mix(in srgb, var(--color-text) 55%, transparent)', zIndex: 56, pointerEvents: 'none' }} />
      )}
      <div
        role="dialog"
        aria-label={'Quick tour step ' + step + ' of ' + TOUR.length + ': ' + info.t}
        style={{
          position: 'fixed',
          zIndex: 60,
          width: 'min(' + CARD_W + 'px, calc(100vw - 32px))',
          background: 'var(--color-bg)',
          border: '2px solid var(--color-text)',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-lg)',
          ...(rect
            ? below
              ? { top: Math.min(rect.top + rect.height + GAP, vh - 240), left: cardLeft }
              : { bottom: vh - rect.top + GAP, left: cardLeft }
            : { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }),
        }}
      >
        <Kick>Quick tour · Jom tengok · {step} of {TOUR.length}</Kick>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 19, margin: '8px 0 6px' }}>{info.t}</h3>
        <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: '0 0 16px', color: 'var(--color-neutral-800)' }}>{info.b}</p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {last ? (
            <button className="btn btn-primary" onClick={onDone}>Start tracking →</button>
          ) : (
            <button className="btn btn-primary" onClick={onNext}>Next →</button>
          )}
          {step > 1 && <button className="btn btn-secondary" onClick={onBack}>← Back</button>}
          {!last && (
            <button className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={onDone}>Skip tour</button>
          )}
        </div>
      </div>
    </>
  );
}
