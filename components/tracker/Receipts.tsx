import { useState } from 'react';
import { CATS, uid } from '@/lib/tax';
import { delFile, exportJson, getFile, putFile, readFiles } from '@/lib/data';
import { Api } from './App';
import { YaTabs, pagepad, heading800 } from './bits';
import { yearsOf } from './derive';
import type { TagState, ViewerState } from './dialogs';

export function Receipts({ api, setTag, setViewer }: { api: Api; setTag: (t: TagState) => void; setViewer: (v: ViewerState) => void }) {
  const { d, ya, mut, setDlg } = api;
  const years = yearsOf(d);
  const [rFilter, setRFilter] = useState('all');
  const [rSearch, setRSearch] = useState('');

  const recAll = d.receipts.filter((r) => r.ya === ya);
  const counts: Record<string, number> = {};
  recAll.forEach((r) => { const k = r.cat || 'untagged'; counts[k] = (counts[k] || 0) + 1; });
  const filters: Array<{ id: string; label: string }> = [{ id: 'all', label: 'All · Semua (' + recAll.length + ')' }];
  CATS.forEach((ct) => { if (counts[ct.id]) filters.push({ id: ct.id, label: ct.en.split(' — ')[0].split(' &')[0] + ' (' + counts[ct.id] + ')' }); });
  if (counts.untagged) filters.push({ id: 'untagged', label: 'Unlinked · Belum dipaut (' + counts.untagged + ')' });

  let recs = recAll;
  if (rFilter === 'untagged') recs = recs.filter((r) => !r.cat);
  else if (rFilter !== 'all') recs = recs.filter((r) => r.cat === rFilter);
  if (rSearch) recs = recs.filter((r) => (r.name + ' ' + (r.sub || '')).toLowerCase().includes(rSearch.toLowerCase()));

  const addReceipt = (name: string, thumb: string | null, full: string) => {
    const id = uid();
    if (full) putFile(id, full);
    mut((dd) => { dd.receipts.unshift({ id, ya: dd.ya, cat: null, name, sub: 'Uploaded · untagged', thumb, hasFull: !!full }); });
  };

  const openViewer = (r: (typeof recAll)[number]) => {
    setViewer({ id: r.id, name: r.name, sub: r.sub || '', src: r.thumb || null, note: r.hasFull ? 'Loading file…' : 'No stored file — demo receipts are placeholders; your own uploads open here.' });
    setDlg('view');
    if (r.hasFull) getFile(r.id).then((full) => { if (full) setViewer({ id: r.id, name: r.name, sub: r.sub || '', src: full, note: '' }); });
  };

  return (
    <div
      className="pagepad"
      data-screen-label="Receipts"
      style={pagepad(1360)}
      onDrop={(e) => { e.preventDefault(); readFiles(e.dataTransfer.files, addReceipt); }}
      onDragOver={(e) => e.preventDefault()}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, marginRight: 'auto' }}>Receipt vault <span className="bm" style={{ fontSize: 15 }}>· Peti resit</span></h2>
        <input className="input" style={{ width: 230 }} placeholder="Search merchant, file… · Cari" value={rSearch} onChange={(e) => setRSearch(e.target.value)} />
        <YaTabs tabs={years.map((y) => ({ label: y, on: y === ya, pick: () => mut((x) => { x.ya = y; }) }))} />
      </div>

      <div style={{ display: 'flex', gap: 8, margin: '16px 0', flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <span key={f.id} className={'tag ' + (rFilter === f.id ? 'tag-accent' : f.id === 'untagged' ? 'tag-outline' : 'tag-neutral')} style={{ cursor: 'pointer' }} onClick={() => setRFilter(f.id)}>
            {f.label}
          </span>
        ))}
      </div>

      <div data-tour="drop-zone" style={{ border: '2px dashed var(--color-divider)', padding: 16, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-accent)' }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <div style={{ flex: 1, minWidth: 240 }}>
          <span style={{ ...heading800, fontSize: 13 }}>Drop receipts here · Seret resit ke sini</span>{' '}
          <span className="text-muted" style={{ fontSize: 12 }}>— full-size images go to this browser&apos;s IndexedDB; thumbnails stay in the app. Tag them to a relief and they count. <span lang="ms">Tag kepada pelepasan supaya dikira.</span></span>
        </div>
        <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
          Browse files
          <input type="file" accept="image/*,.pdf" multiple style={{ display: 'none' }} onChange={(e) => { readFiles(e.target.files!, addReceipt); e.target.value = ''; }} />
        </label>
        <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
          Camera · Kamera
          <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => { readFiles(e.target.files!, addReceipt); e.target.value = ''; }} />
        </label>
      </div>

      {recs.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          {recs.map((r) => {
            const ct = CATS.find((x) => x.id === r.cat);
            return (
              <div key={r.id} style={{ border: '1px solid ' + (r.cat ? 'var(--color-divider)' : 'var(--color-accent)'), background: r.cat ? 'var(--color-bg)' : 'var(--color-accent-100)' }}>
                <div style={{ height: 110, background: 'var(--color-neutral-200)', display: 'grid', placeItems: 'center', overflow: 'hidden', cursor: 'pointer' }} className="text-muted" onClick={() => openViewer(r)}>
                  {r.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.thumb} alt={r.name} className="grayscale" style={{ width: '100%', height: 110, objectFit: 'cover' }} />
                  ) : (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M16 13H8" /><path d="M16 17H8" />
                    </svg>
                  )}
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ ...heading800, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                  <div style={{ fontSize: 11.5 }} className="text-muted">{r.sub}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className={'tag ' + (r.cat ? 'tag-accent' : 'tag-outline')}>{ct ? ct.en.split(' — ')[0].split(' &')[0] : 'Needs tags · Perlu tag'}</span>
                    {!r.cat && (
                      <button className="navlink linkbtn" style={{ fontSize: 12, marginLeft: 'auto' }} onClick={() => { setTag({ rid: r.id, cat: 'lifestyle', merchant: '', amount: '', makeClaim: true }); setDlg('tag'); }}>Tag →</button>
                    )}
                    {r.cat && (
                      <button className="navlink linkbtn" style={{ fontSize: 11, marginLeft: 'auto' }} onClick={() => { if (!window.confirm('Delete this receipt? · Padam resit ini?')) return; delFile(r.id); mut((dd) => { dd.receipts = dd.receipts.filter((q) => q.id !== r.id); }); }}>Delete</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ border: '2px dashed var(--color-divider)', padding: 36, maxWidth: 560 }}>
          <div style={{ ...heading800, fontSize: 18 }}>Vault is empty · Peti kosong</div>
          <p className="text-muted" style={{ fontSize: 13, margin: '6px 0 0' }}>Drop a file above, or add a claim with a receipt attached — everything is kept 7 years for audit. <span lang="ms">Semua disimpan 7 tahun untuk audit.</span></p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, fontSize: 12, flexWrap: 'wrap', gap: 8 }} className="text-muted">
        <span>{recAll.length} receipts for {ya} · stored in this browser · kept 7 years for audit · disimpan 7 tahun</span>
        <button className="navlink linkbtn" onClick={() => exportJson(d)} style={{ fontSize: 12 }}>Export data (JSON) →</button>
      </div>
    </div>
  );
}
