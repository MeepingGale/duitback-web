import type { Metadata } from 'next';
import './tracker.css';

export const metadata: Metadata = {
  title: { absolute: 'DuitBack — Malaysian Tax Relief Tracker' },
  description:
    'Track Malaysian income tax relief claims against the LHDN caps — receipts, refund estimate, and a MyTax filing pack. All data stays in your browser.',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
