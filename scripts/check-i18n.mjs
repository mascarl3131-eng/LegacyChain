import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const i18nPath = path.join(root, 'src', 'lib', 'i18n.ts');
const source = fs.readFileSync(i18nPath, 'utf8');
const languages = [...source.match(/export type LangCode = ([^;]+);/)?.[1].matchAll(/'([^']+)'/g) || []].map(m => m[1]);
const entries = new Map();
const translationBlock = source
  .slice(source.indexOf('const TRANSLATIONS'), source.indexOf('export function t('));

for (const line of translationBlock.split(/\r?\n/)) {
  const match = line.match(/^  ([A-Za-z0-9]+): \{(.+)\},?$/);
  if (!match) continue;
  entries.set(match[1], match[2]);
}

const errors = [];
for (const [key, value] of entries) {
  for (const lang of languages) {
    if (!new RegExp(`(?:^|,\\s*)\\s*${lang}:`).test(value)) {
      errors.push(`${key}: traduction "${lang}" manquante`);
    }
  }
}

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'ui') walk(full);
    } else if (entry.name.endsWith('.tsx') && !['AuthTest.tsx', 'Home.tsx'].includes(entry.name)) {
      files.push(full);
    }
  }
}
walk(path.join(root, 'src'));

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  for (const match of content.matchAll(/\bt\('([A-Za-z0-9]+)'/g)) {
    if (!entries.has(match[1])) {
      errors.push(`${path.relative(root, file)}: clé "${match[1]}" absente`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`${entries.size} clés vérifiées dans ${languages.length} langues.`);
