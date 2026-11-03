#!/usr/bin/env node
/**
 * Phase 2 — Deep crawl of hub-game.com hero detail pages.
 *
 * Reads the 120 heroes from scripts/data/heroes-list.json, opens
 * https://hub-game.com/hok/en/heroes/<sourceSlug> for each one with a small
 * concurrency pool, and extracts:
 *
 *   - counteredBy        hero + tactical reason
 *   - synergies          best-synergy hero + reason
 *   - frequentlyPairedWith official in-game match-rate pairings
 *   - equipment          recommended item builds, summoner spells, arcana
 *   - description        playstyle summary + early/mid/late/teamfight tips
 *   - strengths / weaknesses
 *
 * The page is server-rendered, so a plain fetch + small HTML helpers are
 * enough; no browser or heavyweight DOM dependency is required.
 *
 * Output:
 *   scripts/data/heroes-details.json
 *
 * A single hero never aborts the run: fetch/parse errors are caught and the
 * hero gets empty arrays/objects as a fallback, with crawlStatus "failed".
 *
 * Usage:
 *   node scripts/fetch-details.mjs
 *   node scripts/fetch-details.mjs --limit=5      # writes a .sample.json
 *   node scripts/fetch-details.mjs --concurrency=3
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, '..');
const DATA_DIR = path.join(SCRIPT_DIR, 'data');
const HEROES_FILE = path.join(DATA_DIR, 'heroes-list.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'heroes-details.json');
const SAMPLE_FILE = path.join(DATA_DIR, 'heroes-details.sample.json');

const BASE_URL = 'https://hub-game.com/hok/en/heroes';
const DEFAULT_CONCURRENCY = 4;
const REQUEST_DELAY_MS = 300;
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function readNumberArg(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((value) => value.startsWith(prefix));
  if (!arg) return fallback;
  const parsed = Number(arg.slice(prefix.length));
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

const CONCURRENCY = Math.min(
  8,
  Math.max(1, readNumberArg('concurrency', DEFAULT_CONCURRENCY)),
);
const LIMIT = readNumberArg('limit', 0);
const OUTPUT_PATH = LIMIT ? SAMPLE_FILE : OUTPUT_FILE;

/* ------------------------------------------------------------------ */
/* HTML helpers                                                        */
/* ------------------------------------------------------------------ */

function decodeCodePoint(value) {
  try {
    return String.fromCodePoint(value);
  } catch {
    return '';
  }
}

