import { useState } from 'react';
import { Api } from './App';
import { BankInput, TinInput } from './bits';
import { demoData, exportJson, getBackupMeta, parseImport } from '@/lib/data';
import { Kick, pagepad } from './bits';

export function Settings({ api, lockNow }: { api: Api; lockNow: () => void }) {
  const { d, mut, save, clearAll, dataMsg, setDataMsg } = api;
  const [pinNew, setPinNew] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const pb = (k: 'name' | 'taxNo' | 'bank') => (e: React.ChangeEvent<HTMLInputElement>) => mut((x) => { x.profile[k] = e.target.value; });

  return (
    <div className="pagepad" data-screen-label="Settings" style={pagepad(900)}>
      <h2 style={{ margin: '0 0 18px' }}>Settings <span className="bm" style={{ fontSize: 15 }}>· Tetapan</span></h2>

      <div style={{ border: '2px solid var(--color-divider)', padding: 24 }}>
        <Kick>Profile · Profil</Kick>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10, marginTop: 12, alignItems: 'start' }}>
          <div className="field"><label>Name · Nama</label><input className="input" value={d.profile.name} onChange={pb('name')} /></div>
          <div className="field">
            <label>Income tax no. · No. cukai</label>
            <TinInput value={d.profile.taxNo} onChange={(v) => mut((x) => { x.profile.taxNo = v; })} />
          </div>
        </div>
        <div className="field" style={{ marginTop: 16, maxWidth: 520 }}>
          <label>Refund bank account · Akaun bank</label>
          <BankInput value={d.profile.bank} onChange={(v) => mut((x) => { x.profile.bank = v; })} />
        </div>
        <div className="field" style={{ marginTop: 16 }}>
          <label>Marital status · Status perkahwinan</label>
          <div className="seg">
            <label className="seg-opt">
              <input type="radio" name="marital" checked={d.profile.marital !== 'married'} onChange={() => mut((x) => { x.profile.marital = 'single'; })} />
              Single · Bujang
            </label>
            <label className="seg-opt">
              <input type="radio" name="marital" checked={d.profile.marital === 'married'} onChange={() => mut((x) => { x.profile.marital = 'married'; })} />
              Married · Berkahwin
            </label>
          </div>
          <div style={{ fontSize: 11.5, marginTop: 6 }} className="text-muted">Married unlocks the joint-assessment comparison on the Income screen.</div>
        </div>
      </div>

      <div style={{ border: '2px solid var(--color-divider)', borderTop: 0, padding: 24 }}>
        <Kick>Passcode lock · Kunci</Kick>
        <p className="text-muted" style={{ fontSize: 12.5, margin: '8px 0 14px' }}>
          Asks for a passcode when the app opens. Cosmetic only — data in this browser is not encrypted, so treat it as a privacy curtain, not security.{' '}
          <span lang="ms">Kunci kosmetik sahaja — data dalam pelayar ini tidak disulitkan.</span>{' '}
          A forgotten passcode cannot be recovered — the only way back in is erasing this browser&apos;s data, so pick one you&apos;ll remember and export a JSON backup first.{' '}
          <span lang="ms">Kod yang dilupakan tidak boleh dipulihkan — eksport sandaran JSON dahulu.</span>
        </p>
        {!d.profile.pin ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="field" style={{ margin: 0 }}>
              <label>New passcode (min 4 characters)</label>
              <input className="input mono" type="password" value={pinNew} onChange={(e) => setPinNew(e.target.value)} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>Confirm passcode · Sahkan</label>
              <input className="input mono" type="password" value={pinConfirm} onChange={(e) => setPinConfirm(e.target.value)} />
            </div>
            <button className="btn btn-secondary" onClick={() => {
              const p = pinNew.trim();
              if (p.length < 4) { setDataMsg('Passcode must be at least 4 characters. · Kod mesti sekurang-kurangnya 4 aksara.'); return; }
              if (p !== pinConfirm.trim()) { setDataMsg('Passcodes don’t match — type the same code twice. · Kod tidak sepadan — taip kod yang sama dua kali.'); return; }
              mut((x) => { x.profile.pin = p; });
              setPinNew('');
              setPinConfirm('');
              setDataMsg('Passcode set — the app will ask for it on next open. · Kod ditetapkan.');
            }}>Set passcode · Tetapkan</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={lockNow}>Lock now · Kunci sekarang</button>
            <button className="btn btn-ghost" onClick={() => { mut((x) => { delete x.profile.pin; }); setDataMsg('Passcode removed. · Kod dibuang.'); }}>Remove passcode</button>
          </div>
        )}
      </div>

      <div style={{ border: '2px solid var(--color-divider)', borderTop: 0, padding: 24 }}>
        <Kick>Data · Data</Kick>
        <p className="text-muted" style={{ fontSize: 12.5, margin: '8px 0 14px' }}>
          Claims and thumbnails live in this browser&apos;s localStorage; full-size receipt images in IndexedDB. Nothing is sent to a server — each visitor to a hosted copy gets their own private data. Export JSON to move devices (full-size files stay behind; thumbnails travel).{' '}
          <span lang="ms">Semua data kekal dalam pelayar ini — tiada apa-apa dihantar ke pelayan. Eksport JSON untuk pindah peranti.</span>
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => { exportJson(d); setDataMsg('Backup exported. · Sandaran dieksport.'); }}>Export all data (JSON)</button>
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            Import data (JSON)
            <input type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const rd = new FileReader();
              rd.onload = () => {
                const r = parseImport(String(rd.result));
                if (r.data) save(r.data, 'Imported ' + f.name + ' — ' + r.data.claims.length + ' claims, ' + (r.data.receipts || []).length + ' receipts.');
                else setDataMsg(r.error!);
              };
              rd.readAsText(f);
              e.target.value = '';
            }} />
          </label>
          <button className="btn btn-secondary" onClick={() => save(demoData(), 'Demo data loaded. · Data demo dimuatkan.')}>Load demo data · Muat demo</button>
          <button className="btn btn-ghost" onClick={clearAll}>Clear everything · Padam semua</button>
        </div>
        {(() => {
          const meta = getBackupMeta();
          return (
            <div className="text-muted" style={{ fontSize: 12, marginTop: 10 }}>
              Last backup · Sandaran terakhir: {meta.lastExport || 'never · belum pernah'} · {meta.changesSince} changes since · {meta.changesSince} perubahan
            </div>
          );
        })()}
        <div style={{ fontSize: 12, marginTop: 10, color: 'var(--color-accent-700)' }}>{dataMsg}</div>
      </div>

      <div style={{ border: '2px solid var(--color-divider)', borderTop: 0, padding: 24 }}>
        <Kick>Support · Sokongan</Kick>
        <p className="text-muted" style={{ fontSize: 12.5, margin: '8px 0 0' }}>
          DuitBack is free and keeps your data on your device. If it saved you some duit,{' '}
          <a href="https://ko-fi.com/duitback" target="_blank" rel="noopener noreferrer">belanja teh tarik →</a>
        </p>
        <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={api.startTour}>Replay the tour · Ulang jelajah →</button>
      </div>

      <div style={{ border: '2px solid var(--color-divider)', borderTop: 0, padding: 24 }}>
        <Kick>About · Perihal</Kick>
        <p className="text-muted" style={{ fontSize: 12.5, margin: '8px 0 0' }}>
          DuitBack is an unofficial personal tracker for Malaysian resident individual (BE/B) returns. Caps follow each year&apos;s LHDN schedule (YA2023/24 use approximate historical caps; YA2025+ the current one), incl. medical sub-limits and per-child relief; the tax scale is the YA2025 resident scale. Not affiliated with LHDN; no tax advice — always confirm figures in MyTax before filing.{' '}
          <span lang="ms">Penjejak peribadi tidak rasmi — tiada kaitan dengan LHDN dan bukan nasihat cukai. Sentiasa sahkan angka dalam MyTax sebelum memfailkan.</span>
        </p>
      </div>
    </div>
  );
}
