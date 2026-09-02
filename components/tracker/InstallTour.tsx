import { useRef, useState } from 'react';
import type { InstallEnv } from '@/lib/data';
import { Kick, useDialogKeys } from './bits';
import { DemoWhere, InstallDemo } from './InstallDemo';

type Point = 'bottom-center' | 'top-right' | 'top-left' | null;
interface Step { point: Point; t: string; b: React.ReactNode; bm: string; mock?: 'share' | 'add' | 'dock' | 'menu'; demo?: { phase: 1 | 2 | 3; where: DemoWhere } }

const Share = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12" /><path d="m8 7 4-4 4 4" /><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
  </svg>
);
const Plus = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="4" /><path d="M12 8v8" /><path d="M8 12h8" />
  </svg>
);

/** A row drawn to look like the real control they need to find. */
function Mock({ kind }: { kind: NonNullable<Step['mock']> }) {
  const row = (icon: React.ReactNode, label: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--color-divider)', background: 'var(--color-surface)', padding: '10px 12px', margin: '10px 0 4px', fontSize: 15 }}>
      <span style={{ color: 'var(--color-accent-700)', display: 'inline-flex' }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
  if (kind === 'share') return row(<Share />, 'Share');
  if (kind === 'add') return row(<Plus />, 'Add to Home Screen');
  if (kind === 'dock') return row(<Plus />, 'Add to Dock…');
  return row(<span style={{ fontWeight: 800 }}>⋮</span>, 'Install app · Add to Home screen');
}

function stepsFor(env: InstallEnv, canPrompt: boolean): Step[] {
  const phone = env.device === 'iphone';
  const pad = env.device === 'ipad';
  if (env.browser === 'inapp') {
    return [
      { point: 'top-right', t: 'Open this in Safari first', b: <>You are inside another app&apos;s browser, and those can&apos;t install. Tap the <strong>···</strong> menu up here and choose <strong>Open in Safari</strong> — or copy the link below and paste it into Safari.</>, bm: 'Anda dalam pelayar dalam-aplikasi. Ketik menu ··· dan pilih Buka dalam Safari, atau salin pautan di bawah.' },
      { point: 'bottom-center', t: 'Then, in Safari', b: <>Tap <strong>Share</strong> in the bottom bar, choose <strong>Add to Home Screen</strong>, then <strong>Add</strong>.</>, bm: 'Dalam Safari: Kongsi → Tambah ke Skrin Utama → Tambah.', demo: { phase: 2, where: 'bottom' } },
    ];
  }
  if (phone || pad) {
    const safari = env.browser === 'safari';
    const where: Point = phone && safari ? 'bottom-center' : 'top-right';
    return [
      { point: where, t: 'Tap Share · Ketik Kongsi', b: <>The square with an arrow, {where === 'bottom-center' ? 'in the bar at the bottom of the screen' : 'at the top-right of the address bar'} — watch where the finger goes:</>, bm: where === 'bottom-center' ? 'Petak dengan anak panah, di bar bawah skrin.' : 'Petak dengan anak panah, di kanan atas bar alamat.', demo: { phase: 1, where: where === 'bottom-center' ? 'bottom' : 'top-right' } },
      { point: null, t: 'Add to Home Screen · Tambah ke Skrin Utama', b: <>A sheet slides up. Scroll it down until you see <strong>Add to Home Screen</strong>, and tap it{!safari ? <> — if it is missing in {env.browser === 'chrome' ? 'Chrome' : env.browser === 'firefox' ? 'Firefox' : 'this browser'}, open this page in Safari and do the same there</> : ''}:</>, bm: 'Skrol helaian ke bawah dan ketik Tambah ke Skrin Utama.', demo: { phase: 2, where: where === 'bottom-center' ? 'bottom' : 'top-right' } },
      { point: 'top-right', t: 'Tap Add · Ketik Tambah', b: <>Confirm with <strong>Add</strong> at the top right. DuitBack now has an icon on your Home Screen — open it from there from now on; that is the version whose data Safari never clears.</>, bm: 'Sahkan dengan Tambah. Buka DuitBack dari ikon Skrin Utama selepas ini — data versi itu tidak dipadam Safari.', demo: { phase: 3, where: where === 'bottom-center' ? 'bottom' : 'top-right' } },
    ];
  }
  if (env.device === 'mac' && env.browser === 'safari') {
    return [
      { point: 'top-left', t: 'File → Add to Dock…', b: <>In the menu bar at the top-left, click <strong>File</strong>, then <strong>Add to Dock…</strong> (the <strong>Share</strong> button in the toolbar has it too):</>, bm: 'Klik Fail di bar menu, kemudian Tambah ke Dock…', demo: { phase: 1, where: 'mac' } },
      { point: null, t: 'Click Add · Klik Tambah', b: <>DuitBack opens from the Dock as its own app, with its data protected from Safari&apos;s clean-ups.</>, bm: 'DuitBack dibuka dari Dock sebagai aplikasi sendiri.' },
    ];
  }
  return canPrompt
    ? [{ point: null, t: 'Install DuitBack · Pasang', b: <>Your browser can install it directly — use the button below and confirm.</>, bm: 'Pelayar anda boleh memasangnya terus — guna butang di bawah.' }]
    : [
      { point: 'top-right', t: 'Open the browser menu', b: <>Tap <strong>⋮</strong> (or <strong>…</strong>) at the top-right and look for this:</>, bm: 'Ketik ⋮ di kanan atas dan cari ini:', mock: 'menu' },
      { point: null, t: 'Confirm · Sahkan', b: <>Confirm the install. DuitBack then opens like an app, works offline, and its storage is protected.</>, bm: 'Sahkan pemasangan. DuitBack dibuka seperti aplikasi.' },
    ];
}

/** Install walkthrough in the onboarding tour's style. The Share button lives in the browser's own
 *  chrome, outside our page — so each step spotlights the screen edge where it sits and shows a
 *  mock of the row to look for, instead of spotlighting a DOM element. */
export function InstallTour({ env, install, onClose }: { env: InstallEnv; install?: () => void; onClose: () => void }) {
  const steps = stepsFor(env, !!install);
  const [i, setI] = useState(0);
  const [copied, setCopied] = useState<'no' | 'yes' | 'fail'>('no');
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = useDialogKeys(ref, onClose, undefined, i);
  const st = steps[i];
  const last = i === steps.length - 1;
  const dim = 'color-mix(in srgb, var(--color-text) 62%, transparent)';
  const glow = st.point === 'bottom-center' ? 'circle at 50% 100%' : st.point === 'top-right' ? 'circle at calc(100% - 26px) 0' : st.point === 'top-left' ? 'circle at 36px 0' : null;
  const arrowStyle: React.CSSProperties | null = st.point === 'bottom-center'
    ? { bottom: 14, left: '50%', transform: 'translateX(-50%) rotate(180deg)' }
    : st.point === 'top-right' ? { top: 10, right: 14 }
    : st.point === 'top-left' ? { top: 10, left: 22 } : null;
  const cardPos: React.CSSProperties = st.point === 'bottom-center' ? { top: 'max(16px, 14vh)' } : st.point ? { bottom: 'max(16px, 14vh)' } : { top: '50%' };
  const link = typeof location !== 'undefined' ? location.origin + location.pathname : '';
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 55 }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 56, pointerEvents: 'none', background: glow ? `radial-gradient(${glow}, transparent 0 64px, ${dim} 110px)` : dim }} />
      {arrowStyle && (
        <svg className="install-arrow" style={{ position: 'fixed', zIndex: 57, pointerEvents: 'none', color: 'var(--color-accent)', ...arrowStyle }} width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 21V4" /><path d="m5 11 7-7 7 7" />
        </svg>
      )}
      <div ref={ref} role="dialog" aria-modal="true" tabIndex={-1} onKeyDown={onKeyDown} aria-label={'Install DuitBack, step ' + (i + 1) + ' of ' + steps.length + ': ' + st.t} style={{ position: 'fixed', zIndex: 60, left: '50%', transform: st.point ? 'translateX(-50%)' : 'translate(-50%, -50%)', width: 'min(400px, calc(100vw - 32px))', background: 'var(--color-bg)', border: '2px solid var(--color-text)', padding: '18px 20px', boxShadow: 'var(--shadow-lg)', maxHeight: 'calc(100vh - 32px)', overflowY: 'auto', ...cardPos }}>
        <Kick>Install DuitBack · Pasang · {i + 1} of {steps.length}</Kick>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 19, margin: '8px 0 6px' }}>{st.t}</h3>
        <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: '0 0 6px', color: 'var(--color-neutral-800)' }}>{st.b}</p>
        {st.demo && <InstallDemo phase={st.demo.phase} where={st.demo.where} />}
        {st.mock && <Mock kind={st.mock} />}
        <p lang="ms" style={{ fontSize: 12.5, lineHeight: 1.5, margin: '0 0 14px', color: 'var(--color-neutral-700)' }}>{st.bm}</p>
        {copied === 'fail' && i === 0 && (
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Copy blocked here — select the link and copy it yourself · Pilih pautan dan salin sendiri</label>
            <input className="input" readOnly value={link} onFocus={(e) => e.currentTarget.select()} aria-label="Link to DuitBack · Pautan" />
          </div>
        )}
        {i === 0 && <p className="text-muted" style={{ fontSize: 11.5, margin: '0 0 12px' }}>{env.webkit ? 'Why: Safari clears a website’s saved data after 7 days without a visit — an installed app is exempt. · Safari memadam data laman yang tidak dibuka 7 hari; aplikasi dipasang dikecualikan.' : 'Installed, DuitBack opens like an app and its storage is protected.'}</p>}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {last ? (
            install ? <button className="btn btn-primary" onClick={() => { install(); onClose(); }}>Install DuitBack · Pasang</button> : <button className="btn btn-primary" onClick={onClose}>Done · Selesai</button>
          ) : (
            <button className="btn btn-primary" onClick={() => setI(i + 1)}>Next →</button>
          )}
          {i > 0 && <button className="btn btn-secondary" onClick={() => setI(i - 1)}>← Back</button>}
          {env.browser === 'inapp' && i === 0 && (
            <button className="btn btn-secondary" onClick={() => { (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(() => setCopied('yes')).catch(() => setCopied('fail')); }}>{copied === 'yes' ? 'Link copied ✓' : 'Copy link · Salin pautan'}</button>
          )}
          {!last && <button className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={onClose}>Later · Nanti</button>}
        </div>
      </div>
    </>
  );
}
