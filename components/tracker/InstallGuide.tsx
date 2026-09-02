import { useState } from 'react';
import type { InstallEnv } from '@/lib/data';
import { Modal } from './bits';

const ShareGlyph = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12" /><path d="m8 7 4-4 4 4" /><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
  </svg>
);
const AddGlyph = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="4" /><path d="M12 8v8" /><path d="M8 12h8" />
  </svg>
);
const MenuGlyph = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
  </svg>
);

interface Step { glyph?: React.ReactNode; en: React.ReactNode; bm: string }

/** Steps for the environment we detected — no install API exists on WebKit, so the
 *  best help is pointing at the right button in the right place. */
function stepsFor(env: InstallEnv, canPrompt: boolean): { why: string; whyBm: string; steps: Step[]; note?: string } {
  const why = env.webkit
    ? 'Safari clears a website\'s saved data after 7 days without a visit — an installed app is exempt, so your claims and receipts stay put.'
    : 'Installed, DuitBack opens like an app, works offline, and its storage is protected.';
  const whyBm = env.webkit
    ? 'Safari memadam data laman web yang tidak dibuka selama 7 hari — aplikasi yang dipasang dikecualikan.'
    : 'Dipasang, DuitBack dibuka seperti aplikasi dan datanya dilindungi.';
  if (env.browser === 'inapp') {
    return {
      why, whyBm,
      steps: [
        { glyph: <MenuGlyph />, en: <>You are inside another app\'s browser, which cannot install. Tap the <strong>···</strong> menu and choose <strong>Open in Safari</strong> (or copy the link below and paste it into Safari).</>, bm: 'Anda dalam pelayar dalam-aplikasi. Ketik menu ··· dan pilih Buka dalam Safari.' },
        { glyph: <ShareGlyph />, en: <>In Safari, tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>, then <strong>Add</strong>.</>, bm: 'Dalam Safari: Kongsi → Tambah ke Skrin Utama → Tambah.' },
      ],
    };
  }
  if (env.device === 'iphone' || env.device === 'ipad') {
    const where = env.browser === 'safari'
      ? (env.device === 'iphone' ? 'the bar at the bottom of the screen' : 'the top-right of the address bar')
      : 'the top-right of the address bar';
    const whereBm = env.browser === 'safari' && env.device === 'iphone' ? 'bar di bawah skrin' : 'kanan atas bar alamat';
    return {
      why, whyBm,
      steps: [
        { glyph: <ShareGlyph />, en: <>Tap <strong>Share</strong> — the square with an arrow, in {where}.</>, bm: 'Ketik Kongsi — petak dengan anak panah, di ' + whereBm + '.' },
        { glyph: <AddGlyph />, en: <>Scroll the sheet and tap <strong>Add to Home Screen</strong>.</>, bm: 'Skrol dan ketik Tambah ke Skrin Utama.' },
        { en: <>Tap <strong>Add</strong> (top right). Then open DuitBack from its icon — that is the version that keeps your data.</>, bm: 'Ketik Tambah. Buka DuitBack dari ikon Skrin Utama selepas ini.' },
      ],
      note: env.browser !== 'safari' ? 'If "Add to Home Screen" is missing in ' + (env.browser === 'chrome' ? 'Chrome' : env.browser === 'firefox' ? 'Firefox' : 'this browser') + ', open this page in Safari and do the same there. · Jika tiada, buka dalam Safari.' : undefined,
    };
  }
  if (env.device === 'mac' && env.browser === 'safari') {
    return {
      why, whyBm,
      steps: [
        { glyph: <ShareGlyph />, en: <>Click <strong>File → Add to Dock…</strong> in the menu bar (or the <strong>Share</strong> button in the toolbar → Add to Dock).</>, bm: 'Klik Fail → Tambah ke Dock… (atau butang Kongsi → Tambah ke Dock).' },
        { en: <>Click <strong>Add</strong>. DuitBack now opens from the Dock as its own app.</>, bm: 'Klik Tambah. DuitBack dibuka dari Dock sebagai aplikasi.' },
      ],
    };
  }
  return {
    why, whyBm,
    steps: canPrompt
      ? [{ en: <>Your browser can install it directly — use the <strong>Install DuitBack</strong> button below.</>, bm: 'Pelayar anda boleh memasangnya terus — guna butang Pasang di bawah.' }]
      : [
        { glyph: <MenuGlyph />, en: <>Open the browser menu (<strong>⋮</strong> or <strong>…</strong>).</>, bm: 'Buka menu pelayar (⋮ atau …).' },
        { glyph: <AddGlyph />, en: <>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>, then confirm.</>, bm: 'Pilih Pasang aplikasi atau Tambah ke skrin utama, kemudian sahkan.' },
      ],
  };
}

export function InstallGuide({ env, install, onClose }: { env: InstallEnv; install?: () => void; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const g = stepsFor(env, !!install);
  const link = typeof location !== 'undefined' ? location.origin + location.pathname : '';
  return (
    <Modal z={30} onClose={onClose} label="Install DuitBack · Pasang DuitBack">
      <div className="dialog-title">Install DuitBack · Pasang DuitBack</div>
      <p style={{ fontSize: 13, margin: '0 0 4px' }}>{g.why} <span lang="ms" className="text-muted">{g.whyBm}</span></p>
      <ol style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {g.steps.map((st, i) => (
          <li key={i} style={{ display: 'grid', gridTemplateColumns: '28px 30px 1fr', gap: 8, alignItems: 'start', fontSize: 13.5, lineHeight: 1.5 }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-accent-700)' }}>{i + 1}.</span>
            <span style={{ color: 'var(--color-accent-700)', paddingTop: 1 }}>{st.glyph || ''}</span>
            <span>{st.en}<br /><span lang="ms" className="text-muted" style={{ fontSize: 12 }}>{st.bm}</span></span>
          </li>
        ))}
      </ol>
      {g.note && <p className="text-muted" style={{ fontSize: 12, margin: '10px 0 0' }}>{g.note}</p>}
      <div className="dialog-actions" style={{ flexWrap: 'wrap' }}>
        {env.browser === 'inapp' && (
          <button className="btn btn-secondary" onClick={() => { navigator.clipboard?.writeText(link).then(() => setCopied(true)).catch(() => {}); }}>{copied ? 'Link copied · Disalin ✓' : 'Copy link · Salin pautan'}</button>
        )}
        {install && <button className="btn btn-primary" onClick={() => { install(); onClose(); }}>Install DuitBack · Pasang</button>}
        <button className={install ? 'btn btn-secondary' : 'btn btn-primary'} onClick={onClose}>Done · Selesai</button>
      </div>
    </Modal>
  );
}
