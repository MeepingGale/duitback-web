import { useEffect, useRef, useState } from 'react';
import type { Screen } from './App';
import { CalcResult, Data, derivedReliefs } from '@/lib/tax';
import { deadlineInfo } from './derive';
import { familySetUp } from '@/lib/data';
import { useDialogKeys } from './bits';
import { Kick } from './bits';

export interface TourCopy { t: string; b: string; bm: string }

/** What the tour knows about the person — built from their data, never guessed. */
export interface TourCtx {
  name: string;
  ya: string;
  yaNum: number;
  married: boolean;
  spouseSet: boolean;
  children: number;
  fixed: number; // fixed reliefs already counted from the profile
  claims: number;
  receipts: number;
  totalIncome: number;
  balance: number;
  deadline: string;
  familySet: boolean;
}

export interface TourStep {
  screen: Screen;
  target: string;
  copy: (x: TourCtx) => TourCopy;
}

const rm = (n: number) => 'RM ' + Math.round(n).toLocaleString('en-MY');

// The guided tour: each step switches to a screen and spotlights the element
// carrying the matching data-tour attribute. Copy is written for the person
// taking it — their name, their year, their household.
export const TOUR: TourStep[] = [
  {
    screen: 'dash',
    target: 'new-claim',
    copy: (x) => ({
      t: 'Hello, ' + x.name + " — let's set up " + x.ya,
      b: (x.claims ? 'You already have ' + x.claims + ' claim line' + (x.claims === 1 ? '' : 's') + ' for ' + x.ya + '. ' : 'Nothing logged for ' + x.ya + ' yet — that changes now. ') +
        'This button follows you on every screen: tap it whenever you spend on something claimable — a clinic visit, books, a PRS top-up — and your caps and refund estimate update on the spot.',
      bm: 'Butang ini ada di setiap skrin. Tekan setiap kali anda berbelanja untuk sesuatu yang boleh dituntut — had dan anggaran bayaran balik dikemas kini serta-merta.',
    }),
  },
  {
    screen: 'claims',
    target: 'caps-table',
    copy: (x) => ({
      t: 'Your caps for ' + x.ya + ' · Had anda',
      b: x.name + ', you get RM 9,000 individual relief without lifting a finger' +
        (x.fixed ? ' — plus ' + rm(x.fixed) + ' already counted from your profile' : '') +
        '. Everything else needs receipts, and this table keeps score: every LHDN relief, its cap, and what is left. Over-cap lines are kept but only the allowed amount counts.',
      bm: 'RM 9,000 pelepasan individu diberi automatik' + (x.fixed ? ' — dan ' + rm(x.fixed) + ' lagi daripada profil anda' : '') + '. Selebihnya perlukan resit; jadual ini tunjuk setiap had dan bakinya.',
    }),
  },
  {
    screen: 'settings',
    target: 'family',
    copy: (x) => ({
      t: 'Who you are counts · Siapa anda dikira',
      b: x.married
        ? (x.spouseSet
            ? 'You are married with ' + (x.children ? x.children + (x.children === 1 ? ' child' : ' children') : 'no children') + ' on file. Keep this section current — spouse relief (RM 4,000), disabled-person reliefs and RM 2,000–16,000 per child are counted from it automatically, every year, no receipts.'
            : "You're married — tell DuitBack here whether your spouse has income and how many children you have. Spouse relief (RM 4,000) and RM 2,000–16,000 per child are then counted automatically, every year, no receipts.")
        : 'Disabled-person status and children live here — set once, counted for every year without receipts. Nothing to set right now? That is fine, just carry on.',
      bm: x.married
        ? 'Nyatakan sama ada pasangan bekerja dan bilangan anak — pelepasan pasangan RM 4,000 dan RM 2,000–16,000 seanak dikira automatik setiap tahun.'
        : 'Status OKU dan bilangan anak ditetapkan di sini — sekali sahaja, dikira setiap tahun tanpa resit.',
    }),
  },
  {
    screen: 'receipts',
    target: 'drop-zone',
    copy: (x) => ({
      t: 'Keep the evidence · Simpan bukti',
      b: 'LHDN can ask for receipts up to seven years back, ' + x.name + '. Drop them here — or use the camera on your phone — and tag each one to a relief. ' +
        (x.receipts ? 'You have ' + x.receipts + ' in the vault for ' + x.ya + ' so far. ' : '') +
        'Files stay in this browser and travel with your vault export.',
      bm: 'LHDN boleh minta resit sehingga tujuh tahun. Seret ke sini atau guna kamera, tag kepada pelepasan — fail kekal dalam pelayar ini dan ikut eksport peti anda.',
    }),
  },
  {
    screen: 'income',
    target: 'income-sources',
    copy: (x) => ({
      t: 'Salary in, PCB out · Gaji masuk, PCB keluar',
      b: (x.totalIncome ? 'Your income is in. ' : 'Enter your salary and bonus here. ') +
        'PCB is estimated for you with the same formula LHDN gives payroll systems — type the figure from your EA form to override it. ' +
        (x.married ? 'Being married, you also get the joint-versus-separate assessment comparison on this screen. ' : '') +
        'Rental, freelance, dividends and a retrenchment payout each have their own place.',
      bm: 'Masukkan gaji dan bonus — PCB dianggar dengan formula LHDN, taip angka borang EA untuk menggantikannya.' + (x.married ? ' Perbandingan taksiran bersama dan berasingan juga ada di sini.' : ''),
    }),
  },
  {
    screen: 'pack',
    target: 'pack-sheet',
    copy: (x) => ({
      t: 'File from the pack · Failkan dari pek',
      b: 'e-Filing for ' + x.ya + ' opens on 1 March ' + (x.yaNum + 1) + ' and closes ' + x.deadline + '. This page will have every number to type into MyTax, with the receipts behind each line — save it as a PDF and take it with you. Always confirm the figures in MyTax.',
      bm: 'e-Filing ' + x.ya + ' dibuka 1 Mac ' + (x.yaNum + 1) + ', tutup ' + x.deadline + '. Helaian ini ada setiap angka untuk MyTax — simpan sebagai PDF, dan sentiasa sahkan dalam MyTax.',
    }),
  },
  {
    screen: 'dash',
    target: 'poster',
    copy: (x) => ({
      t: "That's the whole loop, " + x.name,
      b: (x.totalIncome
          ? (x.balance < 0 ? 'Right now you are looking at an estimated refund of ' + rm(-x.balance) + '. ' : 'Right now the estimate is ' + rm(x.balance) + ' payable — every relief you log brings that down. ')
          : 'Add your income and the refund estimate here goes live. ') +
        (x.familySet ? 'This block keeps score all year. Replay the tour any time from Settings.' : 'One thing first: tell DuitBack who you are — married, children, OKU — so the fixed reliefs count automatically. That is where you go next.'),
      bm: (x.totalIncome ? (x.balance < 0 ? 'Anggaran bayaran balik anda sekarang ' + rm(-x.balance) + '. ' : 'Anggaran baki sekarang ' + rm(x.balance) + ' — setiap pelepasan mengurangkannya. ') : 'Masukkan pendapatan dan anggaran akan hidup. ') +
        (x.familySet ? 'Ulang jelajah bila-bila masa dari Tetapan.' : 'Langkah seterusnya: tetapkan status keluarga anda supaya pelepasan tetap dikira automatik.'),
    }),
  },
];

