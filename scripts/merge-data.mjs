#!/usr/bin/env node
/**
 * merge-data.mjs — FASE 3 data integrator
 *
 * Menggabungkan catalog (heroes-list.json) dengan hasil scraping detail
 * (heroes-details.json) menjadi dataset TypeScript siap-pakai:
 *
 *   src/data/hokHeroes.ts
 *
 * - avatarUrl selalu menunjuk ke /heroes/[slug].webp
 * - counteredBy / synergies menyimpan id, name, dan reason taktis
 * - counters diturunkan (inverse) dari counteredBy seluruh hero
 * - frequentlyPairedWith dinormalisasi ke { names, matchRate }
 * - equipment diringkas ke build / arcana / spell
 *
 * Jalankan: node scripts/merge-data.mjs
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(__dirname, 'data');
const PUBLIC_HEROES_DIR = resolve(ROOT, 'public', 'heroes');
const OUTPUT_FILE = resolve(ROOT, 'src', 'data', 'hokHeroes.ts');

const VALID_LANES = ['Roam', 'Clash', 'Mid', 'Farm', 'Jungle'];

/** @param {string} label */
function fail(label) {
  console.error(`\n[merge-data] ✗ ${label}`);
  process.exit(1);
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`Gagal membaca ${file}: ${error.message}`);
  }
}

