#!/usr/bin/env node
/**
 * DeepL Translation Script for Synergy Reasons
 * Translates synergy reasons from English to Indonesian using DeepL API
 * 
 * Usage: node scripts/translate-synergy.mjs
 * Or: DEEPL_API_KEY=your_key node scripts/translate-synergy.mjs
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Hero IDs that have synergy entries (matching the keys in en.json)
const heroIds = [
  'agudo', 'alessio', 'allain', 'angela', 'annette', 'aoyin', 'arke', 'arli',
  'arthur', 'ata', 'athena', 'augran', 'bai-qi', 'biron', 'butterfly', 'cai-yan',
  'chano', 'charlotte', 'chicha', 'cirrus', 'consort-yu', 'da-qiao', 'daji',
  'devara', 'dharma', 'dian-wei', 'diaochan', 'dolia', 'donghuang', 'dr-bian',
  'dun', 'dunshan', 'dyadia', 'erin', 'fang', 'fatih', 'feyd', 'florentino',
  'flowborn-assassin', 'flowborn-mage', 'flowborn-marksman', 'flowborn-roamer',
  'flowborn-tank', 'fuzi', 'gan-mo', 'gao', 'gao-changgong', 'garo', 'garuda',
  'guan-yu', 'guiguzi', 'han-xin', 'haya', 'heino', 'hou-yi', 'huang-zhong',
  'jing', 'kaizer', 'kongming', 'kui', 'lam', 'lapulapu', 'li-bai', 'li-xin',
  'lian-po', 'liang', 'liu-bang', 'liu-bei', 'liu-shan', 'lorion', 'lu-bu',
  'luara', 'luban-no-7', 'luna', 'mai-shiranui', 'marco-polo', 'mayene', 'meng-ya',
  'menki', 'mi-yue', 'milady', 'ming', 'mozi', 'mulan', 'musashi', 'nakoruru',
  'nezha', 'nuwa', 'pei', 'sakeer', 'shangguan', 'shi', 'shouyue', 'sima-yi',
  'sun-bin', 'sun-ce', 'ukyo-tachibana', 'umbrosa', 'wang-wei', 'wang-zhaojun',
  'wukong', 'wuyan', 'xiang-yu', 'xiao-qiao', 'xuance', 'yang-jian', 'yango',
  'yao', 'yaria', 'ying', 'yixing', 'yuhuan', 'zhang-fei', 'zhou-yu', 'zhuangzi',
  'zilong', 'ziya'
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  // Ask for API key
  const apiKey = await new Promise(resolve => {
    rl.question('Masukkan DEEPL_API_KEY: ', resolve);
  });

  // Read current id.json
  const idJsonPath = path.join(process.cwd(), 'src', 'locales', 'id.json');
  const idJson = JSON.parse(fs.readFileSync(idJsonPath, 'utf-8'));

  // Read en.json for source text
  const enJsonPath = path.join(process.cwd(), 'src', 'locales', 'en.json');
  const enJson = JSON.parse(fs.readFileSync(enJsonPath, 'utf-8'));

  // Extract all English synergy reasons from en.json
  const englishSynergies = enJson.tactical?.synergies || {};
  const translatedSynergies = { ...idJson.tactical?.synergies || {} };

  // Translate each synergy entry
  let successCount = 0;
  let errorCount = 0;

  for (const heroId of heroIds) {
    if (!englishSynergies[heroId]) continue;

    translatedSynergies[heroId] = {};
    for (const targetId in englishSynergies[heroId]) {
      const text = englishSynergies[heroId][targetId];
      if (!text || text.trim() === '') {
        translatedSynergies[heroId][targetId] = '';
        continue;
      }

      try {
        const response = await fetch('https://api.deepl.com/v2/translate', {
          method: 'POST',
          headers: {
            'Authorization': `DeepL-API-Key ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: text,
            target_lang: 'ID'
          })
        });

        const data = await response.json();
        if (data && data.translations && data.translations[0] && data.translations[0].text) {
          translatedSynergies[heroId][targetId] = data.translations[0].text;
          successCount++;
          // console.log(`✓ ${heroId} → ${targetId}`);
        } else {
          console.error(`✗ Error translating ${heroId} → ${targetId}: ${data.message || 'Unknown error'}`);
          translatedSynergies[heroId][targetId] = text; // Keep original
          errorCount++;
        }
      } catch (error) {
        console.error(`✗ Exception translating ${heroId} → ${targetId}:`, error.message);
        translatedSynergies[heroId][targetId] = text; // Keep original
        errorCount++;
      }
    }
  }

  // Update id.json with translated synergies
  idJson.tactical.synergies = translatedSynergies;
  fs.writeFileSync(idJsonPath, JSON.stringify(idJson, null, 2) + '\n');
  console.log(`\n✓ Completed: ${successCount} translated, ${errorCount} kept original`);
  console.log('✓ Successfully updated src/locales/id.json with DeepL translations');

  rl.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});