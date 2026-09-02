import { useEffect, useMemo } from 'react';
import { CalcResult, IncomeYear, blankInc, fmt, jointComparison, to2dp } from '@/lib/tax';
import { estimatePcb } from '@/lib/pcb';
import { Api } from './App';
import { Kick, MoneyInput, YaTabs, pagepad, yaHead, right, heading800 } from './bits';
import { deadlineInfo, yearsOf } from './derive';


// Module-level so their component identity is stable across renders — defining
// these inside Income() made React remount the inputs on every keystroke,
// dropping focus after each digit.
function NumField({ label, value, onCommit }: { label: React.ReactNode; value: number; onCommit: (n: number) => void }) {
  return (
    <div className="field">
      <label>{label}</label>
      <MoneyInput ariaLabel={typeof label === 'string' ? label : undefined} value={value ? String(value) : ''} onChange={(str) => onCommit(to2dp(+str || 0))} />
    </div>
  );
}

function Row({ label, value, strong }: { label: React.ReactNode; value: string; strong?: boolean }) {
  return (
    <tr>
      <td style={strong ? heading800 : undefined}>{label}</td>
      <td style={{ ...right, ...(strong ? heading800 : {}) }} className="mono">{value}</td>
    </tr>
  );
}

export function Income({ api, c }: { api: Api; c: CalcResult }) {
  const { d, ya, mut, go } = api;
  const years = yearsOf(d);
  const dl = deadlineInfo(d, ya, c);
  const isMarried = d.profile.marital === 'married';
  const bind = (k: Exclude<keyof IncomeYear, 'pcbAuto' | 'compIllHealth'>) => (n: number) =>
    mut((x) => {
      x.income[ya] = Object.assign(blankInc(), x.income[ya]);
      (x.income[ya] as IncomeYear)[k] = n;
    });

  // Auto-estimate PCB from salary + bonus with the LHDN computerised MTD
  // formula. It stays live (recomputing as inputs change) until the user
  // types their own figure into the PCB field, which always wins.
  const spouseWorks = d.profile.spouseWorking === undefined ? (c.inc.spInc || 0) > 0 : d.profile.spouseWorking;
  const pcbCategory = !isMarried ? 1 : spouseWorks ? 3 : 2;
  const kids = d.profile.children;
  const pcbChildren = kids ? Object.values(kids).reduce((a, b) => a + (b || 0), 0) : c.claims.filter((x) => x.cat === 'child').length;
  const employment = (c.inc.salary || 0) + (c.inc.bonus || 0);
  const est = useMemo(
    () => estimatePcb({ salary: c.inc.salary || 0, bonus: c.inc.bonus || 0, category: pcbCategory, children: pcbChildren }),
    [c.inc.salary, c.inc.bonus, pcbCategory, pcbChildren],
  );
  const pcbIsAuto = c.inc.pcbAuto === true || (c.inc.pcbAuto === undefined && !(c.inc.pcb || 0) && employment > 0);
  useEffect(() => {
    if (!pcbIsAuto) return;
    if ((c.inc.pcb || 0) === est.total && c.inc.pcbAuto === true) return;
    mut((x) => {
      const y = (x.income[ya] = Object.assign(blankInc(), x.income[ya]));
      y.pcb = est.total;
      y.pcbAuto = true;
    });
  }, [pcbIsAuto, est.total, ya, c.inc.pcb, c.inc.pcbAuto, mut]);
  const commitPcbManual = (n: number) =>
    mut((x) => {
      const y = (x.income[ya] = Object.assign(blankInc(), x.income[ya]));
      y.pcb = n;
      y.pcbAuto = false;
    });
  const catLabel = pcbCategory === 1 ? 'single · bujang' : pcbCategory === 2 ? 'married, spouse not working' : 'married, spouse working';
  const pcbNote = pcbIsAuto
    ? 'Auto-estimated ' + fmt(est.total) + ' for the year — ' +
      ((c.inc.bonus || 0) > 0 ? '≈ ' + fmt(est.monthly) + '/month + ' + fmt(est.december) + ' in the bonus month (Dec). ' : '≈ ' + fmt(est.monthly) + '/month. ') +
      'LHDN computerised MTD formula, assuming equal monthly pay, bonus paid in December, EPF 11% (max RM 4,000), category ' + pcbCategory + ' (' + catLabel + ')' +
      (pcbChildren && pcbCategory !== 1 ? ', ' + pcbChildren + ' children' : '') +
      ', no TP1 deductions or payroll zakat. Type the exact figure from your EA form to override. ' +
      '· Anggaran formula PCB berkomputer LHDN — taip angka sebenar borang EA anda untuk menggantikan.'
    : 'Using your entered PCB figure. · Menggunakan angka PCB anda.';

  const jc = isMarried ? jointComparison(c) : null;
  const jointVerdict = jc
    ? jc.sep === jc.joint
      ? 'No difference on these numbers.'
      : jc.sep < jc.joint
        ? 'Separate assessment saves ' + fmt(jc.joint - jc.sep) + ' · Taksiran berasingan lebih jimat'
        : 'Joint assessment saves ' + fmt(jc.sep - jc.joint) + ' · Taksiran bersama lebih jimat'
    : '';

  return (
    <div className="pagepad" data-screen-label="Income" style={pagepad(1200)}>
      <div style={yaHead}>
        <h2 style={{ margin: 0 }}>Income <span className="bm" style={{ fontSize: 15 }}>· Pendapatan</span></h2>
        <YaTabs tabs={years.map((y) => ({ label: y, on: y === ya, pick: () => mut((x) => { x.ya = y; }) }))} />
      </div>

      <div className="claimsgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 0, border: '2px solid var(--color-divider)', marginTop: 18 }}>
        <div data-tour="income-sources" style={{ padding: 24, borderRight: '2px solid var(--color-divider)' }}>
          <Kick>Sources · Punca pendapatan — editable</Kick>
          <h3 className="sec" style={{ margin: '16px 0 8px' }}>Employment · Penggajian</h3>
          <div className="fields2">
            <NumField label="Salary / year · Gaji (RM)" value={c.inc.salary || 0} onCommit={bind('salary')} />
            <NumField label="Bonus (RM)" value={c.inc.bonus || 0} onCommit={bind('bonus')} />
            <NumField label="PCB / MTD withheld (RM)" value={c.inc.pcb || 0} onCommit={commitPcbManual} />
            <NumField label="Zakat paid · Zakat (RM)" value={c.inc.zakat || 0} onCommit={bind('zakat')} />
          </div>
          <h3 className="sec" style={{ margin: '20px 0 8px' }}>Loss of employment · Pampasan kehilangan pekerjaan</h3>
          <div className="fields2">
            <NumField label="Compensation received (RM)" value={c.inc.compensation || 0} onCommit={bind('compensation')} />
            <NumField label="Completed years with that employer" value={c.inc.serviceYears || 0} onCommit={bind('serviceYears')} />
          </div>
          <label className="radio" style={{ marginTop: 8 }}>
            <input type="checkbox" checked={!!c.inc.compIllHealth} onChange={(e) => mut((x) => { x.income[ya] = Object.assign(blankInc(), x.income[ya]); (x.income[ya] as IncomeYear).compIllHealth = e.target.checked; })} />
            <span className="dot" style={{ borderRadius: 0 }} />
            Employment lost due to ill health · Sebab kesihatan (fully exempt)
          </label>
          <div style={{ fontSize: 11.5, marginTop: 8 }} className="text-muted">
            RM 10,000 is exempt for each completed year of service with the same employer or group; the rest is employment income (Income Tax Act Sch. 6 para 15, Public Ruling 1/2012).{(c.inc.compensation || 0) > 0 ? ' Exempt ' + fmt(c.compExempt) + ' · taxable ' + fmt(c.compTaxable) + '.' : ''}{' '}
            <span lang="ms">RM 10,000 dikecualikan bagi setiap tahun genap perkhidmatan.</span>
          </div>
          {employment > 0 && (
            <div style={{ fontSize: 11.5, marginTop: 8 }}>
              <div className="text-muted">{pcbNote} <a href="../pcb/">How PCB is calculated · Cara kiraan →</a></div>
              {!pcbIsAuto && (
                <button className="navlink linkbtn" style={{ fontSize: 11.5, marginTop: 4 }} onClick={() => mut((x) => {
                  const y = (x.income[ya] = Object.assign(blankInc(), x.income[ya]));
                  y.pcb = est.total;
                  y.pcbAuto = true;
                })}>
                  Use the formula estimate instead ({fmt(est.total)}) · Guna anggaran →
                </button>
              )}
            </div>
          )}
          <h3 className="sec" style={{ margin: '20px 0 8px' }}>Rental · Sewaan</h3>
          <div className="fields2">
            <NumField label="Gross rent / year (RM)" value={c.inc.rent || 0} onCommit={bind('rent')} />
            <NumField label="Allowable expenses (RM)" value={c.inc.rentExp || 0} onCommit={bind('rentExp')} />
            <NumField label="CP500 instalments paid (RM)" value={c.inc.cp500 || 0} onCommit={bind('cp500')} />
          </div>
          <div style={{ fontSize: 11.5, marginTop: 8 }} className="text-muted">
            Allowable: repairs, management fees, assessment &amp; quit rent, loan interest. Net rental {fmt(c.netRent)}. CP500 = LHDN&apos;s bi-monthly instalment scheme for rental/business income; paid amounts offset the final bill.
          </div>
          <h3 className="sec" style={{ margin: '20px 0 8px' }}>Business &amp; other · Perniagaan</h3>
          <div className="fields2">
            <NumField label="Business income, net (RM)" value={c.inc.biz || 0} onCommit={bind('biz')} />
            <NumField label="Other — freelance, commissions (RM)" value={c.inc.other || 0} onCommit={bind('other')} />
            <NumField label="Dividends — Malaysian companies (RM)" value={c.inc.dividends || 0} onCommit={bind('dividends')} />
            <NumField label="Departure levy paid — umrah / religious travel (RM)" value={c.inc.levyRebate || 0} onCommit={bind('levyRebate')} />
          </div>
          <div style={{ fontSize: 11.5, marginTop: 8 }} className="text-muted">
            Any business income switches the year to Form B (deadline 30 Jun). <span lang="ms">Pendapatan perniagaan menukar borang kepada B.</span>{' '}
            Dividends: from YA2025 the share of chargeable income that comes from dividends is taxed at 2% above RM 100,000 instead of the scale (Dividend Rules 2025) — leave out EPF, ASNB, unit-trust, cooperative and foreign dividends, which are exempt.{' '}
            The departure levy on umrah or religious travel is a rebate, up to two trips a year.{' '}
            <span lang="ms">Dividen: 2% ke atas bahagian melebihi RM 100,000 mulai TT2025. Levi pelepasan umrah — rebat, maksimum dua kali setahun.</span>
          </div>
          {isMarried && (
            <>
              <h3 className="sec" style={{ margin: '20px 0 8px' }}>Spouse · Pasangan (for joint comparison)</h3>
              {(c.inc.spInc || 0) > 0 && d.profile.spouseWorking === false && (
                <div style={{ fontSize: 12, margin: '0 0 8px', color: 'var(--color-accent-700)' }}>
                  Spouse income is entered here, so the RM 4,000 spouse relief is not counted this year — it needs a spouse with no income. If that&apos;s wrong, clear the spouse income; if it&apos;s right, set &quot;spouse has income&quot; in Settings.{' '}
                  <span lang="ms">Pelepasan pasangan RM 4,000 tidak dikira kerana pasangan ada pendapatan.</span>
                </div>
              )}
              <div className="fields2">
                <NumField label="Spouse income / year (RM)" value={c.inc.spInc || 0} onCommit={bind('spInc')} />
                <NumField label="Spouse reliefs, est. (RM)" value={c.inc.spRel || 0} onCommit={bind('spRel')} />
              </div>
            </>
          )}
        </div>

        <div style={{ padding: 24, background: 'var(--color-surface)' }}>
          <Kick>Computation · Pengiraan ({ya} · {c.formType} · resident scale)</Kick>
          <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ fontSize: 13, marginTop: 12 }}>
            <tbody>
              <Row label="Total income · Jumlah pendapatan" value={fmt(c.totalIncome)} />
              {c.compTaxable > 0 && <Row label={<>incl. taxable compensation <span className="text-muted">(after {fmt(c.compExempt)} exempt)</span></>} value={fmt(c.compTaxable)} />}
              {c.dividends > 0 && <Row label={<>incl. dividends <span className="text-muted">(2% above RM 100,000 of their chargeable share)</span></>} value={fmt(c.dividends)} />}
              <Row label={<>Donations allowed <span className="text-muted">(capped 10% of aggregate)</span></>} value={'− ' + fmt(c.donAllowed)} />
              <Row label={<>Reliefs claimed · Pelepasan <button className="navlink linkbtn" onClick={() => go('claims')} style={{ fontSize: 11 }}>(detail)</button></>} value={'− ' + fmt(c.reliefsNonDon)} />
              <Row label="Chargeable income · Pendapatan bercukai" value={fmt(c.chargeable)} strong />
              <Row label={<>Tax on chargeable income <span className="text-muted">(YA2025 scale · unchanged for YA2026{c.dividendTax > 0 ? ' · incl. dividend tax ' + fmt(c.dividendTax) : ''})</span></>} value={fmt(c.taxGross)} />
              <Row label={<>Individual rebate <span className="text-muted">(RM400 if chargeable ≤ RM35,000)</span></>} value={'− ' + fmt(c.rebate)} />
              {c.levyRebate > 0 && <Row label="Departure levy rebate · Rebat levi pelepasan" value={'− ' + fmt(c.levyRebate)} />}
              <Row label="Zakat rebate · Rebat zakat" value={'− ' + fmt(c.zakatRebate)} />
              <Row label="PCB / MTD already paid" value={'− ' + fmt(c.inc.pcb || 0)} />
              <Row label="CP500 instalments paid" value={'− ' + fmt(c.inc.cp500 || 0)} />
            </tbody>
          </table>
          </div>

          <div style={{ background: c.balance < 0 ? 'var(--color-ok)' : 'var(--color-accent-700)', color: 'var(--color-bg)', padding: 16, marginTop: 16 }}>
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
              <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ fontSize: 13, marginTop: 8 }}>
                <tbody>
                  <Row label="Separate — you + spouse each assessed" value={fmt(jc.sep)} />
                  <Row label="Joint — combined income, RM4,000 spouse relief" value={fmt(jc.joint)} />
                </tbody>
              </table>
          </div>
              <div style={{ fontSize: 12.5, marginTop: 6, ...heading800 }}>{jointVerdict}</div>
              <div style={{ fontSize: 11, marginTop: 4 }} className="text-muted">Rough comparison — under joint assessment the spouse&apos;s own reliefs beyond RM4,000 are ignored here. <span lang="ms">Perbandingan kasar sahaja — pelepasan pasangan selain RM4,000 tidak diambil kira.</span></div>
            </div>
          )}
          <div style={{ fontSize: 11.5, marginTop: 10 }} className="text-muted">Estimate only, not tax advice — confirm in MyTax e-Filing. Anggaran sahaja.</div>
        </div>
      </div>
    </div>
  );
}
