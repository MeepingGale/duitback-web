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
