// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import TrackerApp from './App';
import { KEY } from '@/lib/data';

// jsdom gaps the app touches
beforeEach(() => {
  cleanup();
  localStorage.clear();
  Element.prototype.scrollIntoView = vi.fn();
});

async function completeSetup(name = 'Testy') {
  render(<TrackerApp />);
  await screen.findByText('Set up your tracker');
  fireEvent.change(screen.getByPlaceholderText('e.g. Amirah'), { target: { value: name } });
  fireEvent.click(screen.getByText('Start tracking · Mula menjejak'));
  await screen.findByText('Hello, ' + name);
}

describe('TrackerApp smoke', () => {
  it('first run shows setup; completing it lands on the dashboard with the tour', async () => {
    await completeSetup('Nicholas');
    // profile persisted under the same key as every earlier build
    expect(JSON.parse(localStorage.getItem(KEY)!).profile.name).toBe('Nicholas');
    // guided tour starts on step 1
    await screen.findByText(/Quick tour · Jom tengok · 1 of/);
    fireEvent.click(screen.getByText('Skip tour'));
    await waitFor(() => expect(screen.queryByText(/Quick tour/)).toBeNull());
  });

  it('adding a claim through the dialog updates the poster total', async () => {
    await completeSetup();
    fireEvent.click(screen.getByText('Skip tour'));
    fireEvent.click(screen.getByText('+ New claim'));
    const dialog = await screen.findByText('New claim · Tuntutan baharu');
    expect(dialog).toBeTruthy();
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '688' } });
    fireEvent.click(screen.getByText('Save claim · Simpan'));
    const totals = await screen.findAllByText('RM 688');
    expect(totals.length).toBeGreaterThan(0);
    const stored = JSON.parse(localStorage.getItem(KEY)!);
    expect(stored.claims).toHaveLength(1);
    expect(stored.claims[0].amount).toBe(688);
  });

  it('over-cap amounts warn bilingually in the dialog', async () => {
    await completeSetup();
    fireEvent.click(screen.getByText('Skip tour'));
    fireEvent.click(screen.getByText('+ New claim'));
    await screen.findByText('New claim · Tuntutan baharu');
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3000' } });
    await screen.findByText(/over the RM 2,500 cap/);
    await screen.findByText(/Melebihi had RM 2,500/);
  });

  it('demo mode wears the banner and exits back to setup', async () => {
    render(<TrackerApp />);
    await screen.findByText('Set up your tracker');
    fireEvent.click(screen.getByText('Just exploring? Load the demo →'));
    await screen.findByText('Hello, Amirah');
    await screen.findByText('Demo mode · Mod demo');
    fireEvent.click(screen.getByText('Exit demo & set up →'));
    await screen.findByText('Set up your tracker');
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('returning visitors skip setup and keep their data', async () => {
    await completeSetup('Aisyah');
    cleanup();
    render(<TrackerApp />);
    await screen.findByText('Hello, Aisyah');
    expect(screen.queryByText('Set up your tracker')).toBeNull();
  });
});
