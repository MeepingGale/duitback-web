// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PcbCalculator } from './PcbCalculator';
import { estimatePcb } from '@/lib/pcb';
import { fmt } from '@/lib/tax';

afterEach(cleanup);

describe('PcbCalculator', () => {
  it('turns a monthly salary into the LHDN monthly deduction and year total', async () => {
    render(<PcbCalculator />);
    expect(screen.getByText(/Enter a monthly salary/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Monthly salary · Gaji bulanan (RM)'), { target: { value: '5000' } });
    // RM 60k single → RM 110/month (see lib/pcb.test.ts)
    await screen.findByText('RM 110');
    const { total } = estimatePcb({ salary: 60000, bonus: 0, category: 1, children: 0 });
    expect(screen.getAllByText(fmt(total)).length).toBeGreaterThan(0); // total row (and the tax row, which it converges to)
    expect(screen.queryByText(/Bonus month/)).toBeNull(); // no bonus row without a bonus
  });

  it('shows the bonus-month row and reacts to category and children', async () => {
    render(<PcbCalculator />);
    fireEvent.change(screen.getByLabelText('Monthly salary · Gaji bulanan (RM)'), { target: { value: '8000' } });
    fireEvent.change(screen.getByLabelText('Bonus this year · Bonus (RM)'), { target: { value: '16000' } });
    await screen.findByText(/Bonus month/);
    const single = estimatePcb({ salary: 96000, bonus: 16000, category: 1, children: 0 });
    expect(screen.getByText(fmt(single.december))).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Category · Kategori'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Qualifying children · Anak layak'), { target: { value: '2' } });
    const fam = estimatePcb({ salary: 96000, bonus: 16000, category: 2, children: 2 });
    await screen.findAllByText(fmt(fam.total));
    expect(fam.total).toBeLessThan(single.total);
  });
});
