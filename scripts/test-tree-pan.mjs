import { chromium } from 'playwright';

const baseUrl = process.env.LEGACYCHAIN_URL || 'http://127.0.0.1:3010';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 620, height: 800 } });
const errors = [];

page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
  if (message.type() === 'error' && !message.text().includes('ERR_NETWORK_ACCESS_DENIED')) {
    errors.push(message.text());
  }
});

await page.addInitScript(() => localStorage.setItem('legacychain-onboarding', '1'));
await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Continue without an account/i }).click();
await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('button', { name: 'Family Tree' }).click();

const canvas = page.getByTestId('tree-pan-canvas');
await canvas.waitFor();
await canvas.evaluate(element => { element.scrollLeft = 20; });
const before = await canvas.evaluate(element => element.scrollLeft);
const box = await canvas.boundingBox();
if (!box) throw new Error('Tree canvas is not visible.');

await page.mouse.move(box.x + 120, box.y + 330);
await page.mouse.down({ button: 'left' });
await page.mouse.move(box.x + 50, box.y + 330, { steps: 8 });
await page.mouse.up({ button: 'left' });
const after = await canvas.evaluate(element => element.scrollLeft);
if (after <= before) throw new Error(`Tree did not pan: ${before} → ${after}`);

await page.getByRole('button', { name: /Robert/ }).click();
await page.getByText(/Robert/, { exact: false }).last().waitFor();

await browser.close();
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Tree pan test passed: scrollLeft ${before} → ${after}, member click preserved.`);