function decodeEntities(text) {
  return String(text ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => decodeCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => decodeCodePoint(Number(dec)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function cleanText(html) {
  return decodeEntities(String(html ?? '').replace(/<[^>]*>/g, ' '))
    .replace(/[\u00a0\u200b]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanListItem(html) {
  return cleanText(html)
    .replace(/^[•·▪◦*\-–—]\s*/, '')
    .trim();
}

function sliceBetween(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  if (start === -1) return '';
  const end = endMarker
    ? html.indexOf(endMarker, start + startMarker.length)
    : -1;
  return html.slice(start, end === -1 ? undefined : end);
}

/** Drop the Next.js flight payload so only rendered HTML is parsed. */
function renderedHtml(raw) {
  const marker = raw.indexOf('self.__next_f');
  return (marker > 0 ? raw.slice(0, marker) : raw).replace(/\r\n/g, '\n');
}

function isNotFoundPage(html) {
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) ?? [])[1] ?? '';
  return (
    /Page Not Found/i.test(title) ||
    html.includes('>Page Not Found</h1>') ||
    html.includes('text-7xl font-black text-brand-400')
  );
}

function extractParagraphAfterLabel(html, label) {
  const index = html.indexOf(`>${label}<`);
  if (index === -1) return '';
  const match = html.slice(index).match(/<p[^>]*>([\s\S]*?)<\/p>/);
  return match ? cleanText(match[1]) : '';
}

function extractListAfterLabel(html, label) {
  const index = html.indexOf(`>${label}<`);
  if (index === -1) return [];
  const list = html.slice(index).match(/<ul[^>]*>([\s\S]*?)<\/ul>/);
  if (!list) return [];
  return [...list[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)]
    .map((match) => cleanListItem(match[1]))
    .filter(Boolean);
}

function uniqueBy(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ------------------------------------------------------------------ */
/* Detail-page parsers                                                 */
/* ------------------------------------------------------------------ */

function parseHeroReasonCards(block) {
  const cards = [];
  const anchorRe =
    /<a\b[^>]*href="\/hok\/en\/heroes\/([^"#?]+)"[^>]*>([\s\S]*?)<\/a>/g;

  for (const match of block.matchAll(anchorRe)) {
    const slug = match[1];
    const inner = match[2];
    const alt = inner.match(/<img[^>]+alt="([^"]*)"/);
    const spans = [...inner.matchAll(/<span[^>]*>([\s\S]*?)<\/span>/g)]
      .map((span) => cleanText(span[1]))
      .filter(Boolean);
    const name = alt ? cleanText(alt[1]) : spans[0] ?? '';
    if (!name) continue;

    const reasonMatch = inner.match(
      /<span class="[^"]*text-slate-600[^"]*">([\s\S]*?)<\/span>/,
    );
    const reason = reasonMatch
      ? cleanText(reasonMatch[1])
      : spans.length > 1
        ? spans[spans.length - 1]
        : '';

    cards.push({ slug, name, reason });
  }

  return cards;
}

function parsePairedWith(html) {
  let section = sliceBetween(html, 'id="synergy-comps"', 'id="first-skill"');
  if (!section) section = sliceBetween(html, 'id="synergy-comps"', 'id="skills"');

  const groups = [...section.matchAll(/id="combo-group-(\d+)"/g)];
  const rows = [];

  groups.forEach((group, groupIndex) => {
    const teamSize = Number(group[1]);
    const nextStart = groups[groupIndex + 1]?.index ?? section.length;
    const groupChunk = section.slice(group.index, nextStart);

    for (const row of groupChunk.split('<div class="bg-slate-50').slice(1)) {
      const heroes = [
        ...row.matchAll(
          /<a\b[^>]*href="\/hok\/en\/heroes\/([^"#?]+)"[^>]*>[\s\S]*?<img[^>]+alt="([^"]*)"/g,
        ),
      ]
        .map((match) => ({ slug: match[1], name: cleanText(match[2]) }))
        .filter((hero) => hero.name);

      const rateMatch = row.match(
        /<span class="[^"]*tabular-nums[^"]*">\s*([\d.]+)%\s*<\/span>/,
      );

      if (heroes.length === 0 || !rateMatch) continue;
      rows.push({
        teamSize,
        heroes,
        rate: Number(rateMatch[1]),
        rateText: `${rateMatch[1]}%`,
      });
    }
  });

  return rows;
}

function parseEquipment(html) {
  const section = sliceBetween(html, 'id="item-builds"', 'id="strategy"');

  const builds = section
    .split('<div class="@container rounded-2xl border')
    .slice(1)
    .map((chunk) => {
      const header = chunk.match(
        /<span class="text-base font-black text-slate-800">([\s\S]*?)<\/span>\s*<span class="text-sm font-bold text-brand-700">([\s\S]*?)<\/span>/,
      );

      const items = [];
      const summonerSpells = [];
      const arcana = [];

      for (const liMatch of chunk.matchAll(/<li\b[\s\S]*?<\/li>/g)) {
        const li = liMatch[0];
        const nameMatch = li.match(
          /<span class="[^"]*min-w-0[^"]*">([\s\S]*?)<\/span>/,
        );
        const name = nameMatch ? cleanText(nameMatch[1]) : '';

        if (li.includes('/images/items/')) {
          const image = li.match(/src="([^"]*\/images\/items\/(\d+)\.webp)"/);
          if (image) {
            items.push({ name, itemId: image[2], image: image[1] });
          }
        } else if (li.includes('/images/summoners/')) {
          const image = li.match(
            /src="([^"]*\/images\/summoners\/(\d+)\.webp)"/,
          );
          if (image) {
            summonerSpells.push({
              name,
              spellId: image[2],
              image: image[1],
            });
          }
        } else if (li.includes('/images/arcana/')) {
          const image = li.match(/src="([^"]*\/images\/arcana\/(\d+)\.webp)"/);
          const count = li.match(/tabular-nums">\s*(\d+)\s*<\/span>/);
          if (image) {
            arcana.push({
              name,
              arcanaId: image[2],
              count: count ? Number(count[1]) : 0,
              image: image[1],
            });
          }
        }
      }

      const condition = chunk.match(
        /<p class="flex items-start gap-1\.5[^"]*">([\s\S]*?)<\/p>/,
      );
      const notes = chunk.match(/<p class="mt-1\.5[^"]*">([\s\S]*?)<\/p>/);

      return {
        name: header ? cleanText(header[1]) : '',
        title: header ? cleanText(header[2]) : '',
        items,
        summonerSpells,
        arcana,
        condition: condition ? cleanText(condition[1]) : '',
        notes: notes ? cleanText(notes[1]) : '',
      };
    })
    .filter((build) => build.items.length > 0 || build.arcana.length > 0);

  const firstBuild = builds[0];

  return {
    builds,
    recommendedItems: firstBuild ? firstBuild.items : [],
    recommendedArcana: firstBuild ? firstBuild.arcana : [],
    summonerSpells: uniqueBy(
      builds.flatMap((build) => build.summonerSpells),
      (spell) => spell.spellId || spell.name,
    ),
  };
}