/** Build the tour's view of the user from live data. */
export function tourCtx(d: Data, c: CalcResult): TourCtx {
  const yaNum = +d.ya.slice(2);
  const k = d.profile.children;
  return {
    name: d.profile.name && d.profile.name !== 'there' ? d.profile.name : 'there',
    ya: d.ya,
    yaNum,
    married: d.profile.marital === 'married',
    spouseSet: d.profile.spouseWorking !== undefined,
    children: k ? Object.values(k).reduce((a, b) => a + (b || 0), 0) : 0,
    fixed: Object.values(derivedReliefs(d.profile, yaNum)).reduce((a, b) => a + b, 0),
    claims: c.claims.length,
    receipts: d.receipts.filter((r) => r.ya === d.ya).length,
    totalIncome: c.totalIncome,
    balance: c.balance,
    deadline: deadlineInfo(d, d.ya, c).dlLabel,
    familySet: familySetUp(d),
  };
}

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
  const navBottom = document.querySelector('.nav.app-nav')?.getBoundingClientRect().bottom ?? 64;
  if (r.height > vh * 0.5) top = Math.max(top, navBottom + 4);
  const bottom = Math.min(r.bottom, vh - 24);
  const left = Math.max(r.left, 8);
  const right = Math.min(r.right, vw - 8);
  return { top, left, width: Math.max(40, right - left), height: Math.max(40, bottom - top) };
}

export function Tour({ step, d, c, onNext, onBack, onDone }: { step: number; d: Data; c: CalcResult; onNext: () => void; onBack: () => void; onDone: (finished: boolean) => void }) {
  const stepDef = TOUR[step - 1];
  const info = { target: stepDef.target, ...stepDef.copy(tourCtx(d, c)) };
  const [box, setBox] = useState<Box | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = useDialogKeys(ref, () => onDone(false), undefined, step); // Escape = skip

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
        ref={ref}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        aria-label={'Quick tour step ' + step + ' of ' + TOUR.length + ': ' + info.t}
        style={{
          position: 'fixed',
          zIndex: 60,
          width: 'min(' + CARD_W + 'px, calc(100vw - 32px))',
          background: 'var(--color-bg)',
          border: '2px solid var(--color-text)',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          ...(rect
            ? below
              ? { top: Math.min(rect.top + rect.height + GAP, vh - 340), left: cardLeft }
              : { bottom: Math.min(vh - rect.top + GAP, vh - 16), left: cardLeft }
            : { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }),
        }}
      >
        <Kick>Quick tour · Jom tengok · {step} of {TOUR.length}</Kick>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 19, margin: '8px 0 6px' }}>{info.t}</h3>
        <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: '0 0 8px', color: 'var(--color-neutral-800)' }}>{info.b}</p>
        <p lang="ms" style={{ fontSize: 12.5, lineHeight: 1.5, margin: '0 0 16px', color: 'var(--color-neutral-700)' }}>{info.bm}</p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {last ? (
            <button className="btn btn-primary" onClick={() => onDone(true)}>{familySetUp(d) ? 'Start tracking →' : 'Set up my details →'}</button>
          ) : (
            <button className="btn btn-primary" onClick={onNext}>Next →</button>
          )}
          {step > 1 && <button className="btn btn-secondary" onClick={onBack}>← Back</button>}
          {!last && (
            <button className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => onDone(false)}>Skip tour</button>
          )}
        </div>
      </div>
    </>
  );
}
