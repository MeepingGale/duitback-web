import { useEffect, useState } from 'react';
import { Api } from './App';
import { CHILDSUB, ChildCounts, capFor, derivedReliefs, fmt } from '@/lib/tax';
import { BankInput, TinInput } from './bits';
import { demoData, exportJson, exportVault, getBackupMeta, isDemo, isIOS, isStandalone, parseImport, stashReal } from '@/lib/data';
import { Kick, pagepad } from './bits';

export function Settings({ api, lockNow }: { api: Api; lockNow: () => void }) {
  const { d, mut, save, clearAll, ask, dataMsg, setDataMsg } = api;
  const [pinNew, setPinNew] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinMsg, setPinMsg] = useState('');
  const [persisted, setPersisted] = useState<boolean | null>(null);
  useEffect(() => { navigator.storage?.persisted?.().then(setPersisted).catch(() => {}); }, []);
  const standalone = isStandalone();
  const ios = isIOS();
  const pb = (k: 'name' | 'taxNo' | 'bank') => (e: React.ChangeEvent<HTMLInputElement>) => mut((x) => { x.profile[k] = e.target.value; });

  return (
    <div className="pagepad" data-screen-label="Settings" style={pagepad(900)}>
      <h2 style={{ margin: '0 0 18px' }}>Settings <span className="bm" style={{ fontSize: 15 }}>· Tetapan</span></h2>

      <div style={{ border: '2px solid var(--color-divider)', padding: 24 }}>
        <Kick>Profile · Profil</Kick>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10, marginTop: 12, alignItems: 'start' }}>
          <div className="field"><label>Name · Nama</label><input className="input" aria-label="Name · Nama" value={d.profile.name} onChange={pb('name')} /></div>
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

      <div data-tour="family" style={{ border: '2px solid var(--color-divider)', borderTop: 0, padding: 24 }}>
        <Kick>Family &amp; status · Keluarga &amp; status</Kick>
        <p className="text-muted" style={{ fontSize: 12.5, margin: '8px 0 14px' }}>
          LHDN gives these reliefs on who you are, with no receipts — set them once and they are counted automatically for every year.{' '}
          <span lang="ms">Pelepasan tetap tanpa resit — tetapkan sekali, dikira automatik.</span>
        </p>
        {(() => {
          const yaNum = +d.ya.slice(2);
          const married = d.profile.marital === 'married';
          const kids: ChildCounts = { u18: 0, a18pre: 0, a18edu: 0, dis: 0, disedu: 0, ...(d.profile.children || {}) };
          const setP = (k: 'disabled' | 'spouseWorking' | 'spouseDisabled', v: boolean) => mut((x) => { x.profile[k] = v; });
          const kidCount = Object.values(kids).reduce((a, b) => a + (b || 0), 0);
          const setKid = (k: keyof ChildCounts, v: number) => mut((x) => { x.profile.children = { ...kids, [k]: Math.max(0, Math.min(20, Math.floor(v || 0))) }; });
          const yesNo = (label: string, name: string, value: boolean | undefined, on: (v: boolean) => void, amount: string) => (
            <div className="field" style={{ marginTop: 12 }}>
              <label>{label}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div className="seg">
                  <label className="seg-opt"><input type="radio" name={name} checked={value === true} onChange={() => on(true)} />Yes · Ya</label>
                  <label className="seg-opt"><input type="radio" name={name} checked={value !== true} onChange={() => on(false)} />No · Tidak</label>
                </div>
                <span className="text-muted" style={{ fontSize: 12 }}>{amount}</span>
              </div>
            </div>
          );
          const derivedNow = derivedReliefs(d.profile, yaNum);
          const total = Object.values(derivedNow).reduce((a, b) => a + b, 0);
          return (
            <>
              {yesNo('Are you a registered disabled person (OKU)? · Adakah anda OKU?', 'fs-disabled', d.profile.disabled, (v) => setP('disabled', v), 'Disabled individual relief ' + fmt(capFor('disabled_self', yaNum)))}
              {married && yesNo('Does your spouse have their own income? · Pasangan bekerja?', 'fs-spouse-working', d.profile.spouseWorking === undefined ? true : d.profile.spouseWorking, (v) => setP('spouseWorking', v), 'No income → spouse relief ' + fmt(capFor('spouse', yaNum)))}
              {married && d.profile.spouseWorking === false && yesNo('Is your spouse a registered disabled person? · Pasangan OKU?', 'fs-spouse-disabled', d.profile.spouseDisabled, (v) => setP('spouseDisabled', v), 'Further relief ' + fmt(capFor('disabled_spouse', yaNum)))}
              <div className="field" style={{ marginTop: 14 }}>
                <label>Children · Anak — count each child in one line only · setiap anak dalam satu baris sahaja</label>
                <div className="text-muted" style={{ fontSize: 11.5, margin: '0 0 8px' }}>
                  Unmarried children only. An 18+ child must be in full-time study. A disabled child in diploma-or-higher study goes in the RM16,000 line, which already includes the RM8,000.{' '}
                  <span lang="ms">Anak belum berkahwin sahaja; anak OKU yang belajar di peringkat diploma ke atas masuk baris RM16,000 (sudah termasuk RM8,000).</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
                  {CHILDSUB.map((m) => (
                    <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                      <input className="input mono" type="number" min={0} max={20} inputMode="numeric" style={{ width: 64 }} aria-label={m.label} value={kids[m.id as keyof ChildCounts]} onChange={(e) => setKid(m.id as keyof ChildCounts, +e.target.value)} />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {kidCount > 0 && <div className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>{kidCount} {kidCount === 1 ? 'child' : 'children'} counted · {kidCount} anak dikira</div>}
              {married && d.profile.spouseWorking === true && kidCount > 0 && (
                <div className="field" style={{ marginTop: 12 }}>
                  <label>Child relief split with your spouse · Pembahagian pelepasan anak</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div className="seg">
                      <label className="seg-opt"><input type="radio" name="fs-child-share" checked={d.profile.childShare !== 50} onChange={() => mut((x) => { x.profile.childShare = 100; })} />I claim 100%</label>
                      <label className="seg-opt"><input type="radio" name="fs-child-share" checked={d.profile.childShare === 50} onChange={() => mut((x) => { x.profile.childShare = 50; })} />We split 50 / 50</label>
                    </div>
                    <span className="text-muted" style={{ fontSize: 12 }}>Both of you earning and filing separately: one parent claims all of it, or each claims half — never both in full. <span lang="ms">Seorang tuntut penuh, atau masing-masing separuh.</span></span>
                  </div>
                </div>
              )}
              <div style={{ fontSize: 12.5, marginTop: 12, fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
                Counted for {d.ya}: {fmt(total)} <span className="text-muted" style={{ fontWeight: 400 }}>· Dikira untuk {d.ya}{Object.keys(derivedNow).length ? ' — ' + Object.entries(derivedNow).map(([k, v]) => k.replace('_', ' ') + ' ' + fmt(v)).join(', ') : ''}</span>
              </div>
            </>
          );
        })()}
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
          <div style={{ maxWidth: 520 }}>
            <div className="fields2">
              <div className="field" style={{ margin: 0 }}>
                <label>New passcode (min 4 characters)</label>
                <input className="input mono" type="password" aria-label="New passcode · Kod baharu" value={pinNew} onChange={(e) => setPinNew(e.target.value)} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Confirm passcode · Sahkan</label>
                <input className="input mono" type="password" aria-label="Confirm passcode · Sahkan" value={pinConfirm} onChange={(e) => setPinConfirm(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => {
              const p = pinNew.trim();
              if (p.length < 4) { setPinMsg('Passcode must be at least 4 characters. · Kod mesti sekurang-kurangnya 4 aksara.'); return; }
              if (p !== pinConfirm.trim()) { setPinMsg('Passcodes don’t match — type the same code twice. · Kod tidak sepadan — taip kod yang sama dua kali.'); return; }
              mut((x) => { x.profile.pin = p; });
              setPinNew('');
              setPinConfirm('');
              setPinMsg('Passcode set — the app will ask for it on next open. · Kod ditetapkan.');
            }}>Set passcode · Tetapkan</button>
          </div>
        ) : (
          <div className="btnrow">
            <button className="btn btn-secondary" onClick={lockNow}>Lock now · Kunci sekarang</button>
            <button className="btn btn-ghost" onClick={() => { mut((x) => { delete x.profile.pin; }); setPinMsg('Passcode removed. · Kod dibuang.'); }}>Remove passcode</button>
          </div>
        )}
        {pinMsg && <div style={{ fontSize: 12, marginTop: 10, color: 'var(--color-accent-700)' }}>{pinMsg}</div>}
      </div>

      <div style={{ border: '2px solid var(--color-divider)', borderTop: 0, padding: 24 }}>
        <Kick>Install · Pasang</Kick>
        <p className="text-muted" style={{ fontSize: 12.5, margin: '8px 0 14px' }}>
          Installed to your Home Screen, DuitBack keeps its data for good. In Safari on iPhone and iPad, a site you haven&apos;t opened for 7 days can have its stored data cleared — an installed app is exempt.{' '}
          <span lang="ms">Pasang ke Skrin Utama supaya data kekal — Safari boleh memadam data laman web yang tidak dibuka selama 7 hari.</span>
        </p>
        {standalone ? (
          <div style={{ fontSize: 13, fontFamily: 'var(--font-heading)', fontWeight: 800 }}>✓ Installed on this device · Dipasang pada peranti ini</div>
        ) : ios ? (
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13.5, lineHeight: 1.7 }}>
            <li>Open this page in Safari and tap <strong>Share</strong> (the square with an arrow). <span lang="ms">Ketik <strong>Kongsi</strong>.</span></li>
            <li>Choose <strong>Add to Home Screen</strong>. <span lang="ms">Pilih <strong>Tambah ke Skrin Utama</strong>.</span></li>
            <li>Tap <strong>Add</strong>, then open DuitBack from the Home Screen icon. <span lang="ms">Ketik <strong>Tambah</strong>.</span></li>
          </ol>
        ) : api.install ? (
          <button className="btn btn-secondary" onClick={api.install}>Install DuitBack · Pasang</button>
        ) : (
          <div className="text-muted" style={{ fontSize: 12.5 }}>In your browser menu, choose <strong>Install app</strong> or <strong>Add to Home Screen</strong>. <span lang="ms">Dalam menu pelayar, pilih Pasang aplikasi.</span></div>
        )}
        {persisted !== null && (
          <div className="text-muted" style={{ fontSize: 12, marginTop: 10 }}>
            Persistent storage · Storan kekal: {persisted ? 'granted by this browser · dibenarkan' : 'not granted yet — keep a vault backup · belum dibenarkan, simpan sandaran'}
          </div>
        )}
      </div>

      <div style={{ border: '2px solid var(--color-divider)', borderTop: 0, padding: 24 }}>
        <Kick>Data · Data</Kick>
        <p className="text-muted" style={{ fontSize: 12.5, margin: '8px 0 14px' }}>
          Claims and thumbnails live in this browser&apos;s localStorage; full-size receipt images in IndexedDB. Nothing is sent to a server — each visitor to a hosted copy gets their own private data. <strong>Export vault</strong> gives you a ZIP with the JSON <em>and</em> every original receipt — keep it in Files, Drive or iCloud for LHDN&apos;s 7-year audit window. JSON alone moves your records between devices (thumbnails travel; originals don&apos;t).{' '}
          <span lang="ms">Semua data kekal dalam pelayar ini. Eksport peti (ZIP) mengandungi JSON dan semua resit asal — simpan untuk tempoh audit 7 tahun LHDN.</span>
        </p>
        <div className="btnrow">
          <button className="btn btn-primary" onClick={() => { exportVault(d).then((n) => setDataMsg('Vault exported' + (n ? ' with ' + n + ' receipt original' + (n === 1 ? '' : 's') : '') + '. · Peti dieksport.')); }}>Export vault (ZIP) · Eksport peti</button>
          <button className="btn btn-secondary" onClick={() => { exportJson(d); setDataMsg('Backup exported. · Sandaran dieksport.'); }}>Export data (JSON)</button>
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
          <button className="btn btn-secondary" onClick={() => {
            if (!isDemo(d) && !stashReal(d)) {
              setDataMsg('Not enough browser storage to keep your data safe while trying the demo — export a JSON backup first. · Storan tidak mencukupi — eksport sandaran JSON dahulu.');
              return;
            }
            save(demoData(), 'Demo data loaded — your own data comes back when you exit the demo. · Data anda kembali apabila keluar demo.');
          }}>Load demo data · Muat demo</button>
          <button className="btn btn-ghost" onClick={() => ask('Clear everything? All years, claims and receipts in this browser will be erased — export a JSON backup first. · Padam semua? Eksport sandaran JSON dahulu.', clearAll)}>Clear everything · Padam semua</button>
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
          DuitBack is an unofficial personal tracker for Malaysian resident individual (BE/B) returns. Caps follow each year&apos;s LHDN schedule — YA2026 includes the Budget 2026 changes; YA2023–25 use that year&apos;s caps (historical ones approximate) — incl. medical sub-limits and per-child relief; the tax scale is the YA2025 resident scale, unchanged for YA2026. Not affiliated with LHDN; no tax advice — always confirm figures in MyTax before filing.{' '}
          <span lang="ms">Penjejak peribadi tidak rasmi — tiada kaitan dengan LHDN dan bukan nasihat cukai. Sentiasa sahkan angka dalam MyTax sebelum memfailkan.</span>
        </p>
      </div>
    </div>
  );
}