function parseStrategy(html) {
  const section = sliceBetween(html, 'id="strategy"', 'id="counters"');
  const playstyle = extractParagraphAfterLabel(section, 'Playstyle');
  const bestForMatch = section.match(
    /<span class="font-bold">Best for:\s*<\/span>([\s\S]*?)<\/p>/,
  );

  return {
    playstyle,
    bestFor: bestForMatch ? cleanText(bestForMatch[1]) : '',
    tips: {
      earlyGame: extractParagraphAfterLabel(section, 'Early Game Strategy'),
      midGame: extractParagraphAfterLabel(section, 'Mid Game Strategy'),
      lateGame: extractParagraphAfterLabel(section, 'Late Game Strategy'),
      teamfight: extractParagraphAfterLabel(section, 'Teamfight Strategy'),
    },
    strengths: extractListAfterLabel(section, 'Strengths'),
    weaknesses: extractListAfterLabel(section, 'Weaknesses'),
  };
}

function parseDetailPage(raw) {
  const html = renderedHtml(raw);

  if (isNotFoundPage(html)) {
    throw new Error('detail page returned the site 404 shell');
  }

  const title = cleanText(
    (html.match(/<title>([\s\S]*?)<\/title>/i) ?? [])[1] ?? '',
  );
  const metaDescription = cleanText(
    (html.match(
      /<meta\s+name="description"\s+content="([^"]*)"/i,
    ) ?? [])[1] ?? '',
  );

  const countersSection = sliceBetween(
    html,
    'id="counters"',
    'id="synergy-comps"',
  );

  const counteredBy = parseHeroReasonCards(
    sliceBetween(countersSection, '>Countered By<', '>Best Synergy<'),
  );

  const synergies = parseHeroReasonCards(
    sliceBetween(
      countersSection,
      '>Best Synergy<',
      '</div></div></div><p class="mt-4',
    ),
  );

  const frequentlyPairedWith = parsePairedWith(html);
  const equipment = parseEquipment(html);
  const strategy = parseStrategy(html);
  const description = strategy.playstyle || metaDescription;

  return {
    title,
    description,
    playstyle: strategy.playstyle,
    bestFor: strategy.bestFor,
    tips: strategy.tips,
    strengths: strategy.strengths,
    weaknesses: strategy.weaknesses,
    counteredBy,
    synergies,
    frequentlyPairedWith,
    equipment,
  };
}

/* ------------------------------------------------------------------ */
/* Network                                                             */
/* ------------------------------------------------------------------ */

async function fetchPage(url) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': USER_AGENT,
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,' +
            'image/avif,image/webp,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.9',
          referer: `${BASE_URL}`,
          'cache-control': 'no-cache',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      if (html.length < 2_000) {
        throw new Error(`unexpectedly small response (${html.length} bytes)`);
      }

      return html;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await sleep(500 * attempt + Math.floor(Math.random() * 250));
      }
    }
  }

  throw new Error(`failed to fetch ${url}: ${lastError?.message ?? lastError}`);
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
      await sleep(REQUEST_DELAY_MS + Math.floor(Math.random() * 150));
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

