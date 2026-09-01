import { CATS, CHILDSUB, Claim, MEDSUB, CalcResult, capFor, fmt, medSum, to2dp, today, uid } from '@/lib/tax';
import { putFile, readFiles } from '@/lib/data';
import { Api } from './App';
import { MoneyInput } from './bits';

export interface AddState {
  cat: string;
  sub: string;
  childSub: string;
  date: string;
  amount: string;
  desc: string;
  fileName: string | null;
  fileThumb: string | null;
  fileFull: string | null;
  monthly: boolean;
  editId?: string;
}

export const freshAdd = (cat?: string): AddState => ({
  cat: cat || 'lifestyle', sub: 'general', childSub: 'u18', date: today(), amount: '', desc: '',
  fileName: null, fileThumb: null, fileFull: null, monthly: false,
});

/** Prefill the dialog from an existing claim for in-place editing. */
export const editState = (cl: Claim): AddState => ({
  cat: cl.cat,
  sub: cl.sub || 'general',
  childSub: CHILDSUB.find((m) => m.amt === cl.amount)?.id || 'u18',
  date: cl.date,
  amount: String(cl.amount),
  desc: cl.desc === '(no description)' ? '' : cl.desc,
  fileName: null, fileThumb: null, fileFull: null, monthly: false,
  editId: cl.id,
});

export interface TagState {
  rid: string | null;
  cat: string;
  merchant: string;
  amount: string;
  makeClaim: boolean;
}

