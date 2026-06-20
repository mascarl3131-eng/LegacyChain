import { chromium } from 'playwright';

const baseUrl = process.env.LEGACYCHAIN_URL || 'http://127.0.0.1:3010';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'fr-FR' });
const reports = [];

await page.route('**/api/bug-reports', async route => {
  reports.push(JSON.parse(route.request().postData() || '{}'));
  await route.fulfill({ status: 201, contentType: 'application/json', body: '{"ok":true}' });
});

await page.addInitScript(() => {
  localStorage.setItem('legacychain-onboarding', '1');
  localStorage.removeItem('legacychain-language');
});
await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Continuer sans compte/i }).click();
await page.getByRole('button', { name: 'SIGNALER UN BUG' }).click();
await page.getByRole('dialog').waitFor();
await page.getByText('Aidez-nous à améliorer LegacyChain').waitFor();
await page.getByLabel('QUE S’EST-IL PASSÉ ?').fill('Le bouton de test ne répond pas après le premier clic.');
await page.getByRole('button', { name: 'ENVOYER LE SIGNALEMENT' }).click();
await page.getByText('SIGNALEMENT REÇU').waitFor();

if (reports.length !== 1) throw new Error('The bug report was not submitted exactly once.');
if (reports[0].language !== 'fr' || !reports[0].viewport || !reports[0].browser) {
  throw new Error('Technical report context is incomplete.');
}

await browser.close();
console.log('Bug report test passed: modal, French copy, submission and technical context.');
