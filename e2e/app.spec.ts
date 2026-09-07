import { expect, test, type Page } from '@playwright/test';

/** Load the demo, then turn it into "real" data so one-time nudges and the install guide behave as for a person. */
async function seedReal(page: Page) {
  await page.goto('app/?demo=1');
  await page.waitForSelector('[data-screen-label]');
  await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('cukaiku_v3') || 'null');
    d.demo = false; d.profile.taxNo = 'SG 7654321-08'; d.profile.disabled = false; d.profile.children = {};
    localStorage.setItem('cukaiku_v3', JSON.stringify(d));
    localStorage.removeItem('duitback_install_guide');
    localStorage.removeItem('duitback_install_hint');
  });
}

test('every relief explains what counts in a popover that Escape closes', async ({ page }) => {
  await page.goto('app/?demo=1#claims');
  await page.getByRole('button', { name: 'What counts · Medical — self, spouse, child' }).click();
  const dlg = page.getByRole('dialog', { name: 'What counts · Medical — self, spouse, child' });
  await expect(dlg).toBeVisible();
  await expect(dlg).toContainText('Chiropractic');
  await expect(dlg).toContainText('pneumococcal, HPV, influenza');
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
});

test('the public reliefs page carries the knowledge in its HTML, with FAQ structured data', async ({ page }) => {
  await page.goto('reliefs/');
  const details = page.locator('#what-counts-medical');
  await expect(details).toContainText('Chiropractic'); // present even while collapsed
  await details.locator('summary').click();
  await expect(details.locator('.help-body')).toBeVisible();
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.some((t) => t.includes('"FAQPage"'))).toBe(true);
});

test('the JSON backup downloads on a desktop browser', async ({ page, isMobile }) => {
  test.skip(isMobile, 'iPhone hands the file to the share sheet instead');
  await seedReal(page);
  await page.goto('app/#settings');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export data (JSON)' }).click();
  expect((await download).suggestedFilename()).toBe('duitback-data.json');
});

test('a horizontal swipe pages to the next screen', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit lacks the Touch constructor used to synthesise the gesture');
  await page.goto('app/?demo=1');
  await page.waitForSelector('[data-screen-label="Dashboard"]');
  await page.evaluate(async () => {
    const el = document.querySelector('.screen-host') as HTMLElement;
    const fire = (type: string, x: number) => {
      const touch = new Touch({ identifier: 1, target: el, clientX: x, clientY: 400 });
      el.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: type === 'touchend' ? [] : [touch], changedTouches: [touch] }));
    };
    fire('touchstart', 300);
    await new Promise((r) => setTimeout(r, 80));
    fire('touchend', 100);
  });
  await expect(page.locator('[data-screen-label="Claims"]')).toBeVisible();
});

test.describe('on an iPhone', () => {
  test.skip(({ isMobile }) => !isMobile, 'iPhone project only');

  test('the install guide opens by itself and walks its steps', async ({ page }) => {
    await seedReal(page);
    await page.goto('app/');
    const step1 = page.getByRole('dialog', { name: /Install DuitBack, step 1 of 3/ });
    await expect(step1).toBeVisible({ timeout: 6000 });
    await expect(page.getByRole('img', { name: /tapping the Share button|··· button/ })).toBeVisible();
    await step1.getByRole('button', { name: 'Next →' }).click();
    await expect(page.getByRole('dialog', { name: /step 2 of 3/ })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: /Install DuitBack/ })).toBeHidden();
  });

  test('the help opens as a bottom sheet that fits the screen', async ({ page }) => {
    await page.goto('app/?demo=1#claims');
    await page.getByRole('button', { name: 'What counts · Lifestyle' }).click();
    const box = await page.getByRole('dialog', { name: 'What counts · Lifestyle' }).boundingBox();
    // WebKit's phone emulation reports fixed elements a few px off the visual viewport once the page has scrolled,
    // so the bottom edge is checked with a small tolerance
    const vp = await page.evaluate(() => ({ w: document.documentElement.clientWidth, h: window.innerHeight }));
    expect(box!.x).toBe(0);
    expect(Math.round(box!.width)).toBe(vp.w);
    expect(Math.abs(box!.y + box!.height - vp.h)).toBeLessThanOrEqual(24);
    expect(box!.height).toBeLessThan(vp.h * 0.85);
    expect(box!.y).toBeGreaterThan(vp.h * 0.1);
  });
});

