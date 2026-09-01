import { CATS, CalcResult, fmt, today } from '@/lib/tax';
import { exportJson } from '@/lib/data';
import { Api } from './App';
import { Kick, YaTabs, pagepad, right, heading800 } from './bits';
import { deadlineInfo, reliefRows, yearsOf } from './derive';

export function FilingPack({ api, c }: { api: Api; c: CalcResult }) {
  const { d, ya, mut } = api;
  const years = yearsOf(d);
  const dl = deadlineInfo(d, ya, c);
  const rows = reliefRows(c, ya).filter((r) => r.claimed > 0);
  const recAll = d.receipts.filter((r) => r.ya === ya);
  const balLabel = c.balance < 0 ? 'Estimated refund · Anggaran bayaran balik' : 'Estimated balance payable · Anggaran baki';

  return (
    <div className="pagepad" data-screen-label="Filing pack" style={pagepad(1000)}>
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
        <YaTabs tabs={years.map((y) => ({ label: y, on: y === ya, pick: () => mut((x) => { x.ya = y; }) }))} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => window.print()}>Print / save as PDF</button>
          <button className="btn btn-secondary" onClick={() => exportJson(d)}>Export data (JSON)</button>
        </div>
      </div>
      <div data-tour="pack-sheet">
        <Kick>Filing pack · Pek pemfailan</Kick>
        <h1 style={{ margin: '6px 0 2px', fontSize: 32 }}>{ya} — {c.formType} form cheat-sheet</h1>
        <p className="text-muted" style={{ fontSize: 12.5 }}>
          Everything to type into MyTax e-Filing for {ya} — generated {today()} for {d.profile.name || 'you'} ({d.profile.taxNo || 'no tax file no.'}). Figures are estimates.
        </p>
      </div>
      <hr className="hr" />

      <h6 style={{ margin: '18px 0 6px' }}>1 · Income to declare · Pendapatan</h6>
      <table className="table" style={{ fontSize: 13 }}>
        <tbody>
          <tr><td>Employment (salary + bonus) · Penggajian</td><td style={right} className="mono">{fmt((+c.inc.salary || 0) + (+c.inc.bonus || 0))}</td></tr>
          <tr><td>Net rental · Sewaan bersih</td><td style={right} className="mono">{fmt(c.netRent)}</td></tr>
          <tr><td>Business (net) · Perniagaan</td><td style={right} className="mono">{fmt(c.inc.biz || 0)}</td></tr>
          <tr><td>Other · Lain-lain</td><td style={right} className="mono">{fmt(c.inc.other || 0)}</td></tr>
          <tr><td style={heading800}>Total · Jumlah</td><td style={{ ...right, ...heading800 }} className="mono">{fmt(c.totalIncome)}</td></tr>
        </tbody>
      </table>

      <h6 style={{ margin: '22px 0 6px' }}>2 · Reliefs to type into MyTax · Pelepasan</h6>
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
                <td style={{ ...right, ...heading800 }} className="mono">{fmt(r.allowed)}</td>
                <td style={right} className="mono">{fmt(r.claimed)}</td>
                <td className="text-muted" style={{ fontSize: 11.5 }}>{evid.length ? evid.join(', ') : r.id === 'individual' ? 'automatic — none needed' : 'no receipts linked'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h6 style={{ margin: '22px 0 6px' }}>3 · Result · Keputusan</h6>
      <table className="table" style={{ fontSize: 13 }}>
        <tbody>
          <tr><td>Chargeable income · Pendapatan bercukai</td><td style={right} className="mono">{fmt(c.chargeable)}</td></tr>
          <tr><td>Tax after rebates &amp; zakat</td><td style={right} className="mono">{fmt(c.taxNet)}</td></tr>
          <tr><td>Already paid (PCB + CP500)</td><td style={right} className="mono">{fmt(c.paid)}</td></tr>
          <tr><td style={heading800}>{balLabel}</td><td style={{ ...right, ...heading800 }} className="mono">{fmt(Math.abs(c.balance))}</td></tr>
        </tbody>
      </table>

      <h6 style={{ margin: '22px 0 6px' }}>4 · Receipts on file · Resit ({recAll.length})</h6>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
        {recAll.map((r) => {
          const ct = CATS.find((x) => x.id === r.cat);
          return (
            <div key={r.id} style={{ border: '1px solid var(--color-divider)' }}>
              {r.thumb && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.thumb} alt={r.name} className="grayscale" style={{ width: '100%', height: 80, objectFit: 'cover' }} />
              )}
              <div style={{ padding: '6px 8px' }}>
                <div style={{ fontSize: 11, ...heading800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                <div style={{ fontSize: 10 }} className="text-muted">{ct ? ct.en.split(' — ')[0].split(' &')[0] : 'untagged'}</div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-muted" style={{ fontSize: 11, marginTop: 18 }}>
        Generated by DuitBack — unofficial, estimates only. Keep receipts 7 years. Confirm every figure in MyTax before submitting. · Anggaran sahaja, sahkan dalam MyTax.
      </p>
    </div>
  );
}
