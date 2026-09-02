'use client';
import { useEffect, useRef, useState } from 'react';
import { Claim, Data, calc, fmt, today, uid } from '@/lib/tax';
import { askPersistentStorage, bumpChanges, demoData, emptyData, exportJson, familySetUp, hasStash, installEnv, installGuideShown, isDemo, loadData, markInstallGuideShown, persist, popStash, pruneEmptyFutureYears, wipe } from '@/lib/data';
import { Kick, TinInput, Wordmark, Modal } from './bits';
import { SiteFooter } from '@/components/ui';
import { Dashboard } from './Dashboard';
import { Claims } from './Claims';
import { Receipts } from './Receipts';
import { StatusScreen } from './StatusScreen';
import { Income } from './Income';
import { FilingPack } from './FilingPack';
import { Settings } from './Settings';
import { AddClaimDialog, TagDialog, ViewerDialog, AddState, TagState, ViewerState, editState, freshAdd } from './dialogs';
import { Tour, tourSteps } from './Tour';
import { InstallTour } from './InstallTour';

export type Screen = 'dash' | 'claims' | 'receipts' | 'status' | 'income' | 'pack' | 'settings';

const NAV: Array<[Screen, string]> = [
  ['dash', 'Dashboard'],
  ['claims', 'Claims · Tuntutan'],
  ['receipts', 'Receipts · Resit'],
  ['status', 'Status'],
  ['income', 'Income'],
  ['pack', 'Filing pack'],
  ['settings', 'Settings'],
];

export interface Api {
  d: Data;
  ya: string;
  save: (d: Data, msg?: string) => void;
  mut: (fn: (d: Data) => void) => void;
  go: (s: Screen) => void;
  openAdd: (cat?: string) => void;
  openEdit: (cl: Claim) => void;
  setDlg: (d: null | 'add' | 'tag' | 'view') => void;
  clearAll: () => void;
  startTour: () => void;
  ask: (msg: string, onYes: () => void) => void;
  /** browser offered an install prompt (Chrome/Edge/Android) — undefined elsewhere */
  install?: () => void;
  /** open the step-by-step install guide for this device and browser */
  showInstallGuide: () => void;
  dataMsg: string;
  setDataMsg: (m: string) => void;
}