test.describe('receipt reading on the device', () => {
  const EINV = 'https://myinvois.hasil.gov.my/F9D425P6DS7D8IU/share/7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d';

  test('a photo carrying a MyInvois QR is marked as a validated e-invoice on upload', async ({ page }) => {
    const QRCode = await import('qrcode');
    const buffer = await QRCode.toBuffer(EINV, { type: 'png', width: 420, margin: 4 });
    await page.goto('app/?demo=1#receipts');
    await page.locator('input[type="file"]').first().setInputFiles({ name: 'einvoice.png', mimeType: 'image/png', buffer });
    const badge = page.getByRole('link', { name: 'e-Invoice ✓' });
    await expect(badge).toBeVisible({ timeout: 15_000 });
    await expect(badge).toHaveAttribute('href', EINV);
    const card = page.getByText('einvoice.png', { exact: true }).locator('xpath=ancestor::div[.//button[contains(., "Tag →")]][1]');
    await card.getByRole('button', { name: 'Tag →' }).click();
    const dlg = page.getByRole('dialog', { name: 'Tag receipt · Tag resit' });
    await expect(dlg).toContainText('Validated e-invoice');
    await expect(dlg).toContainText('F9D425P6DS7D8IU');
  });

  test('several photos picked at once all land in the vault', async ({ page, context }) => {
    const sheet = await context.newPage();
    const shot = async (label: string) => { await sheet.setContent(`<body style="margin:0;background:#fff"><pre style="font:32px monospace;padding:30px">${label}</pre></body>`); return sheet.locator('pre').screenshot({ type: 'png' }); };
    const files = [{ name: 'one.png', mimeType: 'image/png', buffer: await shot('KEDAI SATU') }, { name: 'two.png', mimeType: 'image/png', buffer: await shot('KEDAI DUA') }, { name: 'three.png', mimeType: 'image/png', buffer: await shot('KEDAI TIGA') }];
    await sheet.close();
    await page.goto('app/?demo=1#receipts');
    await expect(page.getByRole('button', { name: /All · Semua \(3\)/ })).toBeVisible();
    await page.locator('input[type="file"]').first().setInputFiles(files);
    await expect(page.getByRole('button', { name: /All · Semua \(6\)/ })).toBeVisible({ timeout: 15_000 });
    for (const f of files) await expect(page.getByText(f.name)).toBeVisible();
  });

  test('"Read receipt" fills the form from a photo using the on-device engine', async ({ page, context }) => {
    test.setTimeout(180_000); // first run downloads the engine and language packs from the local server
    // render a clean receipt and photograph it — the same pixels a phone camera would hand the app
    const sheet = await context.newPage();
    await sheet.setContent(`<body style="margin:0;background:#fff"><pre style="font:28px/1.5 Menlo,Consolas,monospace;color:#000;padding:40px;width:640px;margin:0">KLINIK MEDIVIRON SDN BHD
No 12 Jalan Damai
Kuala Lumpur

TAX INVOICE
Date: 14/05/2026

Consultation          60.00
Medicine              60.00

Total              RM 120.00
Cash                  150.00
Change                 30.00

Thank you
</pre></body>`);
    const buffer = await sheet.locator('pre').screenshot({ type: 'png' });
    await sheet.close();

    await page.goto('app/?demo=1#receipts');
    await page.locator('input[type="file"]').first().setInputFiles({ name: 'klinik.png', mimeType: 'image/png', buffer });
    // the upload decodes and re-encodes the photo first; on a slow runner that takes a moment, so tag *this* card, not the first one
    const card = page.getByText('klinik.png', { exact: true }).locator('xpath=ancestor::div[.//button[contains(., "Tag →")]][1]');
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.getByRole('button', { name: 'Tag →' }).click();
    const dlg = page.getByRole('dialog', { name: 'Tag receipt · Tag resit' });
    await expect(dlg).toContainText('klinik.png');
    await dlg.getByRole('button', { name: 'Read receipt · Baca resit' }).click();
    await expect(dlg).toContainText('Read from the photo on this device', { timeout: 150_000 });
    await expect(dlg.getByLabel('Amount · Jumlah (RM)')).toHaveValue('120.00');
    await expect(dlg.getByLabel('Date · Tarikh')).toHaveValue('2026-05-14');
    await expect(dlg.getByLabel('Relief category · Kategori')).toHaveValue('medical');
    await expect(dlg.getByLabel('Merchant · Kedai')).toHaveValue(/Klinik Mediviron/i);
    await dlg.getByRole('button', { name: 'Save · Simpan' }).click();
    await expect(page.getByText('Klinik Mediviron Sdn Bhd · RM 120', { exact: false })).toBeVisible();
  });
});
