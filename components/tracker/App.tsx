'use client';
import { useEffect, useState } from 'react';
import { Data, calc, fmt, today, uid } from '@/lib/tax';
import { bumpChanges, demoData, emptyData, exportJson, isDemo, loadData, persist, pruneEmptyFutureYears, wipe } from '@/lib/data';
import { Kick, TinInput, Wordmark } from './bits';
import { SiteFooter } from '@/components/ui';
import { Dashboard } from './Dashboard';
import { Claims } from './Claims';
import { Receipts } from './Receipts';
import { StatusScreen } from './StatusScreen';
import { Income } from './Income';
import { FilingPack } from './FilingPack';
import { Settings } from './Settings';
import { AddClaimDialog, TagDialog, ViewerDialog, AddState, TagState, ViewerState, freshAdd } from './dialogs';
import { TOUR, Tour } from './Tour';

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
  setDlg: (d: null | 'add' | 'tag' | 'view') => void;
  clearAll: () => void;
  startTour: () => void;
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

  useEffect(() => {
    const d = loadData();
    if (d) {
      if (pruneEmptyFutureYears(d)) persist(d);
      setData(d);
      setLocked(!!d.profile.pin);
    }
    setBooted(true);
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/duitback-web/sw.js', { scope: '/duitback-web/' }).catch(() => {});
    }
  }, []);

  // the tour drives the screen: each step lands on the screen it teaches
  useEffect(() => {
    if (tut > 0 && tut <= TOUR.length) setScreen(TOUR[tut - 1].screen);
  }, [tut]);

  const save = (d: Data, msg?: string) => {
    setData(d);
    const err = persist(d);
    bumpChanges();
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
          <div style={{ border: '2px solid var(--color-divider)', padding: 24 }}>
            <div className="field">
              <label>Your name · Nama</label>
              <input className="input" placeholder="e.g. Amirah" value={setup.name} onChange={(e) => setSetup({ ...setup, name: e.target.value })} />
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
              onClick={() => {
                const f = emptyData();
                f.profile.name = setup.name.trim() || 'there';
                f.profile.taxNo = setup.taxNo.trim();
                f.profile.marital = setup.marital;
                save(f, 'Welcome' + (f.profile.name !== 'there' ? ', ' + f.profile.name : '') + ' — add your first claim when ready. · Selamat datang!');
                setTut(1);
              }}
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
  const api: Api = { d, ya, save, mut, go: setScreen, openAdd, setDlg, clearAll, startTour: () => setTut(1), dataMsg, setDataMsg };
  const demo = isDemo(d);

  return (
    <div role="main" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="nav no-print" style={{ flexWrap: 'wrap', position: 'sticky', top: 0, background: 'var(--color-bg)', zIndex: 5 }}>
        <span className="nav-brand" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <a href="../" title="duıtback — home" aria-label="duıtback. — home" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Wordmark />
          </a>
        </span>
        {NAV.map(([s, label]) => (
          <a key={s} className="navlink" href={'#' + s} onClick={(e) => { e.preventDefault(); setScreen(s); }} aria-current={screen === s ? 'page' : undefined}>
            {label}
          </a>
        ))}
        <button className="btn btn-primary" data-tour="new-claim" onClick={() => openAdd()}>+ New claim</button>
      </div>

      {demo && (
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: '9px 36px', background: 'var(--color-accent-700)', color: 'var(--color-bg)' }}>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>Demo mode · Mod demo</span>
          <span style={{ fontSize: 12.5, opacity: 0.92 }}>Amirah&apos;s sample data — nothing here is yours · Data contoh sahaja</span>
          <button className="btn" style={{ marginLeft: 'auto', background: 'var(--color-bg)', color: 'var(--color-text)', padding: '5px 12px', fontSize: 12 }} onClick={clearAll}>
            Exit demo &amp; set up →
          </button>
        </div>
      )}

      {screen === 'dash' && <Dashboard api={api} c={c} />}
      {screen === 'claims' && <Claims api={api} c={c} selCat={selCat} setSelCat={setSelCat} />}
      {screen === 'receipts' && <Receipts api={api} setTag={setTag} setViewer={setViewer} />}
      {screen === 'status' && <StatusScreen api={api} c={c} demo={demo} />}
      {screen === 'income' && <Income api={api} c={c} />}
      {screen === 'pack' && <FilingPack api={api} c={c} />}
      {screen === 'settings' && <Settings api={api} lockNow={() => { setLocked(true); setPinEntry(''); setPinErr(''); setScreen('dash'); }} />}

      <SiteFooter wide taxNo={d.profile.taxNo || ''} />

      {locked && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--color-bg)', zIndex: 40, display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 'min(360px,90%)' }}>
            <Wordmark width={198} />
            <p className="text-muted" style={{ fontSize: 13, margin: '10px 0 18px' }}>Enter your passcode · Masukkan kod laluan</p>
            <div className="field">
              <label>Passcode · Kod</label>
              <input
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
      {dlg === 'tag' && <TagDialog api={api} tag={tag} setTag={setTag} />}
      {dlg === 'view' && <ViewerDialog api={api} viewer={viewer} setViewer={setViewer} />}

      {tut > 0 && (
        <Tour
          step={tut}
          onNext={() => setTut(tut + 1)}
          onBack={() => setTut(tut - 1)}
          onDone={() => { setTut(0); setScreen('dash'); }}
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
