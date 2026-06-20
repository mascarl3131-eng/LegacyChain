import { chromium, firefox } from 'playwright';

const baseUrl = process.env.LEGACYCHAIN_URL || 'http://127.0.0.1:3003';
const browserName = process.env.BROWSER || 'chromium';
const browserType = browserName === 'firefox' ? firefox : chromium;
const browser = await browserType.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  locale: 'fr-FR',
});
const errors = [];

page.on('console', message => {
  if (message.type() === 'error' && !message.text().includes('ERR_NETWORK_ACCESS_DENIED')) {
    errors.push(`console: ${message.text()}`);
  }
});
page.on('pageerror', error => errors.push(`page: ${error.message}`));

const countries = ['France', 'Sénégal', 'Vietnam'];
const emotions = ['hope', 'love', 'wisdom', 'peace', 'warning', 'memory'];
const messages = Array.from({ length: 45 }, (_, index) => ({
  id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  display_name: `Voix ${index + 1}`,
  show_profile: index % 3 === 0,
  country: countries[index % countries.length],
  country_code: null,
  message: `Message de test numéro ${index + 1} pour les générations futures.`,
  emotion: emotions[index % emotions.length],
  audience: ['future', 'descendants', 'humanity', 'whoever'][index % 4],
  language: 'fr',
  reaction_count: index,
  created_at: `${2026 - (index % 3)}-06-${String((index % 20) + 1).padStart(2, '0')}T10:00:00Z`,
}));

await page.route('**/api/humanity-messages?**', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ messages, total: messages.length, page: 1, perPage: 100 }),
  });
});

await page.addInitScript(() => {
  localStorage.setItem('legacychain-onboarding', '1');
  localStorage.removeItem('legacychain-language');
});
await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Continuer sans compte/i }).click();
await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('button', { name: "Voix de l'humanité" }).click();

await page.getByText("VOIX DE L'HUMANITÉ", { exact: true }).waitFor();
await page.locator('svg[role="img"]').waitFor();
await page.getByText(/45 voix récentes/).waitFor();
if (await page.locator('article').count() !== 20) throw new Error('La première page ne contient pas 20 voix.');

await page.getByRole('button').filter({ has: page.locator('svg.lucide-chevron-right') }).click();
await page.getByText('2 / 3', { exact: true }).waitFor();
if (await page.locator('article').count() !== 20) throw new Error('La deuxième page ne contient pas 20 voix.');

await page.locator('select.form-select').nth(0).selectOption({ label: 'France' });
if (await page.locator('article').count() !== 15) throw new Error('Le filtre par pays ne retourne pas les 15 voix attendues.');
await page.locator('input[placeholder*="Rechercher"]').fill('numéro 1');
if (await page.locator('article').count() < 1) throw new Error('La recherche ne retourne aucun résultat.');

const dimensions = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
}));
if (dimensions.scrollWidth > dimensions.clientWidth + 2) {
  throw new Error(`Débordement horizontal mobile: ${dimensions.scrollWidth}px > ${dimensions.clientWidth}px`);
}

if (process.env.SCREENSHOT) {
  await page.screenshot({ path: process.env.SCREENSHOT, fullPage: true });
}

await browser.close();
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Humanity test passed in ${browserName}: filters, map, 45 voices, pagination and mobile layout.`);
