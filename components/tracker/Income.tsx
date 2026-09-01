import { CalcResult, IncomeYear, blankInc, fmt, jointComparison } from '@/lib/tax';
import { Api } from './App';
import { Kick, YaTabs, pagepad, yaHead, right, heading800 } from './bits';
import { deadlineInfo, yearsOf } from './derive';

export function Income({ api, c }: { api: Api; c: CalcResult }) {
  const { d, ya, mut, go } = api;
  const years = yearsOf(d);
  const dl = deadlineInfo(d, ya, c);
  const isMarried = d.profile.marital === 'married';
  const bind = (k: keyof IncomeYear) => (e: React.ChangeEvent<HTMLInputElement>) =>
    mut((x) => {
      x.income[ya] = Object.assign(blankInc(), x.income[ya]);
      (x.income[ya] as IncomeYear)[k] = +e.target.value || 0;
    });

  const Num = ({ label, k }: { label: React.ReactNode; k: keyof IncomeYear }) => (
    <div className="field">
      <label>{label}</label>
      <input className="input mono" type="number" min={0} value={c.inc[k] || 0} onChange={bind(k)} />
    </div>
  );

  const jc = isMarried ? jointComparison(c) : null;
  const jointVerdict = jc
    ? jc.sep === jc.joint
      ? 'No difference on these numbers.'
      : jc.sep < jc.joint
        ? 'Separate assessment saves ' + fmt(jc.joint - jc.sep) + ' · Taksiran berasingan lebih jimat'
        : 'Joint assessment saves ' + fmt(jc.sep - jc.joint) + ' · Taksiran bersama lebih jimat'
    : '';

  const Row = ({ label, value, strong }: { label: React.ReactNode; value: string; strong?: boolean }) => (
    <tr>
      <td style={strong ? heading800 : undefined}>{label}</td>
      <td style={{ ...right, ...(strong ? heading800 : {}) }} className="mono">{value}</td>
    </tr>
  );

  return (
    <div className="pagepad" data-screen-label="Income" style={pagepad(1200)}>
      <div style={yaHead}>
        <h2 style={{ margin: 0 }}>Income <span className="bm" style={{ fontSize: 15 }}>· Pendapatan</span></h2>
        <YaTabs tabs={years.map((y) => ({ label: y, on: y === ya, pick: () => mut((x) => { x.ya = y; }) }))} />
      </div>

      <div className="claimsgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 0, border: '2px solid var(--color-divider)', marginTop: 18 }}>
        <div style={{ padding: 24, borderRight: '2px solid var(--color-divider)' }}>
          <Kick>Sources · Punca pendapatan — editable</Kick>
          <h6 style={{ margin: '16px 0 8px' }}>Employment · Penggajian</h6>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Num label="Salary / year · Gaji (RM)" k="salary" />
            <Num label="Bonus (RM)" k="bonus" />
            <Num label="PCB / MTD withheld (RM)" k="pcb" />
            <Num label="Zakat paid · Zakat (RM)" k="zakat" />
          </div>
          <h6 style={{ margin: '20px 0 8px' }}>Rental · Sewaan</h6>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Num label="Gross rent / year (RM)" k="rent" />
            <Num label="Allowable expenses (RM)" k="rentExp" />
            <Num label="CP500 instalments paid (RM)" k="cp500" />
          </div>
          <div style={{ fontSize: 11.5, marginTop: 8 }} className="text-muted">
            Allowable: repairs, management fees, assessment &amp; quit rent, loan interest. Net rental {fmt(c.netRent)}. CP500 = LHDN&apos;s bi-monthly instalment scheme for rental/business income; paid amounts offset the final bill.
          </div>
          <h6 style={{ margin: '20px 0 8px' }}>Business &amp; other · Perniagaan</h6>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Num label="Business income, net (RM) — makes this a Form B year" k="biz" />
            <Num label="Other — dividends, freelance (RM)" k="other" />
          </div>
          {isMarried && (
            <>
              <h6 style={{ margin: '20px 0 8px' }}>Spouse · Pasangan (for joint comparison)</h6>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Num label="Spouse income / year (RM)" k="spInc" />
                <Num label="Spouse reliefs, est. (RM)" k="spRel" />
              </div>
            </>
          )}
        </div>

        <div style={{ padding: 24, background: 'var(--color-surface)' }}>
          <Kick>Computation · Pengiraan ({ya} · {c.formType} · resident scale)</Kick>
          <table className="table" style={{ fontSize: 13, marginTop: 12 }}>
            <tbody>
              <Row label="Total income · Jumlah pendapatan" value={fmt(c.totalIncome)} />
              <Row label={<>Donations allowed <span className="text-muted">(capped 10% of aggregate)</span></>} value={'− ' + fmt(c.donAllowed)} />
              <Row label={<>Reliefs claimed · Pelepasan <button className="navlink linkbtn" onClick={() => go('claims')} style={{ fontSize: 11 }}>(detail)</button></>} value={'− ' + fmt(c.reliefsNonDon)} />
              <Row label="Chargeable income · Pendapatan bercukai" value={fmt(c.chargeable)} strong />
              <Row label={<>Tax on chargeable income <span className="text-muted">(YA2025 scale)</span></>} value={fmt(c.taxGross)} />
              <Row label={<>Individual rebate <span className="text-muted">(RM400 if chargeable ≤ RM35,000)</span></>} value={'− ' + fmt(c.rebate)} />
              <Row label="Zakat rebate · Rebat zakat" value={'− ' + fmt(c.zakatRebate)} />
              <Row label="PCB / MTD already paid" value={'− ' + fmt(c.inc.pcb || 0)} />
              <Row label="CP500 instalments paid" value={'− ' + fmt(c.inc.cp500 || 0)} />
            </tbody>
          </table>

          <div style={{ background: c.balance < 0 ? 'var(--color-neutral-900)' : 'var(--color-accent-700)', color: 'var(--color-bg)', padding: 16, marginTop: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', ...heading800 }}>
              {c.balance < 0 ? 'Estimated refund · Anggaran bayaran balik' : 'Estimated balance payable · Anggaran baki'}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div className="mono postnum" style={{ ...heading800, fontSize: 36 }}>{fmt(Math.abs(c.balance))}</div>
              <div style={{ fontSize: 12.5 }}>{c.balance < 0 ? 'credited after LHDN processes your return' : 'payable by ' + dl.dlLabel + ' · perlu dibayar'}</div>
            </div>
          </div>

          {isMarried && jc && (
            <div style={{ border: '2px solid var(--color-divider)', padding: '14px 16px', marginTop: 16, background: 'var(--color-bg)' }}>
              <Kick style={{ color: 'var(--color-neutral-700)' }}>Joint vs separate · Taksiran bersama vs berasingan</Kick>
              <table className="table" style={{ fontSize: 13, marginTop: 8 }}>
                <tbody>
                  <Row label="Separate — you + spouse each assessed" value={fmt(jc.sep)} />
                  <Row label="Joint — combined income, RM4,000 spouse relief" value={fmt(jc.joint)} />
                </tbody>
              </table>
              <div style={{ fontSize: 12.5, marginTop: 6, ...heading800 }}>{jointVerdict}</div>
              <div style={{ fontSize: 11, marginTop: 4 }} className="text-muted">Rough comparison — under joint assessment the spouse&apos;s own reliefs beyond RM4,000 are ignored here.</div>
            </div>
          )}
          <div style={{ fontSize: 11.5, marginTop: 10 }} className="text-muted">Estimate only, not tax advice — confirm in MyTax e-Filing. Anggaran sahaja.</div>
        </div>
      </div>
    </div>
  );
}