/* ------------------------------------------------------------------ */
/* Hero index + record building                                        */
/* ------------------------------------------------------------------ */

function slugify(name) {
  return String(name)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['\u2018\u2019`]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildHeroIndex(heroes) {
  const bySourceSlug = new Map();
  const byId = new Map();

  for (const hero of heroes) {
    byId.set(hero.id, hero);
    if (hero.sourceSlug) bySourceSlug.set(hero.sourceSlug, hero);
  }

  return function resolveHero(slug, name) {
    const direct = bySourceSlug.get(slug) ?? byId.get(slug);
    if (direct) {
      return { id: direct.id, name: direct.name, slug: direct.sourceSlug };
    }

    const id = slugify(name || slug);
    return { id, name: name || id, slug };
  };
}

function emptyDetail() {
  return {
    title: '',
    description: '',
    playstyle: '',
    bestFor: '',
    tips: {
      earlyGame: '',
      midGame: '',
      lateGame: '',
      teamfight: '',
    },
    strengths: [],
    weaknesses: [],
    counteredBy: [],
    synergies: [],
    frequentlyPairedWith: [],
    equipment: {
      builds: [],
      recommendedItems: [],
      recommendedArcana: [],
      summonerSpells: [],
    },
  };
}

function makeRecord(hero, { detailUrl, status, error, detail, warnings }) {
  return {
    ...hero,
    detailUrl,
    crawlStatus: status,
    error: error ?? null,
    warnings,
    crawledAt: new Date().toISOString(),
    ...detail,
  };
}

function buildDetailRecord(hero, resolveHero, parsed) {
  const counteredBy = parsed.counteredBy.map((entry) => ({
    ...resolveHero(entry.slug, entry.name),
    reason: entry.reason,
  }));

  const synergies = parsed.synergies.map((entry) => ({
    ...resolveHero(entry.slug, entry.name),
    reason: entry.reason,
  }));

  const frequentlyPairedWith = parsed.frequentlyPairedWith.map((row) => {
    const heroes = row.heroes.map((entry) =>
      resolveHero(entry.slug, entry.name),
    );
    return {
      teamSize: row.teamSize,
      rate: row.rate,
      rateText: row.rateText,
      heroes,
      heroIds: heroes.map((entry) => entry.id),
      heroNames: heroes.map((entry) => entry.name),
    };
  });

  return {
    ...parsed,
    counteredBy,
    synergies,
    frequentlyPairedWith,
  };
}

async function crawlHero(hero, resolveHero) {
  const candidates = [
    ...new Set([hero.sourceSlug, hero.slug, hero.id].filter(Boolean)),
  ];
  const fetchErrors = [];
  let html = '';
  let detailUrl = `${BASE_URL}/${candidates[0]}`;

  for (const candidate of candidates) {
    detailUrl = `${BASE_URL}/${candidate}`;
    try {
      html = await fetchPage(detailUrl);
      break;
    } catch (error) {
      fetchErrors.push(`${candidate}: ${error.message}`);
    }
  }

  if (!html) {
    return makeRecord(hero, {
      detailUrl,
      status: 'failed',
      error: fetchErrors.join(' | ') || 'no page could be fetched',
      detail: emptyDetail(),
      warnings: ['fetch failed; empty fallback applied'],
    });
  }

  try {
    const parsed = parseDetailPage(html);
    const statusWarnings = [];

    if (!parsed.description) statusWarnings.push('missing description');
    if (parsed.counteredBy.length === 0) {
      statusWarnings.push('empty counteredBy');
    }
    if (parsed.synergies.length === 0) {
      statusWarnings.push('empty synergies');
    }
    if (parsed.frequentlyPairedWith.length === 0) {
      statusWarnings.push('empty frequentlyPairedWith');
    }
    if (parsed.equipment.builds.length === 0) {
      statusWarnings.push('empty equipment');
    }

    const detail = buildDetailRecord(hero, resolveHero, parsed);
    const status = statusWarnings.length === 0 ? 'ok' : 'partial';

    return makeRecord(hero, {
      detailUrl,
      status,
      error: null,
      detail,
      warnings: statusWarnings,
    });
  } catch (error) {
    return makeRecord(hero, {
      detailUrl,
      status: 'failed',
      error: `parse failed: ${error.message}`,
      detail: emptyDetail(),
      warnings: ['parse failed; empty fallback applied'],
    });
  }
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  const rawList = await fs.readFile(HEROES_FILE, 'utf8');
  const heroes = JSON.parse(rawList);

  if (!Array.isArray(heroes) || heroes.length === 0) {
    throw new Error(`No heroes found in ${path.relative(ROOT_DIR, HEROES_FILE)}`);
  }

  const selected = LIMIT ? heroes.slice(0, LIMIT) : heroes;
  const resolveHero = buildHeroIndex(heroes);

  console.log(
    `Loaded ${heroes.length} heroes from ${path.relative(ROOT_DIR, HEROES_FILE)}`,
  );
  console.log(
    `Crawling ${selected.length} detail page(s) — concurrency ${CONCURRENCY}, ` +
      `delay ${REQUEST_DELAY_MS}ms, retries ${MAX_ATTEMPTS}`,
  );

  let completed = 0;

  const records = await mapWithConcurrency(
    selected,
    CONCURRENCY,
    async (hero) => {
      const record = await crawlHero(hero, resolveHero);
      completed += 1;

      const tag =
        record.crawlStatus === 'ok'
          ? 'OK  '
          : record.crawlStatus === 'partial'
            ? 'WARN'
            : 'FAIL';
      const name = String(hero.name ?? hero.id).padEnd(22);
      console.log(
        `  [${String(completed).padStart(3)}/${selected.length}] ${tag} ${name} ` +
          `counters=${record.counteredBy.length} ` +
          `synergies=${record.synergies.length} ` +
          `paired=${record.frequentlyPairedWith.length} ` +
          `builds=${record.equipment.builds.length}`,
      );

      if (record.error) {
        console.log(`         ${record.error}`);
      }

      return record;
    },
  );

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    OUTPUT_PATH,
    `${JSON.stringify(records, null, 2)}\n`,
    'utf8',
  );

  const ok = records.filter((record) => record.crawlStatus === 'ok').length;
  const partial = records.filter(
    (record) => record.crawlStatus === 'partial',
  ).length;
  const failed = records.filter(
    (record) => record.crawlStatus === 'failed',
  ).length;

  const totalCounters = records.reduce(
    (sum, record) => sum + record.counteredBy.length,
    0,
  );
  const totalSynergies = records.reduce(
    (sum, record) => sum + record.synergies.length,
    0,
  );
  const totalPaired = records.reduce(
    (sum, record) => sum + record.frequentlyPairedWith.length,
    0,
  );
  const totalBuilds = records.reduce(
    (sum, record) => sum + record.equipment.builds.length,
    0,
  );
  const successful = ok + partial;

  console.log('\n--- Phase 2 Summary ---');
  console.log(`Heroes crawled     : ${records.length}`);
  console.log(`Succeeded          : ${successful}`);
  console.log(`  - complete       : ${ok}`);
  console.log(`  - partial        : ${partial}`);
  console.log(`Failed             : ${failed}`);
  console.log(
    `Success rate       : ${((successful / records.length) * 100).toFixed(1)}%`,
  );
  console.log(`Counter entries    : ${totalCounters}`);
  console.log(`Synergy entries    : ${totalSynergies}`);
  console.log(`Paired-with rows   : ${totalPaired}`);
  console.log(`Builds parsed      : ${totalBuilds}`);
  console.log(`Output             : ${path.relative(ROOT_DIR, OUTPUT_PATH)}`);

  if (partial > 0) {
    console.log('\nPartial heroes:');
    for (const record of records.filter(
      (item) => item.crawlStatus === 'partial',
    )) {
      console.log(`  - ${record.name} (${record.id}): ${record.warnings.join(', ')}`);
    }
  }

  if (failed > 0) {
    console.log('\nFailed heroes:');
    for (const record of records.filter(
      (item) => item.crawlStatus === 'failed',
    )) {
      console.log(`  - ${record.name} (${record.id}): ${record.error}`);
    }
  }

  if (successful === 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`\nPhase 2 failed: ${error.stack ?? error.message}`);
  process.exitCode = 1;
});
