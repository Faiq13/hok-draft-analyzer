#!/usr/bin/env node
/**
 * DeepL Batch Translation Script for HoK Draft Analyzer
 * Translates all tactical English texts (counter/synergy reasons, item descriptions) to Indonesian
 * 
 * Usage: DEEPL_API_KEY=your_key node scripts/translate-db.mjs
 * Or run without env var to be prompted for the key
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const HEROES_DETAILS_PATH = path.join(PROJECT_ROOT, 'scripts/data/heroes-details.json');
const ITEMS_PATH = path.join(PROJECT_ROOT, 'src/data/hokItems.ts');
const LOCALES_DIR = path.join(PROJECT_ROOT, 'src/locales');
const EN_JSON_PATH = path.join(LOCALES_DIR, 'en.json');
const ID_JSON_PATH = path.join(LOCALES_DIR, 'id.json');

const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

// DeepL free tier limit: 500,000 chars/month
// Batch size for API calls
const BATCH_SIZE = 50;

async function getApiKey() {
  // Check env var first
  if (process.env.DEEPL_API_KEY) {
    return process.env.DEEPL_API_KEY.trim();
  }

  // Prompt user
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Enter your DeepL API Free key: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function translateBatch(apiKey, texts, targetLang = 'ID') {
  // DeepL API expects form data with Authorization header
  const params = new URLSearchParams();
  params.append('target_lang', targetLang);
  
  // Add all texts - DeepL allows multiple 'text' parameters
  for (const text of texts) {
    params.append('text', text);
  }

  const response = await fetch(DEEPL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepL API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.translations.map(t => t.text);
}

function extractTacticalTexts(heroes) {
  const counterReasons = [];
  const synergyReasons = [];
  const reasonToHeroMap = new Map(); // Track which hero each reason belongs to

  for (const hero of heroes) {
    // Counter reasons (counteredBy)
    for (const counter of hero.counteredBy || []) {
      if (counter.reason && counter.reason.trim()) {
        const key = `counter.${hero.id}.${counter.id}`;
        counterReasons.push({
          key,
          text: counter.reason.trim(),
          heroId: hero.id,
          targetId: counter.id,
        });
        reasonToHeroMap.set(counter.reason.trim(), { heroId: hero.id, targetId: counter.id, type: 'counter' });
      }
    }

    // Synergy reasons
    for (const synergy of hero.synergies || []) {
      if (synergy.reason && synergy.reason.trim()) {
        const key = `synergy.${hero.id}.${synergy.id}`;
        synergyReasons.push({
          key,
          text: synergy.reason.trim(),
          heroId: hero.id,
          targetId: synergy.id,
        });
        reasonToHeroMap.set(synergy.reason.trim(), { heroId: hero.id, targetId: synergy.id, type: 'synergy' });
      }
    }
  }

  return { counterReasons, synergyReasons, reasonToHeroMap };
}

function extractItemDescriptions() {
  const content = fs.readFileSync(ITEMS_PATH, 'utf-8');
  const descriptions = {};
  
  // Extract ITEM_DESCRIPTIONS object
  const match = content.match(/export const ITEM_DESCRIPTIONS: Record<string, \{ en: string; id: string \}> = (\{[\s\S]*?\});/);
  if (match) {
    try {
      // This is a bit hacky but works for our structured data
      const objStr = match[1];
      // Simple parsing for our known structure
      const enMatches = objStr.matchAll(/'([^']+)-desc': \{\s*en: '([^']+)'/g);
      for (const m of enMatches) {
        descriptions[m[1]] = m[2];
      }
    } catch (e) {
      console.warn('Could not parse ITEM_DESCRIPTIONS, using fallback');
    }
  }
  
  return descriptions;
}

async function main() {
  console.log('🔄 HoK Draft Analyzer - DeepL Batch Translation');
  console.log('================================================\n');

  // Get API key
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error('❌ No API key provided. Exiting.');
    process.exit(1);
  }

  // Load heroes details
  console.log('📖 Loading heroes data...');
  const heroesData = JSON.parse(fs.readFileSync(HEROES_DETAILS_PATH, 'utf-8'));
  console.log(`   Found ${heroesData.length} heroes`);

  // Extract tactical texts
  console.log('🔍 Extracting tactical texts...');
  const { counterReasons, synergyReasons, reasonToHeroMap } = extractTacticalTexts(heroesData);
  console.log(`   Counter reasons: ${counterReasons.length}`);
  console.log(`   Synergy reasons: ${synergyReasons.length}`);

  // Extract item descriptions
  const itemDescriptions = extractItemDescriptions();
  console.log(`   Item descriptions: ${Object.keys(itemDescriptions).length}`);

  // Collect all unique texts to translate
  const allTexts = [
    ...counterReasons.map(r => r.text),
    ...synergyReasons.map(r => r.text),
    ...Object.values(itemDescriptions),
  ];

  // Deduplicate
  const uniqueTexts = [...new Set(allTexts)];
  console.log(`\n📝 Total unique texts to translate: ${uniqueTexts.length}`);

  if (uniqueTexts.length === 0) {
    console.log('✅ Nothing to translate. Exiting.');
    return;
  }

  // Translate in batches
  console.log('\n🌐 Translating with DeepL API...');
  const translations = new Map();
  
  for (let i = 0; i < uniqueTexts.length; i += BATCH_SIZE) {
    const batch = uniqueTexts.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(uniqueTexts.length / BATCH_SIZE);
    
    process.stdout.write(`   Batch ${batchNum}/${totalBatches} (${batch.length} texts)... `);
    
    try {
      const results = await translateBatch(apiKey, batch);
      for (let j = 0; j < batch.length; j++) {
        translations.set(batch[j], results[j]);
      }
      console.log('✅');
    } catch (error) {
      console.log(`❌ ${error.message}`);
      console.log('   Retrying failed batch in 5 seconds...');
      await new Promise(r => setTimeout(r, 5000));
      try {
        const results = await translateBatch(apiKey, batch);
        for (let j = 0; j < batch.length; j++) {
          translations.set(batch[j], results[j]);
        }
        console.log('   ✅ Retry successful');
      } catch (retryError) {
        console.error(`   ❌ Retry failed: ${retryError.message}`);
        // Keep original text as fallback
        for (const text of batch) {
          translations.set(text, text);
        }
      }
    }
    
    // Rate limiting - be nice to the API
    if (i + BATCH_SIZE < uniqueTexts.length) {
      await new Promise(r => setTimeout(r, 100));
    }
  }

  console.log('\n💾 Building locale structures...');

  // Build nested translation objects for locale files
  const counterTranslations = {};
  const synergyTranslations = {};
  const itemTranslations = {};

  for (const cr of counterReasons) {
    const translated = translations.get(cr.text) || cr.text;
    const path = `tactical.counters.${cr.heroId}.${cr.targetId}`;
    counterTranslations[path] = translated;
  }

  for (const sr of synergyReasons) {
    const translated = translations.get(sr.text) || sr.text;
    const path = `tactical.synergies.${sr.heroId}.${sr.targetId}`;
    synergyTranslations[path] = translated;
  }

  for (const [key, enText] of Object.entries(itemDescriptions)) {
    const translated = translations.get(enText) || enText;
    itemTranslations[key] = { en: enText, id: translated };
  }

  // Load existing locale files
  const enLocale = JSON.parse(fs.readFileSync(EN_JSON_PATH, 'utf-8'));
  const idLocale = JSON.parse(fs.readFileSync(ID_JSON_PATH, 'utf-8'));

  // Deep merge function
  function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = target[key] || {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  // Build tactical section for locales
  const tacticalEn = { counters: {}, synergies: {} };
  const tacticalId = { counters: {}, synergies: {} };

  // Convert flat paths to nested objects
  function setNested(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = current[parts[i]] || {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }

  for (const [path, value] of Object.entries(counterTranslations)) {
    setNested(tacticalEn.counters, path.replace('tactical.counters.', ''), value);
    setNested(tacticalId.counters, path.replace('tactical.counters.', ''), value);
  }

  for (const [path, value] of Object.entries(synergyTranslations)) {
    setNested(tacticalEn.synergies, path.replace('tactical.synergies.', ''), value);
    setNested(tacticalId.synergies, path.replace('tactical.synergies.', ''), value);
  }

  // Merge tactical translations into locales
  enLocale.tactical = tacticalEn;
  idLocale.tactical = tacticalId;

  // Update item descriptions with translations
  enLocale.items = enLocale.items || {};
  idLocale.items = idLocale.items || {};
  
  for (const [key, value] of Object.entries(itemTranslations)) {
    enLocale.items[key] = value.en;
    idLocale.items[key] = value.id;
  }

  // Write updated locale files
  fs.writeFileSync(EN_JSON_PATH, JSON.stringify(enLocale, null, 2));
  fs.writeFileSync(ID_JSON_PATH, JSON.stringify(idLocale, null, 2));

  console.log('\n✅ Translation complete!');
  console.log(`   Updated: ${EN_JSON_PATH}`);
  console.log(`   Updated: ${ID_JSON_PATH}`);
  console.log(`\n📊 Statistics:`);
  console.log(`   Counter reasons translated: ${counterReasons.length}`);
  console.log(`   Synergy reasons translated: ${synergyReasons.length}`);
  console.log(`   Item descriptions translated: ${Object.keys(itemTranslations).length}`);
}

main().catch(console.error);