import fs from 'node:fs';

const key = process.env.DEEPL_API_KEY;
if (!key) throw new Error('DEEPL_API_KEY is required');
const source = fs.readFileSync('src/data/hokHeroes.ts', 'utf8');
const reasons = [...source.matchAll(/"reason":\s*"((?:\\.|[^"\\])*)"/g)]
  .map(match => JSON.parse(`"${match[1]}"`));
const unique = [...new Set(reasons)];
const outputPath = 'src/data/synergyTranslations.json';
const translations = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath, 'utf8')) : {};
const pending = unique.filter(text => !translations[text]);
for (let i = 0; i < pending.length; i += 50) {
  const batch = pending.slice(i, i + 50);
  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: { Authorization: `DeepL-Auth-Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: batch, source_lang: 'EN', target_lang: 'ID' }),
  });
  if (!response.ok) throw new Error(`DeepL request failed: ${response.status}`);
  const data = await response.json();
  data.translations.forEach((item, index) => { translations[batch[index]] = item.text; });
}
fs.writeFileSync(outputPath, `${JSON.stringify(translations, null, 2)}\n`);
console.log(`Translated ${pending.length} synergy descriptions; ${Object.keys(translations).length} total.`);
