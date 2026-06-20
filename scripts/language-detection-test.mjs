import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const cases = [
  ['fr-FR', 'Continuer sans compte'],
  ['es-ES', 'Continuar sin cuenta'],
  ['ar-SA', 'المتابعة بدون حساب'],
  ['ja-JP', 'アカウントなしで続ける'],
];

for (const [locale, expected] of cases) {
  const context = await browser.newContext({ locale });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('legacychain-onboarding', '1');
    localStorage.removeItem('legacychain-language');
  });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: expected }).waitFor();
  console.log(`${locale}: ${expected}`);
  await context.close();
}

await browser.close();
console.log('Language detection passed.');