export default function TrackerApp() {
  const [booted, setBooted] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  const [screen, setScreen] = useState<Screen>('dash');
  const [locked, setLocked] = useState(false);
  const [dataMsg, setDataMsg] = useState('');
  const [setup, setSetup] = useState({ name: '', taxNo: '', marital: 'single' as 'single' | 'married' });
  const [tut, setTut] = useState(0);
  const [selCat, setSelCat] = useState('lifestyle');
  const [dlg, setDlg] = useState<null | 'add' | 'tag' | 'view'>(null);
  const [add, setAdd] = useState<AddState>(freshAdd());
  const [tag, setTag] = useState<TagState>({ rid: null, cat: 'lifestyle', merchant: '', amount: '', makeClaim: true });
  const [viewer, setViewer] = useState<ViewerState>({ id: null, name: '', sub: '', src: null, note: '' });
  const [pinEntry, setPinEntry] = useState('');
  const [pinErr, setPinErr] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [eraseArmed, setEraseArmed] = useState(false);
  const [confirmReq, setConfirmReq] = useState<{ msg: string; onYes: () => void } | null>(null);
  const [installEvt, setInstallEvt] = useState<{ prompt: () => void } | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    let d = loadData();
    // deep links: /app/?demo=1 loads the demo when nothing is set up; #screen opens that screen
    if (!d && new URLSearchParams(location.search).get('demo') === '1') { d = demoData(); persist(d); }
    if (d) {
      if (pruneEmptyFutureYears(d)) persist(d);
      setData(d);
      setLocked(!!d.profile.pin);
      askPersistentStorage();
    }
    const applyHash = () => { const h = location.hash.slice(1) as Screen; if (NAV.some(([id]) => id === h)) setScreen(h); };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    setBooted(true);
    const onInstall = (e: Event) => { e.preventDefault(); setInstallEvt(e as unknown as { prompt: () => void }); };
    window.addEventListener('beforeinstallprompt', onInstall);
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/duitback-web/sw.js', { scope: '/duitback-web/' }).catch(() => {});
    }
    return () => { window.removeEventListener('beforeinstallprompt', onInstall); window.removeEventListener('hashchange', applyHash); };
  }, []);

  // the tour drives the screen: each step lands on the screen it teaches
  useEffect(() => {
    if (tut > 0 && tut <= steps.length) navigateRef.current(steps[tut - 1].screen);
  }, [tut]);

  // WebKit (every iOS browser, Safari on Mac) can clear a site's data after 7 idle days — show the
  // install guide once, on the dashboard, when nothing else is on screen
  useEffect(() => {
    if (!data || isDemo(data) || tut > 0 || locked || screen !== 'dash') return;
    const env = installEnv();
    if (!env.webkit || env.standalone || installGuideShown()) return;
    const t = setTimeout(() => { markInstallGuideShown(); setGuideOpen(true); }, 1200);
    return () => clearTimeout(t);
  }, [data, tut, locked, screen]);

  // Tab changes page like a native app: the outgoing screen (a DOM clone, so React only ever renders
  // one screen) slides out while the new one slides in from the side it sits on in the tab order.
  // Reduced motion: no clone, the new screen just fades in (see .screen-host in tracker.css).
  const hostRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState<{ dir: 'from-right' | 'from-left' | ''; n: number }>({ dir: '', n: 0 });
  const screenRef = useRef(screen);
  screenRef.current = screen;
  const navigate = (s: Screen) => {
    const from = screenRef.current;
    if (s === from) return;
    const a = NAV.findIndex(([id]) => id === from), b = NAV.findIndex(([id]) => id === s);
    const dir = b > a ? 'from-right' : 'from-left';
    const host = hostRef.current;
    const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.screen-ghost').forEach((g) => g.remove()); // never stack clones
    const before = host?.getBoundingClientRect();
    try { window.scrollTo(0, 0); } catch {}
    if (host && before && !reduced) {
      // the clone covers only the content area (below the header, which is back in view after the scroll)
      // and is shifted so what was on screen stays exactly where it was until it slides away
      const top = Math.max(0, host.getBoundingClientRect().top);
      const ghost = document.createElement('div');
      ghost.className = 'screen-ghost ' + (dir === 'from-right' ? 'out-left' : 'out-right');
      ghost.style.top = top + 'px';
      ghost.style.bottom = '0';
      ghost.setAttribute('aria-hidden', 'true');
      const clone = host.cloneNode(true) as HTMLElement;
      clone.className = '';
      clone.style.marginTop = before.top - top + 'px';
      ghost.appendChild(clone);
      (host.parentElement || document.body).appendChild(ghost); // inside the app's clip container, so it leaves with the app
      const drop = () => ghost.remove();
      ghost.addEventListener('animationend', drop, { once: true });
      setTimeout(drop, 700);
    }
    setSlide((x) => ({ dir, n: x.n + 1 }));
    setScreen(s);
  };
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  // phones and tablets get a tour step about swiping
  const [touch] = useState(() => typeof navigator !== 'undefined' && (navigator.maxTouchPoints || 0) > 0);
  const steps = tourSteps(touch);

  // installed on a phone there is no browser chrome, so a horizontal swipe moves between screens.
  // Ignored near the screen edges (the OS back gesture), inside sideways-scrolling tables and the
  // link strip, on form controls, and while any dialog is open.
  useEffect(() => {
    if (!data || locked) return;
    let start: { x: number; y: number; t: number } | null = null;
    const scrollsSideways = (el: Element | null): boolean => {
      for (let n = el; n && n !== document.body; n = n.parentElement) {
        if (n.scrollWidth > n.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(n).overflowX)) return true;
      }
      return false;
    };
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      const target = e.target as Element | null;
      const blocked = !t || t.clientX < 24 || t.clientX > innerWidth - 24 || !!document.querySelector('[role="dialog"]') || !!target?.closest?.('input, textarea, select') || scrollsSideways(target);
      start = blocked ? null : { x: t.clientX, y: t.clientY, t: Date.now() };
    };
    const onEnd = (e: TouchEvent) => {
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x, dy = t.clientY - start.y, dt = Date.now() - start.t;
      start = null;
      if (Math.abs(dx) < 70 || Math.abs(dy) > 50 || dt > 600) return;
      const j = NAV.findIndex(([id]) => id === screenRef.current) + (dx < 0 ? 1 : -1);
      if (NAV[j]) navigateRef.current(NAV[j][0]);
    };
    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });
    return () => { document.removeEventListener('touchstart', onStart); document.removeEventListener('touchend', onEnd); };
  }, [data, locked]);

  // narrow layouts scroll the link strip — keep the current screen's link visible
  useEffect(() => {
    document.querySelector('.nav-links a[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [screen]);

  const save = (d: Data, msg?: string) => {
    setData(d);
    const err = persist(d);
    bumpChanges();
    askPersistentStorage();
    setDataMsg(err || msg || '');
  };
  const mut = (fn: (d: Data) => void) => {
    const d = JSON.parse(JSON.stringify(data)) as Data;
    fn(d);
    save(d);
  };
  const clearAll = () => {
    wipe();
    setData(null);
    setScreen('dash');
    setSetup({ name: '', taxNo: '', marital: 'single' });
    setDataMsg('');
  };
  const openAdd = (cat?: string) => {
    setAdd(freshAdd(cat && cat !== 'individual' ? cat : undefined));
    setDlg('add');
  };
  const openEdit = (cl: Claim) => {
    setAdd(editState(cl));
    setDlg('add');
  };

  const startTracking = () => {
    const f = emptyData();
    f.profile.name = setup.name.trim() || 'there';
    f.profile.taxNo = setup.taxNo.trim();
    f.profile.marital = setup.marital;
    save(f, 'Welcome' + (f.profile.name !== 'there' ? ', ' + f.profile.name : '') + ' — add your first claim when ready. · Selamat datang!');
    setTut(1);
  };

  if (!booted) return null;

  // ---------- first-run setup ----------
  if (!data) {
    return (
      <div role="main" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="pagepad" style={{ padding: '32px 24px 48px', maxWidth: 600, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <a className="btn btn-ghost" href="../" style={{ marginLeft: -8, marginBottom: 22 }}>← Back to home · Kembali</a>
          <div><span style={{ display: 'inline-flex', alignItems: 'center' }}><Wordmark /></span></div>
          <Kick style={{ marginTop: 26 }}>Welcome · Selamat datang</Kick>
          <h1 style={{ margin: '8px 0 6px', fontSize: 34 }}>Set up your tracker</h1>
          <p className="text-muted" style={{ fontSize: 13.5, margin: '0 0 24px', maxWidth: 460 }}>
            A minute of setup, then DuitBack tracks your relief claims against the LHDN caps all year. Everything stays in this browser — nothing is sent anywhere. · Semua kekal dalam pelayar ini.
          </p>
          <div style={{ border: '2px solid var(--color-divider)', padding: 24 }} onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') { e.preventDefault(); startTracking(); } }}>
            <div className="field">
              <label>Your name · Nama</label>
              <input className="input" aria-label="Your name · Nama" placeholder="e.g. Amirah" value={setup.name} onChange={(e) => setSetup({ ...setup, name: e.target.value })} />
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label>Income tax no. · No. cukai</label>
              <TinInput value={setup.taxNo} onChange={(v) => setSetup({ ...setup, taxNo: v })} />
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label>Marital status · Status perkahwinan</label>
              <div className="seg">
                <label className="seg-opt">
                  <input type="radio" name="sumarital" checked={setup.marital !== 'married'} onChange={() => setSetup({ ...setup, marital: 'single' })} />
                  Single · Bujang
                </label>
                <label className="seg-opt">
                  <input type="radio" name="sumarital" checked={setup.marital === 'married'} onChange={() => setSetup({ ...setup, marital: 'married' })} />
                  Married · Berkahwin
                </label>
              </div>
              <div style={{ fontSize: 11.5, marginTop: 6 }} className="text-muted">
                Married unlocks the joint-assessment comparison. Change any of this later in Settings.{' '}
                <span lang="ms">Boleh ubah kemudian dalam Tetapan.</span>
              </div>
            </div>
            <button
              className="btn btn-primary btn-block"
              style={{ marginTop: 20 }}
              onClick={startTracking}
            >
              Start tracking · Mula menjejak
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={() => save(demoData(), 'Demo data loaded — Settings → Clear everything starts you fresh.')}>
              Just exploring? Load the demo →
            </button>
            <span className="text-muted" style={{ fontSize: 11.5 }}>Unofficial tracker · estimates only</span>
          </div>
        </div>
        <SiteFooter wide />
      </div>
    );
  }

  const d = data;
  const ya = d.ya;
  const c = calc(d, ya);
  const api: Api = { d, ya, save, mut, go: navigate, openAdd, openEdit, setDlg, clearAll, startTour: () => setTut(1), ask: (msg, onYes) => setConfirmReq({ msg, onYes }), install: installEvt ? () => { installEvt.prompt(); setInstallEvt(null); } : undefined, showInstallGuide: () => setGuideOpen(true), dataMsg, setDataMsg };
  const demo = isDemo(d);

  return (
    <div role="main" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="nav app-nav no-print" style={{ position: 'sticky', top: 0, background: 'var(--color-bg)', zIndex: 5 }}>
        <span className="nav-brand" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <a href="../" title="duıtback — home" aria-label="duıtback. — home" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Wordmark />
          </a>
        </span>
        <nav className="nav-links" data-tour="nav-links" aria-label="Screens · Skrin">
          {NAV.map(([s, label]) => (
            <a key={s} className="navlink" href={'#' + s} onClick={(e) => { e.preventDefault(); navigate(s); }} aria-current={screen === s ? 'page' : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <button className="btn btn-primary" data-tour="new-claim" onClick={() => openAdd()}>+ New claim</button>
      </div>

      {demo && (
        <div className="no-print demobar" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: '9px 36px', background: 'var(--color-accent-700)', color: 'var(--color-bg)' }}>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>Demo mode · Mod demo</span>
          <span style={{ fontSize: 12.5, opacity: 0.92 }}>Amirah&apos;s sample data — nothing here is yours · Data contoh sahaja</span>
          <button className="btn" style={{ marginLeft: 'auto', background: 'var(--color-bg)', color: 'var(--color-text)', padding: '5px 12px', fontSize: 12 }} onClick={() => {
            const prev = popStash();
            if (prev) { save(prev, 'Welcome back — your data is restored. · Data anda dipulihkan.'); setScreen('dash'); }
            else clearAll();
          }}>
            {hasStash() ? 'Exit demo — back to your data →' : 'Exit demo & set up →'}
          </button>
        </div>
      )}

      <div className="screen-clip">
      <div ref={hostRef} key={slide.n} className={'screen-host' + (slide.dir ? ' ' + slide.dir : '')}>
        {screen === 'dash' && <Dashboard api={api} c={c} />}
        {screen === 'claims' && <Claims api={api} c={c} selCat={selCat} setSelCat={setSelCat} />}
        {screen === 'receipts' && <Receipts api={api} setTag={setTag} setViewer={setViewer} />}
        {screen === 'status' && <StatusScreen api={api} c={c} demo={demo} />}
        {screen === 'income' && <Income api={api} c={c} />}
        {screen === 'pack' && <FilingPack api={api} c={c} />}
        {screen === 'settings' && <Settings api={api} lockNow={() => { setLocked(true); setPinEntry(''); setPinErr(''); setScreen('dash'); }} />}
      </div>
      </div>

      <SiteFooter wide taxNo={d.profile.taxNo || ''} />

      {locked && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--color-bg)', zIndex: 40, display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 'min(360px,90%)' }}>
            <Wordmark width={198} />
            <p className="text-muted" style={{ fontSize: 13, margin: '10px 0 18px' }}>Enter your passcode · Masukkan kod laluan</p>
            <div className="field">
              <label>Passcode · Kod</label>
              <input
                aria-label="Passcode · Kod laluan"
                className="input mono"
                type="password"
                value={pinEntry}
                onChange={(e) => { setPinEntry(e.target.value); setPinErr(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') tryUnlock(); }}
              />
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-accent-700)', minHeight: 16 }}>{pinErr}</div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 10 }} onClick={tryUnlock}>Unlock · Buka</button>
            <p className="text-muted" style={{ fontSize: 11, marginTop: 14 }}>Cosmetic lock — data in this browser is not encrypted.</p>
            <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
              <a href="../" className="navlink" style={{ fontSize: 12 }}>← Back to home · Kembali</a>
              <button className="navlink linkbtn" style={{ fontSize: 12 }} onClick={() => { setForgotOpen(!forgotOpen); setEraseArmed(false); }}>
                Forgot passcode? · Lupa kod?
              </button>
            </div>
            {forgotOpen && (
              <div style={{ border: '2px solid var(--color-accent-700)', padding: 14, marginTop: 12 }}>
                <p style={{ fontSize: 12.5, margin: '0 0 10px' }}>
                  The passcode cannot be recovered. The only way back in is to <strong>erase all DuitBack data in this browser</strong> and start over — if you exported a JSON backup, you can import it afterwards.{' '}
                  <span lang="ms">Kod tidak boleh dipulihkan — satu-satunya jalan ialah memadam semua data dan mula semula. Import sandaran JSON anda selepas itu.</span>
                </p>
                <label className="radio" style={{ fontSize: 12.5 }}>
                  <input type="checkbox" checked={eraseArmed} onChange={(e) => setEraseArmed(e.target.checked)} />
                  <span className="dot" style={{ borderRadius: 0 }} />
                  I understand all data in this browser will be deleted · Saya faham semua data akan dipadam
                </label>
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: 10 }}
                  disabled={!eraseArmed}
                  onClick={() => { setForgotOpen(false); setEraseArmed(false); setLocked(false); clearAll(); }}
                >
                  Erase everything &amp; start over · Padam semua
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {dlg === 'add' && <AddClaimDialog api={api} c={c} add={add} setAdd={setAdd} onSaved={(cat) => setSelCat(cat)} />}
      {guideOpen && (() => { const env = installEnv(); return <InstallTour env={env} install={env.webkit ? undefined : api.install} onClose={() => setGuideOpen(false)} />; })()}
      {confirmReq && (
        <Modal z={70} width="min(420px,100%)" onClose={() => setConfirmReq(null)} label="Confirm · Sahkan">
            <div className="dialog-title" style={{ fontSize: 17 }}>{confirmReq.msg}</div>
            <p className="text-muted" style={{ fontSize: 12.5, margin: '4px 0 14px' }}>This cannot be undone. <span lang="ms">Tindakan ini tidak boleh dibatalkan.</span></p>
            <div className="dialog-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmReq(null)}>Cancel · Batal</button>
              <button className="btn btn-primary" onClick={() => { confirmReq.onYes(); setConfirmReq(null); }}>Delete · Padam</button>
            </div>
        </Modal>
      )}
      {dlg === 'tag' && <TagDialog api={api} tag={tag} setTag={setTag} />}
      {dlg === 'view' && <ViewerDialog api={api} viewer={viewer} setViewer={setViewer} />}

      {tut > 0 && (
        <Tour
          step={tut}
          steps={steps}
          d={d}
          c={c}
          onNext={() => setTut(tut + 1)}
          onBack={() => setTut(tut - 1)}
          onDone={(finished) => {
            setTut(0);
            // finishing the tour lands on Family & status until it's set up — that's what makes the fixed reliefs count
            if (finished && !familySetUp(d)) {
              setScreen('settings');
              requestAnimationFrame(() => requestAnimationFrame(() => document.querySelector('[data-tour="family"]')?.scrollIntoView({ block: 'start' })));
            } else setScreen('dash');
          }}
        />
      )}
    </div>
  );

  function tryUnlock() {
    if (pinEntry === (data?.profile.pin || '')) {
      setLocked(false);
      setPinEntry('');
      setPinErr('');
    } else setPinErr('Wrong passcode · Kod salah');
  }
}

export { fmt, today, uid };
