#!/usr/bin/env node
/**
 * Fix locale files: en.json should have English, id.json should have Indonesian
 * Run after translate-db.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const HEROES_DETAILS_PATH = path.join(PROJECT_ROOT, 'scripts/data/heroes-details.json');
const EN_JSON_PATH = path.join(PROJECT_ROOT, 'src/locales/en.json');
const ID_JSON_PATH = path.join(PROJECT_ROOT, 'src/locales/id.json');

function extractOriginalEnglish(heroes) {
  const counterReasons = {};
  const synergyReasons = {};

  for (const hero of heroes) {
    // Counter reasons (counteredBy) - original English
    for (const counter of hero.counteredBy || []) {
      if (counter.reason && counter.reason.trim()) {
        const path = `tactical.counters.${hero.id}.${counter.id}`;
        counterReasons[path] = counter.reason.trim();
      }
    }

    // Synergy reasons - original English
    for (const synergy of hero.synergies || []) {
      if (synergy.reason && synergy.reason.trim()) {
        const path = `tactical.synergies.${hero.id}.${synergy.id}`;
        synergyReasons[path] = synergy.reason.trim();
      }
    }
  }

  return { counterReasons, synergyReasons };
}

function setNested(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    current[parts[i]] = current[parts[i]] || {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

function main() {
  console.log('🔧 Fixing locale files (EN/ID separation)...');

  // Load heroes details for original English
  const heroesData = JSON.parse(fs.readFileSync(HEROES_DETAILS_PATH, 'utf-8'));
  const { counterReasons, synergyReasons } = extractOriginalEnglish(heroesData);

  // Load current locale files
  const enLocale = JSON.parse(fs.readFileSync(EN_JSON_PATH, 'utf-8'));
  const idLocale = JSON.parse(fs.readFileSync(ID_JSON_PATH, 'utf-8'));

  // Build tactical section with ORIGINAL ENGLISH for en.json
  const tacticalEn = { counters: {}, synergies: {} };
  const tacticalId = { counters: {}, synergies: {} };

  for (const [path, value] of Object.entries(counterReasons)) {
    setNested(tacticalEn.counters, path.replace('tactical.counters.', ''), value);
    // id.json already has Indonesian from translate script - keep it
    const idPath = path.replace('tactical.counters.', '');
    const parts = idPath.split('.');
    let current = idLocale.tactical?.counters;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current?.[parts[i]];
    }
    if (current && current[parts[parts.length - 1]]) {
      setNested(tacticalId.counters, idPath, current[parts[parts.length - 1]]);
    }
  }

  for (const [path, value] of Object.entries(synergyReasons)) {
    setNested(tacticalEn.synergies, path.replace('tactical.synergies.', ''), value);
    const idPath = path.replace('tactical.synergies.', '');
    const parts = idPath.split('.');
    let current = idLocale.tactical?.synergies;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current?.[parts[i]];
    }
    if (current && current[parts[parts.length - 1]]) {
      setNested(tacticalId.synergies, idPath, current[parts[parts.length - 1]]);
    }
  }

  // Update en.json with English tactical
  enLocale.tactical = tacticalEn;
  // id.json keeps Indonesian tactical (already there)
  idLocale.tactical = tacticalId;

  // Also ensure items section has proper EN/ID
  // The translate script already put items with {en, id} structure, but we need flat for t() function
  if (enLocale.items && idLocale.items) {
    // Convert to flat structure for t() function
    const enItems = {};
    const idItems = {};
    for (const [key, value] of Object.entries(enLocale.items)) {
      if (typeof value === 'object' && value.en) {
        enItems[key] = value.en;
        idItems[key] = value.id || value.en;
      } else {
        enItems[key] = value;
        idItems[key] = idLocale.items[key] || value;
      }
    }
    enLocale.items = enItems;
    idLocale.items = idItems;
  }

  // Write updated locale files
  fs.writeFileSync(EN_JSON_PATH, JSON.stringify(enLocale, null, 2));
  fs.writeFileSync(ID_JSON_PATH, JSON.stringify(idLocale, null, 2));

  console.log('✅ Locale files fixed!');
  console.log(`   en.json: English tactical texts`);
  console.log(`   id.json: Indonesian tactical texts`);
}

main().catch(console.error);