export interface ViewerState {
  id: string | null;
  name: string;
  sub: string;
  src: string | null;
  note: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function catOptions(yaNum: number) {
  return CATS.filter((x) => !x.auto).map((x) => ({
    id: x.id,
    label: x.en + (x.id === 'child' ? ' — fixed per child' : x.id === 'donation' ? ' — 10% of income' : ' — max ' + fmt(capFor(x.id, yaNum))),
  }));
}

export function AddClaimDialog({ api, c, add, setAdd, onSaved }: { api: Api; c: CalcResult; add: AddState; setAdd: (a: AddState) => void; onSaved: (cat: string) => void }) {
  const { ya, mut, setDlg, ask } = api;
  const yaNum = +ya.slice(2);
  const addCt = CATS.find((x) => x.id === add.cat);

  let capNote = '', capNoteCls = 'text-muted';
  if (addCt) {
    const others = c.claims.filter((x) => x.id !== add.editId);
    const already = add.cat === 'medical'
      ? medSum(others.filter((x) => x.cat === 'medical'))
      : others.filter((x) => x.cat === add.cat).reduce((a, x) => a + (+x.amount || 0), 0);
    const cap = add.cat === 'donation' ? c.donCap : capFor(add.cat, yaNum);
    const each = +add.amount || 0;
    const total = add.monthly ? each * 12 : each;
    const after = already + total;
    const sub = MEDSUB.find((m) => m.id === add.sub);
    const subCap = add.cat === 'medical' && sub && sub.cap ? sub.cap : null;
    const subAlready = subCap ? c.claims.filter((x) => x.cat === 'medical' && (x.sub || 'general') === add.sub).reduce((a, x) => a + (+x.amount || 0), 0) : 0;
    if (cap === Infinity) capNote = addCt.note || '';
    else if (cap === 0 && add.cat === 'donation') { capNote = 'Donations count up to 10% of your declared income — enter your income first, or this line counts RM 0 for now. · Derma dikira sehingga 10% pendapatan — isi pendapatan anda dahulu.'; capNoteCls = ''; }
    else if (cap === 0) { capNote = 'This relief is not available for ' + ya + ' — it can be saved for your records but counts RM 0. · Pelepasan ini tiada untuk ' + ya + ' — dikira RM 0.'; capNoteCls = ''; }
    else if (subCap && subAlready + total > subCap) {
      capNote = (add.monthly ? '12 × ' + fmt(each) + ' = ' + fmt(total) + '. ' : '') + 'Over the ' + fmt(subCap) + ' sub-limit for this medical type — only ' + fmt(subCap) + ' counts here. Saved and flagged. · Melebihi had kecil ' + fmt(subCap) + ' — hanya ' + fmt(subCap) + ' dikira.';
      capNoteCls = '';
    }
    else if (after > cap) {
      capNote = (add.monthly ? '12 × ' + fmt(each) + ' = ' + fmt(total) + '. ' : '') + 'This takes ' + addCt.en + ' to ' + fmt(after) + ' — ' + fmt(after - cap) + ' over the ' + fmt(cap) + ' cap. Saved and flagged; only ' + fmt(cap) + ' counts. · Melebihi had ' + fmt(cap) + ' — disimpan dan ditanda; hanya ' + fmt(cap) + ' dikira.';
      capNoteCls = '';
    } else {
      capNote = (add.monthly ? '12 × ' + fmt(each) + ' = ' + fmt(total) + '. ' : '') + fmt(cap - after) + ' left under the ' + fmt(cap) + ' cap after this. · Baki ' + fmt(cap - after) + ' di bawah had. ' + (add.cat === 'medical' && sub && sub.cap ? 'Sub-limit for this type · Had kecil jenis ini: ' + fmt(sub.cap) + '. ' : '') + (addCt.note || '');
    }
  }

  const editTarget = add.editId ? api.d.claims.find((q) => q.id === add.editId) : undefined;

  const saveClaim = () => {
    const amt = to2dp(+add.amount || 0);
    if (!amt) { setDlg(null); return; }
    if (add.editId) {
      const attach = add.fileName && editTarget && !editTarget.receipt;
      const recId2 = attach ? uid() : null;
      if (attach && add.fileFull) putFile(recId2!, add.fileFull);
      mut((dd) => {
        const cl = dd.claims.find((q) => q.id === add.editId);
        if (!cl) return;
        cl.cat = add.cat;
        cl.sub = add.cat === 'medical' ? add.sub : undefined;
        cl.date = add.date || cl.date;
        cl.desc = add.desc || '(no description)';
        cl.amount = amt;
        if (attach) {
          cl.receipt = add.fileName;
          dd.receipts.unshift({ id: recId2!, ya: dd.ya, cat: add.cat, name: add.fileName!, sub: (add.desc || '') + ' · ' + fmt(amt), thumb: add.fileThumb, hasFull: !!add.fileFull });
        }
      });
      setDlg(null);
      onSaved(add.cat);
      return;
    }
    let recId: string | null = null;
    if (add.fileName) { recId = uid(); if (add.fileFull) putFile(recId, add.fileFull); }
    mut((dd) => {
      const yr = +dd.ya.slice(2);
      if (add.monthly) {
        for (let m = 1; m <= 12; m++) {
          const mm = String(m).padStart(2, '0');
          dd.claims.unshift({ id: uid(), ya: dd.ya, cat: add.cat, sub: add.cat === 'medical' ? add.sub : undefined, date: yr + '-' + mm + '-15', desc: (add.desc || '(recurring)') + ' — ' + MONTHS[m - 1], amount: amt, receipt: m === 1 ? add.fileName || null : null });
        }
      } else {
        dd.claims.unshift({ id: uid(), ya: dd.ya, cat: add.cat, sub: add.cat === 'medical' ? add.sub : undefined, date: add.date || today(), desc: add.desc || '(no description)', amount: amt, receipt: add.fileName || null });
      }
      if (add.fileName) dd.receipts.unshift({ id: recId!, ya: dd.ya, cat: add.cat, name: add.fileName, sub: (add.desc || '') + ' · ' + fmt(add.monthly ? amt * 12 : amt), thumb: add.fileThumb, hasFull: !!add.fileFull });
    });
    setDlg(null);
    onSaved(add.cat);
  };

  return (
    <div className="dialog-backdrop" style={{ zIndex: 20 }} onClick={() => setDlg(null)}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-title">{add.editId ? 'Edit claim · Sunting tuntutan' : 'New claim · Tuntutan baharu'} <span className="bm" style={{ fontSize: 13 }}>({ya})</span></div>
        <div className="field">
          <label>Relief category · Kategori</label>
          <select className="input" value={add.cat} onChange={(e) => setAdd({ ...add, cat: e.target.value })}>
            {catOptions(yaNum).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
        {add.cat === 'medical' && (
          <div className="field">
            <label>Medical sub-type · Jenis (sub-limits enforced)</label>
            <select className="input" value={add.sub} onChange={(e) => setAdd({ ...add, sub: e.target.value })}>
              {MEDSUB.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
        )}
        {add.cat === 'child' && (
          <div className="field">
            <label>Child type · Jenis (sets the fixed amount — one line per child)</label>
            <select className="input" value={add.childSub} onChange={(e) => {
              const m = CHILDSUB.find((x) => x.id === e.target.value);
              setAdd({ ...add, childSub: e.target.value, amount: m ? String(m.amt) : add.amount });
            }}>
              {CHILDSUB.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="field"><label>Date · Tarikh</label><input className="input" type="date" value={add.date} onChange={(e) => setAdd({ ...add, date: e.target.value })} /></div>
          <div className="field"><label>Amount · Jumlah (RM)</label><MoneyInput ariaLabel="Amount · Jumlah (RM)" value={add.amount} onChange={(v) => setAdd({ ...add, amount: v })} /></div>
        </div>
        <div className="field"><label>Description · Keterangan</label><input className="input" placeholder="e.g. broadband bill — Unifi" value={add.desc} onChange={(e) => setAdd({ ...add, desc: e.target.value })} /></div>
        {!add.editId && (
          <label className="radio">
            <input type="checkbox" checked={add.monthly} onChange={(e) => setAdd({ ...add, monthly: e.target.checked })} />
            <span className="dot" style={{ borderRadius: 0 }} />
            Recurring — create 12 monthly lines (Jan–Dec) · Bulanan
          </label>
        )}
        {add.editId && editTarget?.receipt ? (
          <div className="field">
            <label>Receipt · Resit</label>
            <div style={{ fontSize: 12.5 }}><span className="tag tag-neutral">{editTarget.receipt}</span> <span className="text-muted">linked · dipaut</span></div>
          </div>
        ) : (
        <div className="field">
          <label>Receipt · Resit (optional)</label>
          <label style={{ border: '2px dashed var(--color-divider)', padding: 14, display: 'block', cursor: 'pointer', background: 'var(--color-bg)' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13 }}>{add.fileName ? 'Attached: ' + add.fileName : 'Attach receipt · Lampirkan resit'}</span>
            <span style={{ display: 'block', fontSize: 11.5 }} className="text-muted">JPG, PNG or PDF — saved to the vault, linked to this claim · Disimpan ke peti resit</span>
            <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              readFiles([f], (n, t, fl) => setAdd({ ...add, fileName: n, fileThumb: t, fileFull: fl }));
              e.target.value = '';
            }} />
          </label>
        </div>
        )}
        <div style={{ fontSize: 11.5 }} className={capNoteCls}>{capNote}</div>
        <div className="dialog-actions">
          {add.editId && (
            <button className="btn btn-ghost" style={{ marginRight: 'auto' }} onClick={() => ask('Delete this claim? · Padam tuntutan ini?', () => {
              mut((dd) => { dd.claims = dd.claims.filter((q) => q.id !== add.editId); });
              setDlg(null);
            })}>Delete · Padam</button>
          )}
          <button className="btn btn-secondary" onClick={() => setDlg(null)}>Cancel</button>
          <button className="btn btn-primary" disabled={!(+add.amount > 0)} onClick={saveClaim}>Save claim · Simpan</button>
        </div>
      </div>
    </div>
  );
}

export function TagDialog({ api, tag, setTag }: { api: Api; tag: TagState; setTag: (t: TagState) => void }) {
  const { d, ya, mut, setDlg } = api;
  const yaNum = +ya.slice(2);
  const rec = d.receipts.find((r) => r.id === tag.rid);

  const saveTag = () => {
    mut((dd) => {
      const r = dd.receipts.find((x) => x.id === tag.rid);
      if (!r) return;
      r.cat = tag.cat;
      const amt = to2dp(+tag.amount || 0);
      r.sub = (tag.merchant || 'Receipt') + (amt ? ' · ' + fmt(amt) : '');
      if (tag.makeClaim && amt) dd.claims.unshift({ id: uid(), ya: dd.ya, cat: tag.cat, sub: tag.cat === 'medical' ? 'general' : undefined, date: today(), desc: tag.merchant || r.name, amount: amt, receipt: r.name });
    });
    setDlg(null);
  };

  return (
    <div className="dialog-backdrop" style={{ zIndex: 20 }} onClick={() => setDlg(null)}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-title">Tag receipt · Tag resit</div>
        <div className="dialog-body" style={{ margin: 0 }}>{rec?.name || ''}</div>
        <div className="field">
          <label>Relief category · Kategori</label>
          <select className="input" value={tag.cat} onChange={(e) => setTag({ ...tag, cat: e.target.value })}>
            {catOptions(yaNum).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="field"><label>Merchant · Kedai</label><input className="input" value={tag.merchant} onChange={(e) => setTag({ ...tag, merchant: e.target.value })} /></div>
          <div className="field"><label>Amount · Jumlah (RM)</label><MoneyInput ariaLabel="Amount · Jumlah (RM)" value={tag.amount} onChange={(v) => setTag({ ...tag, amount: v })} /></div>
        </div>
        <label className="radio" style={{ marginTop: 4 }}>
          <input type="checkbox" checked={tag.makeClaim} onChange={(e) => setTag({ ...tag, makeClaim: e.target.checked })} />
          <span className="dot" style={{ borderRadius: 0 }} />
          Also create a claim line for this amount · Cipta baris tuntutan sekali
        </label>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={() => setDlg(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={saveTag}>Save · Simpan</button>
        </div>
      </div>
    </div>
  );
}

export function ViewerDialog({ api, viewer }: { api: Api; viewer: ViewerState; setViewer: (v: ViewerState) => void }) {
  const { setDlg } = api;
  const vsrc = viewer.src || '';
  const isPdf = typeof vsrc === 'string' && vsrc.startsWith('data:application/pdf');
  return (
    <div className="dialog-backdrop" style={{ zIndex: 20 }} onClick={() => setDlg(null)}>
      <div className="dialog" style={{ width: 'min(720px,100%)' }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-title" style={{ fontSize: 16 }}>{viewer.name}</div>
        <div style={{ background: 'var(--color-neutral-200)', display: 'grid', placeItems: 'center', minHeight: 200, maxHeight: '60vh', overflow: 'auto' }}>
          {isPdf ? (
            <embed src={vsrc} type="application/pdf" style={{ width: 660, maxWidth: '100%', height: '55vh' }} />
          ) : vsrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vsrc} alt={viewer.name} style={{ maxWidth: '100%', display: 'block' }} />
          ) : (
            <div className="text-muted" style={{ fontSize: 13, padding: 30 }}>{viewer.note}</div>
          )}
        </div>
        <div className="dialog-body" style={{ margin: 0 }}>{viewer.sub}</div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={() => setDlg(null)}>Close</button>
        </div>
      </div>
    </div>
  );
}
