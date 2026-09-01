'use client';
import { useEffect, useState } from 'react';
import { Data, calc, fmt, today, uid } from '@/lib/tax';
import { demoData, emptyData, exportJson, isDemo, loadData, persist, wipe } from '@/lib/data';
import { Kick, Wordmark } from './bits';
import { Dashboard } from './Dashboard';
import { Claims } from './Claims';
import { Receipts } from './Receipts';
import { StatusScreen } from './StatusScreen';
import { Income } from './Income';
import { FilingPack } from './FilingPack';
import { Settings } from './Settings';
import { AddClaimDialog, TagDialog, ViewerDialog, AddState, TagState, ViewerState, freshAdd } from './dialogs';

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

const TUT = [
  { t: 'Add claims as you spend', b: 'Hit “+ New claim” whenever you spend on something claimable — books, clinic visits, PRS top-ups. Totals, caps and the refund estimate update live.' },
  { t: 'Watch your caps', b: 'The Claims screen lists every LHDN relief with its cap and what is left this year. Over-cap entries are saved but flagged — only the allowed amount counts.' },
  { t: 'Drop receipts in the vault', b: 'Drag receipts into the Receipts screen and tag them to a relief. LHDN can audit up to 7 years back — the vault keeps the evidence next to the claim.' },
  { t: 'File from the pack in March', b: 'When e-Filing opens, the Filing pack shows every number to type into MyTax, with the receipts behind each line. Print it or save as PDF — and always confirm figures in MyTax.' },
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

  useEffect(() => {
    const d = loadData();
    if (d) {
      setData(d);
      setLocked(!!d.profile.pin);
    }
    setBooted(true);
  }, []);

  const save = (d: Data, msg?: string) => {
    setData(d);
    const err = persist(d);
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
        <div className="pagepad" style={{ padding: '56px 24px 48px', maxWidth: 600, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}><Wordmark /></span>
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
              <label>
                Income tax no. · No. cukai <span className="bm">(optional — from MyTax)</span>
              </label>
              <input className="input" placeholder="SG 12345678-09" value={setup.taxNo} onChange={(e) => setSetup({ ...setup, taxNo: e.target.value })} />
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
                Married unlocks the joint-assessment comparison. Change any of this later in Settings.
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
                save(f, 'Welcome' + (f.profile.name !== 'there' ? ', ' + f.profile.name : '') + ' — add your first claim when ready.');
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
        <Footer taxNo="" />
      </div>
    );
  }

  const d = data;
  const ya = d.ya;
  const c = calc(d, ya);
  const api: Api = { d, ya, save, mut, go: setScreen, openAdd, setDlg, clearAll, dataMsg, setDataMsg };
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
        <button className="btn btn-primary" onClick={() => openAdd()}>+ New claim</button>
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

      <Footer taxNo={d.profile.taxNo || ''} />

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
          </div>
        </div>
      )}

      {dlg === 'add' && <AddClaimDialog api={api} c={c} add={add} setAdd={setAdd} onSaved={(cat) => setSelCat(cat)} />}
      {dlg === 'tag' && <TagDialog api={api} tag={tag} setTag={setTag} />}
      {dlg === 'view' && <ViewerDialog api={api} viewer={viewer} setViewer={setViewer} />}

      {tut > 0 && (
        <div className="dialog-backdrop" style={{ zIndex: 60 }}>
          <div className="dialog" style={{ maxWidth: 480, width: 'calc(100vw - 48px)' }}>
            <Kick>Quick tour · Jom tengok · {tut} of {TUT.length}</Kick>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, margin: '10px 0 8px' }}>{TUT[Math.min(tut, TUT.length) - 1].t}</h3>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: '0 0 20px', color: 'var(--color-neutral-800)' }}>{TUT[Math.min(tut, TUT.length) - 1].b}</p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {tut < TUT.length ? (
                <>
                  <button className="btn btn-primary" onClick={() => setTut(tut + 1)}>Next →</button>
                  <button className="btn btn-ghost" onClick={() => setTut(0)}>Skip tour</button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => setTut(0)}>Start tracking →</button>
              )}
            </div>
          </div>
        </div>
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

function Footer({ taxNo }: { taxNo: string }) {
  return (
    <div className="no-print" style={{ marginTop: 'auto', borderTop: '2px solid var(--color-divider)', padding: '14px 36px', display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', fontSize: 11.5 }}>
      <span className="text-muted">DuitBack — unofficial tracker · YA2025 schedule · estimates only</span>
      <span style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <a href="https://ko-fi.com/duitback" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          DuitBack is free · belanja teh tarik →
        </a>
        <span className="text-muted">{taxNo}</span>
      </span>
    </div>
  );
}

export { fmt, today, uid };
