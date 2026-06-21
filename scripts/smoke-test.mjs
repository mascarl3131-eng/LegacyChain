import { chromium } from 'playwright';

const baseUrl = process.env.LEGACYCHAIN_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];

page.on('console', message => {
  if (message.type() === 'error' && !message.text().includes('ERR_NETWORK_ACCESS_DENIED')) {
    errors.push(`console: ${message.text()}`);
  }
});
page.on('pageerror', error => errors.push(`page: ${error.message}`));

await page.addInitScript(() => localStorage.setItem('legacychain-onboarding', '1'));
await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Continue without an account/i }).click();
await page.getByRole('button', { name: 'Menu' }).waitFor();

const destinations = [
  ['Family Tree', 'FAMILY TREE'],
  ['Origins & DNA', 'ORIGINS & DNA'],
  ['Challenges', 'INTERGENERATIONAL CHALLENGES'],
  ['Book of Life', 'BOOK OF LIFE'],
  ['Voices of Humanity', 'VOICES OF HUMANITY'],
  ['Family Legacy', 'FAMILY CHAIN'],
];

for (const [menuLabel, heading] of destinations) {
  await page.getByRole('button', { name: 'Menu' }).click();
  const drawer = page.locator('div[aria-hidden="false"]');
  await drawer.waitFor();
  await drawer.getByRole('button', { name: menuLabel, exact: false }).click();
  await page.getByText(heading, { exact: true }).waitFor();
}

await page.screenshot({ path: 'smoke-test.png', fullPage: true });
await browser.close();

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Smoke test passed: ${destinations.length} pages, no browser errors.`);