function unique(values) {
  return [...new Set(values.filter(value => value !== undefined && value !== null && value !== ''))];
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

/** Nama item/arcana/spell bisa berupa objek atau string. */
function toName(entry) {
  if (!entry) return '';
  if (typeof entry === 'string') return entry.trim();
  return String(entry.name ?? entry.title ?? '').trim();
}

function cleanReason(reason) {
  if (typeof reason !== 'string') return undefined;
  const trimmed = reason.replace(/\s+/g, ' ').trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildTags(source) {
  const archetypeWords = String(source.archetype ?? '')
    .split(/[\s/&,]+/)
    .map(word => word.trim())
    .filter(Boolean);

  return unique([source.role, source.lane, ...archetypeWords]);
}

function buildEquipment(detail) {
  const equipment = detail.equipment;
  if (!equipment || typeof equipment !== 'object') return undefined;

  const builds = asArray(equipment.builds);
  const primaryBuild = builds[0] ?? {};

  const buildItems = asArray(primaryBuild.items).length > 0
    ? asArray(primaryBuild.items)
    : asArray(equipment.recommendedItems);

  const arcanaItems = asArray(primaryBuild.arcana).length > 0
    ? asArray(primaryBuild.arcana)
    : asArray(equipment.recommendedArcana);

  const spells = asArray(primaryBuild.summonerSpells).length > 0
    ? asArray(primaryBuild.summonerSpells)
    : asArray(equipment.summonerSpells);

  const build = unique(buildItems.map(toName));
  const arcana = unique(arcanaItems.map(toName));
  const spell = toName(spells[0]);

  if (build.length === 0 && arcana.length === 0 && !spell) return undefined;

  return spell ? { build, arcana, spell } : { build, arcana };
}

/**
 * Normalisasi referensi hero (counteredBy / synergies) menjadi
 * { id, name, reason? }. Referensi yang tidak ada di katalog dibuang.
 */
function normalizeReferences(entries, knownIds, ownerId, field) {
  const seen = new Set();
  const result = [];

  for (const entry of asArray(entries)) {
    if (!entry) continue;

    const id = typeof entry === 'string' ? entry.trim() : String(entry.id ?? '').trim();
    if (!id) continue;
    if (!knownIds.has(id)) {
      console.warn(`[merge-data] ⚠ ${ownerId}.${field}: referensi "${id}" tidak ada di katalog — dilewati`);
      continue;
    }
    if (id === ownerId) continue;
    if (seen.has(id)) continue;

    const name = String(entry.name ?? id).trim();
    const reason = cleanReason(entry.reason);

    seen.add(id);
    result.push(reason ? { id, name, reason } : { id, name });
  }

  return result;
}

function normalizePairs(entries, knownIds, ownerId) {
  const seen = new Set();
  const result = [];

  for (const entry of asArray(entries)) {
    if (!entry) continue;

    const rawHeroes = asArray(entry.heroes);
    const rawIds = asArray(entry.heroIds).length > 0
      ? asArray(entry.heroIds)
      : rawHeroes.map(hero => hero?.id);

    const names = unique(
      rawIds
        .map((id, index) => {
          const normalizedId = String(id ?? '').trim();
          if (!normalizedId || !knownIds.has(normalizedId)) return '';
          return String(rawHeroes[index]?.name ?? entry.heroNames?.[index] ?? normalizedId).trim();
        })
    );

    if (names.length === 0) continue;
    if (rawIds.some(id => String(id ?? '').trim() === ownerId)) continue;

    const matchRate = String(entry.rateText ?? (entry.rate !== undefined ? `${entry.rate}%` : '')).trim();
    if (!matchRate) continue;

    const key = `${names.join('|')}@${matchRate}`;
    if (seen.has(key)) continue;

    seen.add(key);
    result.push({ names, matchRate });
  }

  return result;
}

function main() {
  console.log('[merge-data] Membaca sumber data…');
  const list = readJson(resolve(DATA_DIR, 'heroes-list.json'));
  const details = readJson(resolve(DATA_DIR, 'heroes-details.json'));

  if (!Array.isArray(list) || list.length === 0) fail('heroes-list.json harus berupa array hero yang tidak kosong');
  if (!Array.isArray(details) || details.length === 0) fail('heroes-details.json harus berupa array hero yang tidak kosong');

  const detailById = new Map();
  for (const detail of details) {
    const id = String(detail?.id ?? '').trim();
    if (id) detailById.set(id, detail);
  }

  const knownIds = new Set(list.map(hero => String(hero.id).trim()));
  const diskImages = new Set(
    existsSync(PUBLIC_HEROES_DIR)
      ? readdirSync(PUBLIC_HEROES_DIR)
          .filter(file => file.endsWith('.webp'))
          .map(file => file.replace(/\.webp$/i, ''))
      : []
  );

  const heroes = [];
  const issues = [];
  let missingDetails = 0;
  let missingImages = 0;

  for (const catalogHero of list) {
    const id = String(catalogHero.id ?? '').trim();
    if (!id) {
      issues.push('hero tanpa id di heroes-list.json');
      continue;
    }

    const detail = detailById.get(id);
    if (!detail) {
      missingDetails += 1;
      issues.push(`${id}: detail scraping tidak ditemukan`);
    }

    const lane = String(catalogHero.lane ?? detail?.lane ?? '').trim();
    if (!VALID_LANES.includes(lane)) {
      issues.push(`${id}: lane "${lane}" tidak termasuk ${VALID_LANES.join('/')}`);
    }

    // Path avatar selalu mengikuti slug katalog yang juga nama file fisiknya.
    const slug = String(catalogHero.slug ?? id).trim();
    const avatarUrl = `/heroes/${slug}.webp`;
    if (diskImages.size > 0 && !diskImages.has(slug)) {
      missingImages += 1;
      issues.push(`${id}: file public${avatarUrl} tidak ditemukan`);
    }

    const counteredBy = normalizeReferences(detail?.counteredBy, knownIds, id, 'counteredBy');
    const synergies = normalizeReferences(detail?.synergies, knownIds, id, 'synergies');
    const frequentlyPairedWith = normalizePairs(detail?.frequentlyPairedWith, knownIds, id);
    const equipment = buildEquipment(detail ?? {});

    const hero = {
      id,
      name: String(catalogHero.name ?? detail?.name ?? id).trim(),
      role: lane,
      avatarUrl,
      counters: [],
      counteredBy,
      synergies,
    };

    if (frequentlyPairedWith.length > 0) hero.frequentlyPairedWith = frequentlyPairedWith;
    if (equipment) hero.equipment = equipment;
    hero.tags = buildTags({ ...catalogHero, ...detail });

    heroes.push(hero);
  }

  // `counters` = kebalikan dari `counteredBy` (hero yang dikalahkan oleh hero ini).
  const countersById = new Map(heroes.map(hero => [hero.id, new Set()]));
  for (const hero of heroes) {
    for (const counter of hero.counteredBy) {
      countersById.get(counter.id)?.add(hero.id);
    }
  }
  for (const hero of heroes) {
    hero.counters = [...countersById.get(hero.id)].sort();
  }

  heroes.sort((a, b) => a.name.localeCompare(b.name, 'en'));

  if (missingDetails > 0) fail(`${missingDetails} hero tidak memiliki detail scraping — dataset tidak lengkap`);
  if (missingImages > 0) fail(`${missingImages} avatar .webp tidak ditemukan di public/heroes`);
  if (issues.length > 0) fail(`Validasi gagal:\n  - ${issues.join('\n  - ')}`);

  const totalCounters = heroes.reduce((sum, hero) => sum + hero.counters.length, 0);
  const totalSynergies = heroes.reduce((sum, hero) => sum + hero.synergies.length, 0);
  const totalPairs = heroes.reduce((sum, hero) => sum + (hero.frequentlyPairedWith?.length ?? 0), 0);
  const totalBuilds = heroes.filter(hero => hero.equipment?.build.length).length;

  const output = `// AUTO-GENERATED — jangan edit manual.
// Sumber: scripts/data/heroes-list.json + scripts/data/heroes-details.json
// Regenerate: node scripts/merge-data.mjs
//
// Total hero: ${heroes.length} | counter edges: ${totalCounters} | synergy edges: ${totalSynergies}
// frequentlyPairedWith: ${totalPairs} entri | hero dengan build: ${totalBuilds}

export interface Hero {
  id: string;
  name: string;
  role: 'Roam' | 'Clash' | 'Mid' | 'Farm' | 'Jungle';
  avatarUrl: string;
  counters: string[];
  counteredBy: Array<{ id: string; name: string; reason?: string }>;
  synergies: Array<{ id: string; name: string; reason?: string }>;
  frequentlyPairedWith?: Array<{ names: string[]; matchRate: string }>;
  equipment?: { build: string[]; arcana: string[]; spell?: string };
  tags: string[];
}

export const HOK_HEROES: Hero[] = ${JSON.stringify(heroes, null, 2)};
`;

  writeFileSync(OUTPUT_FILE, output, 'utf8');

  const roleCounts = heroes.reduce((acc, hero) => {
    acc[hero.role] = (acc[hero.role] ?? 0) + 1;
    return acc;
  }, {});

  console.log('\n[merge-data] ✓ Integrasi selesai');
  console.log(`  Output          : src/data/hokHeroes.ts`);
  console.log(`  Heroes          : ${heroes.length}`);
  console.log(`  Role            : ${Object.entries(roleCounts).map(([role, count]) => `${role} ${count}`).join(' | ')}`);
  console.log(`  Counter edges   : ${totalCounters}`);
  console.log(`  Synergy edges   : ${totalSynergies}`);
  console.log(`  Pairing entries : ${totalPairs}`);
  console.log(`  Hero with build : ${totalBuilds}`);
  console.log(`  Avatar .webp    : ${diskImages.size} file tersedia`);
}

main();
