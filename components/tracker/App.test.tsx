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
    fireEvent.change(screen.getByLabelText('Amount · Jumlah (RM)'), { target: { value: '688' } });
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
    fireEvent.change(screen.getByLabelText('Amount · Jumlah (RM)'), { target: { value: '3000' } });
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

  it('the TIN input physically rejects malformed entry', async () => {
    render(<TrackerApp />);
    await screen.findByText('Set up your tracker');
    fireEvent.change(screen.getByPlaceholderText('e.g. Amirah'), { target: { value: 'Testy' } });
    // junk typed into the digits box — letters stripped, canonical prefix kept
    fireEvent.change(screen.getByLabelText('TIN digits'), { target: { value: '8454abc62070' } });
    await screen.findByText(/Valid format/);
    fireEvent.click(screen.getByText('Start tracking · Mula menjejak'));
    await screen.findByText('Hello, Testy');
    expect(JSON.parse(localStorage.getItem(KEY)!).profile.taxNo).toBe('IG845462070');
  });

  it('setting a passcode requires a matching confirmation', async () => {
    await completeSetup();
    fireEvent.click(screen.getByText('Skip tour'));
    fireEvent.click(screen.getByText('Settings'));
    await screen.findByText('Set passcode · Tetapkan');
    const inputs = document.querySelectorAll('input[type="password"]');
    fireEvent.change(inputs[0], { target: { value: '1234' } });
    fireEvent.change(inputs[1], { target: { value: '9999' } });
    fireEvent.click(screen.getByText('Set passcode · Tetapkan'));
    await screen.findByText(/don’t match/);
    expect(JSON.parse(localStorage.getItem(KEY)!).profile.pin).toBeUndefined();
    fireEvent.change(inputs[1], { target: { value: '1234' } });
    fireEvent.click(screen.getByText('Set passcode · Tetapkan'));
    await screen.findByText(/Passcode set/);
    expect(JSON.parse(localStorage.getItem(KEY)!).profile.pin).toBe('1234');
  });

  it('the lock screen offers a checkbox-gated erase for forgotten passcodes', async () => {
    await completeSetup();
    fireEvent.click(screen.getByText('Skip tour'));
    fireEvent.click(screen.getByText('Settings'));
    const inputs = document.querySelectorAll('input[type="password"]');
    fireEvent.change(inputs[0], { target: { value: '1234' } });
    fireEvent.change(inputs[1], { target: { value: '1234' } });
    fireEvent.click(screen.getByText('Set passcode · Tetapkan'));
    await screen.findByText(/Passcode set/);
    fireEvent.click(screen.getByText('Lock now · Kunci sekarang'));
    await screen.findByText('Unlock · Buka');
    fireEvent.click(screen.getByText(/Forgot passcode\?/));
    const erase = await screen.findByText('Erase everything & start over · Padam semua');
    expect((erase as HTMLButtonElement).disabled).toBe(true); // gated until acknowledged
    fireEvent.click(screen.getByRole('checkbox'));
    expect((erase as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(erase);
    await screen.findByText('Set up your tracker');
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('income inputs keep focus while typing — no remount per keystroke', async () => {
    await completeSetup();
    fireEvent.click(screen.getByText('Skip tour'));
    fireEvent.click(screen.getByText('Income'));
    await screen.findByText(/Computation · Pengiraan/);
    const salary = () => document.querySelectorAll('input[inputmode="decimal"]')[0] as HTMLInputElement;
    salary().focus();
    fireEvent.change(salary(), { target: { value: '2' } });
    fireEvent.change(salary(), { target: { value: '21' } });
    fireEvent.change(salary(), { target: { value: '210' } });
    expect(document.activeElement).toBe(salary());
    expect(JSON.parse(localStorage.getItem(KEY)!).income.YA2026.salary).toBe(210);
  });

  it('decimals can be typed keystroke by keystroke — the dot survives', async () => {
    await completeSetup();
    fireEvent.click(screen.getByText('Skip tour'));
    fireEvent.click(screen.getByText('Income'));
    await screen.findByText(/Computation · Pengiraan/);
    const salary = () => document.querySelectorAll('input[inputmode="decimal"]')[0] as HTMLInputElement;
    salary().focus();
    fireEvent.change(salary(), { target: { value: '5' } });
    fireEvent.change(salary(), { target: { value: '5.' } });
    expect(salary().value).toBe('5.'); // the dot must not be eaten mid-entry
    fireEvent.change(salary(), { target: { value: '5.5' } });
    expect(salary().value).toBe('5.5');
    expect(JSON.parse(localStorage.getItem(KEY)!).income.YA2026.salary).toBe(5.5);
    fireEvent.blur(salary());
    expect(salary().value).toBe('5.50'); // grouped/2dp display on blur
  });

  it('filing pack truncates amounts-to-enter to whole RM per LHDN, keeps sen in evidence', async () => {
    await completeSetup();
    fireEvent.click(screen.getByText('Skip tour'));
    fireEvent.click(screen.getByText('+ New claim'));
    await screen.findByText('New claim · Tuntutan baharu');
    fireEvent.change(screen.getByLabelText('Amount · Jumlah (RM)'), { target: { value: '89.90' } });
    fireEvent.click(screen.getByText('Save claim · Simpan'));
    await screen.findAllByText('RM 89.90');
    fireEvent.click(screen.getByText('Filing pack'));
    await screen.findByText(/form cheat-sheet/);
    // amount to enter: truncated; receipts total: sen kept — both visible
    expect(screen.getAllByText('RM 89').length).toBeGreaterThan(0);
    expect(screen.getAllByText('RM 89.90').length).toBeGreaterThan(0);
  });

  it('medical sub-limit overflow warns; empty amount disables Save', async () => {
    await completeSetup();
    fireEvent.click(screen.getByText('Skip tour'));
    fireEvent.click(screen.getByText('+ New claim'));
    await screen.findByText('New claim · Tuntutan baharu');
    const save = screen.getByText('Save claim · Simpan') as HTMLButtonElement;
    expect(save.disabled).toBe(true); // no amount yet
    const selects = document.querySelectorAll('select');
    fireEvent.change(selects[0], { target: { value: 'medical' } });
    fireEvent.change(document.querySelectorAll('select')[1], { target: { value: 'checkup' } });
    fireEvent.change(screen.getByLabelText('Amount · Jumlah (RM)'), { target: { value: '2000' } });
    await screen.findByText(/Over the RM 1,000 sub-limit/);
    await screen.findByText(/Melebihi had kecil RM 1,000/);
    expect((screen.getByText('Save claim · Simpan') as HTMLButtonElement).disabled).toBe(false);
  });

  it('donation with no income explains the 10% rule instead of "not available"', async () => {
    await completeSetup();
    fireEvent.click(screen.getByText('Skip tour'));
    fireEvent.click(screen.getByText('+ New claim'));
    await screen.findByText('New claim · Tuntutan baharu');
    fireEvent.change(document.querySelectorAll('select')[0], { target: { value: 'donation' } });
    await screen.findByText(/enter your income first/);
    expect(screen.queryByText(/not available for YA/)).toBeNull();
  });

  it('bank picker composes and enforces digits with the IBG length hint', async () => {
    await completeSetup();
    fireEvent.click(screen.getByText('Skip tour'));
    fireEvent.click(screen.getByText('Settings'));
    await screen.findByText('Set passcode · Tetapkan');
    fireEvent.change(screen.getByLabelText('Bank'), { target: { value: 'Maybank' } });
    fireEvent.change(screen.getByLabelText('Account number digits'), { target: { value: '1234-5678 9012abc' } });
    await screen.findByText(/Maybank account numbers are 12 digits/);
    expect(JSON.parse(localStorage.getItem(KEY)!).profile.bank).toBe('Maybank 123456789012');
  });

  it('claims can be edited in place, and deletes ask for confirmation', async () => {
    await completeSetup();
    fireEvent.click(screen.getByText('Skip tour'));
    fireEvent.click(screen.getByText('+ New claim'));
    await screen.findByText('New claim · Tuntutan baharu');
    fireEvent.change(screen.getByLabelText('Amount · Jumlah (RM)'), { target: { value: '688' } });
    fireEvent.click(screen.getByText('Save claim · Simpan'));
    await screen.findAllByText('RM 688');
    // open the claim for editing from the Claims panel
    fireEvent.click(screen.getByText('Claims · Tuntutan'));
    fireEvent.click(await screen.findByText('Edit · Sunting'));
    await screen.findByText('Edit claim · Sunting tuntutan');
    fireEvent.change(screen.getByLabelText('Amount · Jumlah (RM)'), { target: { value: '750.50' } });
    fireEvent.change(screen.getByPlaceholderText(/broadband/), { target: { value: 'Unifi fixed' } });
    fireEvent.click(screen.getByText('Save claim · Simpan'));
    await screen.findAllByText('RM 750.50');
    const stored = JSON.parse(localStorage.getItem(KEY)!);
    expect(stored.claims).toHaveLength(1); // edited, not duplicated
    expect(stored.claims[0].amount).toBe(750.5);
    expect(stored.claims[0].desc).toBe('Unifi fixed');
    // delete opens the styled confirm modal; cancelling keeps the claim
    fireEvent.click(screen.getByText('Delete'));
    await screen.findByText('Delete this claim? · Padam tuntutan ini?');
    fireEvent.click(screen.getByText('Cancel · Batal'));
    expect(JSON.parse(localStorage.getItem(KEY)!).claims).toHaveLength(1);
    fireEvent.click(screen.getByText('Delete'));
    await screen.findByText('Delete this claim? · Padam tuntutan ini?');
    fireEvent.click(screen.getByText('Delete · Padam'));
    await waitFor(() => expect(JSON.parse(localStorage.getItem(KEY)!).claims).toHaveLength(0));
  });

  it('editing a receipt-linked claim previews the image, with a carousel for multiple matches', async () => {
    await completeSetup();
    cleanup();
    const d = JSON.parse(localStorage.getItem(KEY)!);
    d.claims.unshift({ id: 'c1', ya: d.ya, cat: 'lifestyle', date: '2026-09-01', desc: 'iPhone 16', amount: 3500, receipt: 'r.png' });
    d.receipts.unshift(
      { id: 'ra', ya: d.ya, cat: 'lifestyle', name: 'r.png', sub: 'a', thumb: 'data:image/png;base64,AAA', hasFull: false },
      { id: 'rb', ya: d.ya, cat: 'lifestyle', name: 'r.png', sub: 'b', thumb: 'data:image/png;base64,BBB', hasFull: false },
    );
    localStorage.setItem(KEY, JSON.stringify(d));
    render(<TrackerApp />);
    fireEvent.click(await screen.findByText('Claims · Tuntutan'));
    fireEvent.click(await screen.findByText('Edit · Sunting'));
    await screen.findByText('Edit claim · Sunting tuntutan');
    expect((screen.getByAltText('r.png') as HTMLImageElement).src).toContain('AAA');
    await screen.findByText('1 / 2');
    fireEvent.click(screen.getByLabelText('Next receipt · Seterusnya'));
    await screen.findByText('2 / 2');
    expect((screen.getByAltText('r.png') as HTMLImageElement).src).toContain('BBB');
  });

  it('PCB auto-estimates from salary + bonus, and a typed figure overrides it', async () => {
    await completeSetup();
    cleanup();
    const d = JSON.parse(localStorage.getItem(KEY)!);
    d.income[d.ya] = { salary: 100000, bonus: 50000 };
    localStorage.setItem(KEY, JSON.stringify(d));
    render(<TrackerApp />);
    fireEvent.click(await screen.findByText('Income'));
    await screen.findByText(/Auto-estimated/);
    const { estimatePcb } = await import('@/lib/pcb');
    const expected = estimatePcb({ salary: 100000, bonus: 50000, category: 1, children: 0 }).total;
    await waitFor(() => expect(JSON.parse(localStorage.getItem(KEY)!).income[d.ya].pcb).toBe(expected));
    expect(Math.abs(expected - 18650)).toBeLessThan(3); // tax on RM137k chargeable
    // typing the EA figure overrides the estimate and sticks
    fireEvent.change(screen.getByLabelText('PCB / MTD withheld (RM)'), { target: { value: '12000' } });
    await screen.findByText(/Using your entered PCB/);
    const st = JSON.parse(localStorage.getItem(KEY)!).income[d.ya];
    expect(st.pcb).toBe(12000);
    expect(st.pcbAuto).toBe(false);
    // and the link flips back to the live estimate
    fireEvent.click(screen.getByText(/Use the formula estimate instead/));
    await waitFor(() => expect(JSON.parse(localStorage.getItem(KEY)!).income[d.ya].pcb).toBe(expected));
  });

  it('clear everything asks for confirmation before wiping', async () => {
    await completeSetup();
    fireEvent.click(screen.getByText('Skip tour'));
    fireEvent.click(screen.getByText('Settings'));
    fireEvent.click(await screen.findByText('Clear everything · Padam semua'));
    await screen.findByText(/Clear everything\? All years/);
    fireEvent.click(screen.getByText('Cancel · Batal'));
    expect(localStorage.getItem(KEY)).not.toBeNull();
    fireEvent.click(screen.getByText('Clear everything · Padam semua'));
    await screen.findByText(/Clear everything\? All years/);
    fireEvent.click(screen.getByText('Delete · Padam'));
    await screen.findByText('Set up your tracker');
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('loading the demo stashes real data, and exiting the demo restores it', async () => {
    await completeSetup('Zul');
    fireEvent.click(screen.getByText('Skip tour'));
    fireEvent.click(screen.getByText('Settings'));
    fireEvent.click(await screen.findByText('Load demo data · Muat demo'));
    await screen.findByText('Demo mode · Mod demo');
    expect(localStorage.getItem('cukaiku_v3_stash')).not.toBeNull();
    fireEvent.click(screen.getByText('Exit demo — back to your data →'));
    await screen.findByText('Hello, Zul');
    expect(JSON.parse(localStorage.getItem(KEY)!).profile.name).toBe('Zul');
    expect(localStorage.getItem('cukaiku_v3_stash')).toBeNull();
  });

  it('dialogs take focus, close on Escape, and a nested confirm closes on its own', async () => {
    await completeSetup();
    fireEvent.click(screen.getByText('Skip tour'));
    fireEvent.click(screen.getByText('+ New claim'));
    const title = await screen.findByText('New claim · Tuntutan baharu');
    const dialog = title.closest('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.contains(document.activeElement)).toBe(true);
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByText('New claim · Tuntutan baharu')).toBeNull());
    // nested: edit dialog → Delete → confirm; Escape closes only the confirm
    fireEvent.click(screen.getByText('+ New claim'));
    await screen.findByText('New claim · Tuntutan baharu');
    fireEvent.change(screen.getByLabelText('Amount · Jumlah (RM)'), { target: { value: '100' } });
    fireEvent.click(screen.getByText('Save claim · Simpan'));
    await screen.findAllByText('RM 100');
    fireEvent.click(screen.getByText('Claims · Tuntutan'));
    fireEvent.click(await screen.findByText('Edit · Sunting'));
    await screen.findByText('Edit claim · Sunting tuntutan');
    fireEvent.click(screen.getByText('Delete · Padam'));
    await screen.findByText('Delete this claim? · Padam tuntutan ini?');
    expect(document.activeElement?.textContent).toBe('Cancel · Batal'); // safe default focus
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByText('Delete this claim? · Padam tuntutan ini?')).toBeNull());
    expect(screen.getByText('Edit claim · Sunting tuntutan')).toBeTruthy();
  });

  it('Settings offers install guidance and a vault export; iPhone Safari users get a dismissible nudge', async () => {
    const ua = Object.getOwnPropertyDescriptor(window.navigator, 'userAgent');
    Object.defineProperty(window.navigator, 'userAgent', { value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1', configurable: true });
    try {
      await completeSetup();
      fireEvent.click(screen.getByText('Skip tour'));
      // dashboard nudge for iPhone Safari (not installed)
      await screen.findByText(/Safari can clear this app/);
      fireEvent.click(screen.getByText('Got it · Faham'));
      expect(screen.queryByText(/Safari can clear this app/)).toBeNull();
      expect(localStorage.getItem('duitback_install_hint')).toBe('1');
      fireEvent.click(screen.getByText('Settings'));
      await screen.findByText('Install · Pasang');
      await screen.findByText(/Add to Home Screen/);
      expect(screen.getByText('Export vault (ZIP) · Eksport peti')).toBeTruthy();
    } finally {
      if (ua) Object.defineProperty(window.navigator, 'userAgent', ua);
    }
  });

  it('deep links: ?demo=1 loads the demo and #pack opens the filing pack', async () => {
    history.replaceState({}, '', '/?demo=1#pack');
    try {
      render(<TrackerApp />);
      await screen.findByText(/form cheat-sheet/);
      expect(JSON.parse(localStorage.getItem(KEY)!).demo).toBe(true);
      // the printed document's letterhead fields are in the DOM (shown by print CSS)
      expect(screen.getByText('Taxpayer · Pembayar cukai')).toBeTruthy();
      expect(screen.getByText('Total reliefs allowed · Jumlah pelepasan')).toBeTruthy();
    } finally {
      history.replaceState({}, '', '/');
    }
  });

  it('Enter submits: setup form starts tracking, claim dialog saves only with a valid amount', async () => {
    render(<TrackerApp />);
    await screen.findByText('Set up your tracker');
    const name = screen.getByPlaceholderText('e.g. Amirah');
    fireEvent.change(name, { target: { value: 'Keyboard Kim' } });
    fireEvent.keyDown(name, { key: 'Enter' });
    await screen.findByText('Hello, Keyboard Kim');
    fireEvent.click(screen.getByText('Skip tour'));
    fireEvent.click(screen.getByText('+ New claim'));
    await screen.findByText('New claim · Tuntutan baharu');
    const amount = screen.getByLabelText('Amount · Jumlah (RM)');
    fireEvent.keyDown(amount, { key: 'Enter' }); // empty amount — must not close or save
    expect(screen.getByText('New claim · Tuntutan baharu')).toBeTruthy();
    fireEvent.change(amount, { target: { value: '250' } });
    fireEvent.keyDown(amount, { key: 'Enter' });
    await waitFor(() => expect(screen.queryByText('New claim · Tuntutan baharu')).toBeNull());
    expect(JSON.parse(localStorage.getItem(KEY)!).claims[0].amount).toBe(250);
  });

  it('Family & status in Settings counts fixed reliefs without claim lines', async () => {
    await completeSetup();
    fireEvent.click(screen.getByText('Skip tour'));
    fireEvent.click(screen.getByText('Settings'));
    await screen.findByText(/Family & status/);
    fireEvent.click(screen.getAllByText('Yes · Ya')[0]); // disabled individual
    fireEvent.change(screen.getByLabelText('Under 18 — RM2,000 each'), { target: { value: '2' } });
    const p = JSON.parse(localStorage.getItem(KEY)!).profile;
    expect(p.disabled).toBe(true);
    expect(p.children.u18).toBe(2);
    await screen.findByText(/Counted for YA2026: RM 11,000/);
    fireEvent.click(screen.getByText('Claims · Tuntutan'));
    await screen.findAllByText('profile'); // rows counted from the profile, not lines
  });

  it('the tour speaks to the person: name, year, household, and walks the new screens', async () => {
    render(<TrackerApp />);
    await screen.findByText('Set up your tracker');
    fireEvent.change(screen.getByPlaceholderText('e.g. Amirah'), { target: { value: 'Farah' } });
    fireEvent.click(screen.getByText('Married · Berkahwin'));
    fireEvent.click(screen.getByText('Start tracking · Mula menjejak'));
    await screen.findByText(/Hello, Farah — let's set up YA2026/);
    await screen.findByText(/Nothing logged for YA2026 yet/);
    fireEvent.click(screen.getByText('Next →'));
    await screen.findByText(/Farah, you get RM 9,000 individual relief/);
    fireEvent.click(screen.getByText('Next →'));
    await screen.findByText('Who you are counts · Siapa anda dikira');
    await screen.findByText(/You're married — tell DuitBack here/);
    fireEvent.click(screen.getByText('Next →'));
    await screen.findByText(/seven years back, Farah/);
    fireEvent.click(screen.getByText('Next →'));
    await screen.findByText(/joint-versus-separate assessment comparison/);
    fireEvent.click(screen.getByText('Next →'));
    await screen.findByText(/opens on 1 March 2027/);
    fireEvent.click(screen.getByText('Next →'));
    await screen.findByText("That's the whole loop, Farah");
    await screen.findByText(/That is where you go next/); // household not set yet → tour hands over to Settings
    fireEvent.click(screen.getByText('Set up my details →'));
    await waitFor(() => expect(screen.queryByText(/Quick tour/)).toBeNull());
    await screen.findByText(/Family & status/);
    expect(screen.getByText(/Are you a registered disabled person/)).toBeTruthy();
  });

  it('skipping the tour keeps the dashboard, with a dismissible nudge to set up the household', async () => {
    await completeSetup();
    fireEvent.click(screen.getByText('Skip tour'));
    await screen.findByText(/Tell DuitBack who you are/);
    fireEvent.click(screen.getByText('Not now · Nanti'));
    expect(screen.queryByText(/Tell DuitBack who you are/)).toBeNull();
    expect(localStorage.getItem('duitback_family_hint')).toBe('1');
  });

  it('on WebKit the install guide opens once by itself, with steps for that device and browser', async () => {
    const ua = Object.getOwnPropertyDescriptor(window.navigator, 'userAgent');
    Object.defineProperty(window.navigator, 'userAgent', { value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1', configurable: true });
    try {
      await completeSetup();
      fireEvent.click(screen.getByText('Skip tour'));
      await screen.findByText('Install DuitBack · Pasang DuitBack', {}, { timeout: 3000 });
      await screen.findByText(/the bar at the bottom of the screen/); // iPhone Safari: Share lives in the bottom bar
      expect(localStorage.getItem('duitback_install_guide')).toBe('1');
      fireEvent.click(screen.getByText('Done · Selesai'));
      await waitFor(() => expect(screen.queryByText('Install DuitBack · Pasang DuitBack')).toBeNull());
      // the dashboard nudge reopens it on demand
      fireEvent.click(screen.getByText('Show me how →'));
      await screen.findByText('Install DuitBack · Pasang DuitBack');
    } finally {
      if (ua) Object.defineProperty(window.navigator, 'userAgent', ua);
    }
  });

  it('inside an in-app browser the guide says to open Safari and offers the link', async () => {
    const ua = Object.getOwnPropertyDescriptor(window.navigator, 'userAgent');
    Object.defineProperty(window.navigator, 'userAgent', { value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 320.0.0.0', configurable: true });
    try {
      await completeSetup();
      fireEvent.click(screen.getByText('Skip tour'));
      await screen.findByText(/Open in Safari/, {}, { timeout: 3000 });
      expect(screen.getByText('Copy link · Salin pautan')).toBeTruthy();
    } finally {
      if (ua) Object.defineProperty(window.navigator, 'userAgent', ua);
    }
  });

  it('returning visitors skip setup and keep their data', async () => {
    await completeSetup('Aisyah');
    cleanup();
    render(<TrackerApp />);
    await screen.findByText('Hello, Aisyah');
    expect(screen.queryByText('Set up your tracker')).toBeNull();
  });
});
