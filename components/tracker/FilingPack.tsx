import { CATS, CalcResult, fmt, today } from '@/lib/tax';
import { exportJson } from '@/lib/data';
import { Api } from './App';
import { Kick, Wordmark, YaTabs, pagepad, right, heading800 } from './bits';
import { deadlineInfo, reliefRows, yearsOf } from './derive';

/** The filing pack doubles as the printed document: screen shows the working
 *  view, print (Save as PDF) gets a letterhead, a summary strip, numbered
 *  sections and a receipts index — see the `.pack` rules in tracker.css. */
export function FilingPack({ api, c }: { api: Api; c: CalcResult }) {
  const { d, ya, mut } = api;
  const years = yearsOf(d);
  const dl = deadlineInfo(d, ya, c);
  const rows = reliefRows(c, ya).filter((r) => r.claimed > 0);
  const recAll = d.receipts.filter((r) => r.ya === ya);
  const refund = c.balance < 0;
  const balLabel = refund ? 'Estimated refund · Anggaran bayaran balik' : 'Estimated balance payable · Anggaran baki';
  const employment = Math.floor((+c.inc.salary || 0) + (+c.inc.bonus || 0));
  const incomeTotal = employment + Math.floor(c.compTaxable) + Math.floor(c.netRent) + Math.floor(c.inc.biz || 0) + Math.floor(c.inc.other || 0) + Math.floor(c.dividends);
  const catName = (id: string | null) => { const ct = CATS.find((x) => x.id === id); return ct ? ct.en.split(' — ')[0].split(' &')[0] : 'untagged'; };

  return (
    <div className="pagepad pack" data-screen-label="Filing pack" style={pagepad(1000)}>
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
        <YaTabs tabs={years.map((y) => ({ label: y, on: y === ya, pick: () => mut((x) => { x.ya = y; }) }))} />
        <div className="btnrow">
          <button className="btn btn-primary" onClick={() => window.print()}>Save as PDF / print · Simpan PDF</button>
          <button className="btn btn-secondary" onClick={() => exportJson(d)}>Export data (JSON)</button>
        </div>
      </div>

      <header className="pack-head" data-tour="pack-sheet">
        <div>
          <div className="print-only pack-brand"><Wordmark width={118} /></div>
          <Kick>Filing pack · Pek pemfailan</Kick>
          <h1 style={{ margin: '6px 0 2px', fontSize: 32 }}>{ya} — {c.formType} form cheat-sheet</h1>
          <p className="text-muted" style={{ fontSize: 12.5, margin: 0 }}>
            Everything to type into MyTax e-Filing for {ya} — generated {today()} for {d.profile.name || 'you'} ({d.profile.taxNo || 'no tax file no.'}). Figures are estimates.
          </p>
        </div>
        <dl className="print-only pack-meta">
          <dt>Taxpayer · Pembayar cukai</dt><dd>{d.profile.name || '—'}</dd>
          <dt>Tax file no. · No. cukai</dt><dd className="mono">{d.profile.taxNo || '—'}</dd>
          <dt>Year of assessment</dt><dd>{ya} · Form {c.formType}</dd>
          <dt>Filing deadline · Tarikh akhir</dt><dd>{dl.dlLabel}</dd>
          <dt>Generated · Dijana</dt><dd className="mono">{today()}</dd>
        </dl>
      </header>

      <div className="print-only pack-glance">
        <div><div className="k">Total income</div><div className="v mono">{fmt(c.totalIncome)}</div></div>
        <div><div className="k">Reliefs allowed</div><div className="v mono">{fmt(c.totalAllowed)}</div></div>
        <div><div className="k">Chargeable</div><div className="v mono">{fmt(c.chargeable)}</div></div>
        <div><div className="k">Tax after rebates</div><div className="v mono">{fmt(c.taxNet)}</div></div>
        <div><div className="k">Already paid</div><div className="v mono">{fmt(c.paid)}</div></div>
        <div className={'hero ' + (refund ? 'refund' : 'due')}><div className="k">{refund ? 'Est. refund · Bayaran balik' : 'Est. balance · Baki'}</div><div className="v mono">{fmt(Math.abs(c.balance))}</div></div>
      </div>

      <hr className="hr" />
      <p className="text-muted pack-note" style={{ fontSize: 11.5, margin: '10px 0 0' }}>
        Enter amounts in RM without sen — LHDN&apos;s forms drop the sen rather than rounding (RM 125,955.67 is entered as 125,955). Your sen-accurate records stay in the receipts column.{' '}
        <span lang="ms">Isi amaun tanpa sen mengikut kehendak borang LHDN — sen digugurkan, bukan dibundarkan.</span>
      </p>

      <h2 className="sec" style={{ margin: '18px 0 6px' }}>1 · Income to declare · Pendapatan</h2>
      <div className="keep" style={{ overflowX: 'auto' }}>
      <table className="table" style={{ fontSize: 13 }}>
        <thead className="print-only"><tr><th>Source · Punca</th><th style={right}>Amount to enter (RM)</th></tr></thead>
        <tbody>
          <tr><td>Employment (salary + bonus) · Penggajian</td><td style={right} className="mono">{fmt(employment)}</td></tr>
          {c.compTaxable > 0 && <tr><td>Compensation for loss of employment, taxable part · Pampasan</td><td style={right} className="mono">{fmt(Math.floor(c.compTaxable))}</td></tr>}
          <tr><td>Net rental · Sewaan bersih</td><td style={right} className="mono">{fmt(Math.floor(c.netRent))}</td></tr>
          <tr><td>Business (net) · Perniagaan</td><td style={right} className="mono">{fmt(Math.floor(c.inc.biz || 0))}</td></tr>
          <tr><td>Other · Lain-lain</td><td style={right} className="mono">{fmt(Math.floor(c.inc.other || 0))}</td></tr>
          {c.dividends > 0 && <tr><td>Dividends · Dividen</td><td style={right} className="mono">{fmt(Math.floor(c.dividends))}</td></tr>}
          <tr className="total"><td style={heading800}>Total · Jumlah</td><td style={{ ...right, ...heading800 }} className="mono">{fmt(incomeTotal)}</td></tr>
        </tbody>
      </table>
      </div>

      <h2 className="sec" style={{ margin: '22px 0 6px' }}>2 · Reliefs to type into MyTax · Pelepasan</h2>
      <div style={{ overflowX: 'auto' }}>
      <table className="table" style={{ fontSize: 13 }}>
        <thead>
          <tr><th>Relief line</th><th style={right}>Amount to enter</th><th style={right}>Your receipts total</th><th>Evidence in vault</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const evid = c.claims.filter((x) => x.cat === r.id && x.receipt).map((x) => x.receipt);
            return (
              <tr key={r.id}>
                <td>{r.en} <span className="bm">· {r.bm}</span></td>
                <td style={{ ...right, ...heading800 }} className="mono">{fmt(Math.floor(r.allowed))}</td>
                <td style={right} className="mono">{fmt(r.claimed)}</td>
                <td className="text-muted" style={{ fontSize: 11.5 }}>{evid.length ? evid.join(', ') : r.id === 'individual' ? 'automatic — none needed' : 'no receipts linked'}</td>
              </tr>
            );
          })}
          <tr className="total"><td style={heading800}>Total reliefs allowed · Jumlah pelepasan</td><td style={{ ...right, ...heading800 }} className="mono">{fmt(Math.floor(c.totalAllowed))}</td><td /><td /></tr>
        </tbody>
      </table>
      </div>

      <h2 className="sec" style={{ margin: '22px 0 6px' }}>3 · Result · Keputusan</h2>
      <div className="keep" style={{ overflowX: 'auto' }}>
      <table className="table" style={{ fontSize: 13 }}>
        <thead className="print-only"><tr><th>Computation · Pengiraan</th><th style={right}>RM</th></tr></thead>
        <tbody>
          <tr><td>Chargeable income · Pendapatan bercukai</td><td style={right} className="mono">{fmt(c.chargeable)}</td></tr>
          <tr><td>Tax on chargeable income · Cukai{c.dividendTax > 0 ? ' (incl. 2% dividend tax ' + fmt(c.dividendTax) + ')' : ''}</td><td style={right} className="mono">{fmt(c.taxGross)}</td></tr>
          <tr><td>Less rebates &amp; zakat · Tolak rebat dan zakat</td><td style={right} className="mono">− {fmt(c.rebate + c.levyRebate + c.zakatRebate)}</td></tr>
          <tr><td>Already paid (PCB + CP500) · Telah dibayar</td><td style={right} className="mono">− {fmt(c.paid)}</td></tr>
          <tr className="total"><td style={heading800} className={refund ? 'amt-refund' : 'amt-due'}>{balLabel}</td><td style={{ ...right, ...heading800 }} className={'mono ' + (refund ? 'amt-refund' : 'amt-due')}>{fmt(Math.abs(c.balance))}</td></tr>
        </tbody>
      </table>
      </div>

      <h2 className="sec" style={{ margin: '22px 0 6px' }}>4 · Receipts on file · Resit ({recAll.length})</h2>
      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
        {recAll.map((r) => (
          <div key={r.id} style={{ border: '1px solid var(--color-divider)' }}>
            {r.thumb && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.thumb} alt={r.name} className="grayscale" style={{ width: '100%', height: 80, objectFit: 'cover' }} />
            )}
            <div style={{ padding: '6px 8px' }}>
              <div style={{ fontSize: 11, ...heading800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
              <div style={{ fontSize: 10 }} className="text-muted">{catName(r.cat)}</div>
            </div>
          </div>
        ))}
      </div>
      <table className="table print-only pack-receipts" style={{ fontSize: 13 }}>
        <thead><tr><th style={{ width: 24 }}>#</th><th>File · Fail</th><th>Relief · Pelepasan</th><th>Note · Nota</th></tr></thead>
        <tbody>
          {recAll.map((r, i) => (
            <tr key={r.id}><td className="mono">{i + 1}</td><td>{r.name}</td><td>{catName(r.cat)}</td><td className="text-muted">{r.sub}</td></tr>
          ))}
          {recAll.length === 0 && <tr><td colSpan={4} className="text-muted">No receipts filed for {ya}.</td></tr>}
        </tbody>
      </table>

      <p className="text-muted pack-legal" style={{ fontSize: 11, marginTop: 18 }}>
        Generated by DuitBack — unofficial, estimates only. Keep receipts 7 years. Confirm every figure in MyTax before submitting. · Anggaran sahaja, sahkan dalam MyTax.
      </p>
    </div>
  );
}
