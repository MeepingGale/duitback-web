'use client';
import { useState } from 'react';
import { fmt } from '@/lib/tax';
import { PcbCategory, estimatePcb } from '@/lib/pcb';
import { MoneyInput } from '@/components/tracker/bits';

function Row({ label, value, strong }: { label: React.ReactNode; value: string; strong?: boolean }) {
  const st = strong ? { fontFamily: 'var(--font-heading)', fontWeight: 800 } : undefined;
  return (
    <tr>
      <td style={st}>{label}</td>
      <td className="mono" style={{ textAlign: 'right', whiteSpace: 'nowrap', ...st }}>{value}</td>
    </tr>
  );
}

/** Public PCB/MTD calculator — the tracker's engine on a plain form. */
export function PcbCalculator() {
  const [monthly, setMonthly] = useState('');
  const [bonus, setBonus] = useState('');
  const [category, setCategory] = useState<PcbCategory>(1);
  const [children, setChildren] = useState(0);
  const salary = (+monthly || 0) * 12;
  const bonusN = +bonus || 0;
  const est = estimatePcb({ salary, bonus: bonusN, category, children });
  const ready = salary + bonusN > 0;

  return (
    <div style={{ border: '2px solid var(--color-divider)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
      <div style={{ padding: 24 }}>
        <div className="fields2">
          <div className="field">
            <label>Monthly salary · Gaji bulanan (RM)</label>
            <MoneyInput ariaLabel="Monthly salary · Gaji bulanan (RM)" value={monthly} onChange={setMonthly} />
          </div>
          <div className="field">
            <label>Bonus this year · Bonus (RM)</label>
            <MoneyInput ariaLabel="Bonus this year · Bonus (RM)" value={bonus} onChange={setBonus} />
          </div>
          <div className="field">
            <label>Category · Kategori</label>
            <select className="input" aria-label="Category · Kategori" value={category} onChange={(e) => setCategory(+e.target.value as PcbCategory)}>
              <option value={1}>1 — Single · Bujang</option>
              <option value={2}>2 — Married, spouse not working · Pasangan tidak bekerja</option>
              <option value={3}>3 — Married, spouse working · Pasangan bekerja</option>
            </select>
          </div>
          <div className="field">
            <label>Qualifying children · Anak layak</label>
            <input className="input mono" type="number" min={0} max={12} inputMode="numeric" aria-label="Qualifying children · Anak layak" value={children} disabled={category === 1} onChange={(e) => setChildren(Math.max(0, Math.min(12, Math.floor(+e.target.value || 0))))} />
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-neutral-800)', margin: '14px 0 0' }}>
          Assumes equal monthly pay, the bonus paid in December, employee EPF at 11% (qualifying cap RM 4,000 a year), no TP1 deductions and no zakat through payroll.{' '}
          <span lang="ms">Anggaran sahaja — gaji sama setiap bulan, bonus dibayar Disember, KWSP 11%, tiada potongan TP1 atau zakat gaji.</span>
        </p>
      </div>
      <div style={{ padding: 24, background: 'var(--color-surface)' }}>
        <table className="table" style={{ fontSize: 14 }}>
          <tbody>
            <Row label="PCB per month, Jan–Nov · PCB sebulan" value={ready ? fmt(est.monthly) : '—'} strong />
            {bonusN > 0 && <Row label="Bonus month, Dec · Bulan bonus" value={ready ? fmt(est.december) : '—'} />}
            <Row label="Total for the year · Jumlah setahun" value={ready ? fmt(est.total) : '—'} strong />
            <Row label={<>Chargeable income <span style={{ color: 'var(--color-neutral-700)' }}>(P)</span> · Pendapatan bercukai</>} value={ready ? fmt(est.chargeable) : '—'} />
            <Row label={<>Tax for the year <span style={{ color: 'var(--color-neutral-700)' }}>(P − M)R + B</span> · Cukai setahun</>} value={ready ? fmt(est.taxYear) : '—'} />
          </tbody>
        </table>
        <p style={{ fontSize: 12, color: 'var(--color-neutral-800)', margin: '12px 0 0' }}>
          {ready
            ? 'Amounts are truncated to sen and rounded up to the nearest 5 sen, as the spec requires; deductions under RM 10 in a month are skipped. · Dibundarkan ke atas kepada 5 sen terdekat.'
            : 'Enter a monthly salary to see the deduction. · Masukkan gaji bulanan untuk melihat potongan.'}
        </p>
      </div>
    </div>
  );
}
