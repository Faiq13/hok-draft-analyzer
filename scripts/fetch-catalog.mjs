#!/usr/bin/env node
/**
 * Phase 1 — Honor of Kings hero catalog extraction (Puppeteer, DOM only).
 *
 * The scraper opens the catalog in headless Chrome, waits for the hero grid,
 * scrolls through it, and reads the rendered cards plus the page's own visual
 * Role/Lane filters. No Next.js chunks, flight data, or detail pages are used.
 *
 * Outputs:
 *   - scripts/data/heroes-list.json
 *   - public/heroes/<slug>.webp (or .png when that is what the source serves)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const PAGE_URL = 'https://hub-game.com/hok/en/heroes';
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, '..');
const DATA_DIR = path.join(SCRIPT_DIR, 'data');
const DATA_FILE = path.join(DATA_DIR, 'heroes-list.json');
const HERO_DIR = path.join(ROOT_DIR, 'public', 'heroes');

const EXPECTED_MIN_HEROES = 120;
const DOWNLOAD_CONCURRENCY = 8;
const REQUIRED_HEROES = ['mayene', 'zilong', 'arke', 'aoyin'];
const LANES = ['Clash', 'Jungle', 'Mid', 'Farm', 'Roam'];
const ROLES = ['Fighter', 'Tank', 'Mage', 'Assassin', 'Marksman', 'Support'];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function slugify(name) {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['\u2018\u2019`]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function detectImageExtension(buffer) {
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer.subarray(1, 4).toString('ascii') === 'PNG'
  ) {
    return 'png';
  }
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return 'jpg';
  }
  return null;
}

async function fetchWithRetry(url, { headers = {}, attempts = 4, label = url } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/126.0 Safari/537.36',
          ...headers,
        },
        redirect: 'follow',
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(300 * attempt);
      }
    }
  }
  throw new Error(`Failed to fetch ${label}: ${lastError?.message ?? lastError}`);
}

async function autoScroll(page) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);

  let lastHeight = 0;
  for (let step = 0; step < 200; step += 1) {
    const state = await page.evaluate(() => ({
      y: window.scrollY,
      height: Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
      ),
      viewport: window.innerHeight,
    }));

    const atBottom = state.y + state.viewport >= state.height - 8;
    if (atBottom && state.height === lastHeight) break;

    lastHeight = state.height;
    await page.evaluate(() => window.scrollBy(0, 320));
    await sleep(140);
  }

  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' }),
  );
  await sleep(1200);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  await sleep(400);
}

async function readVisibleCards(page) {
  return page.evaluate(() => {
    const anchors = [...document.querySelectorAll('a[href^="/hok/en/heroes/"]')];

    return anchors
      .filter((anchor) => anchor.querySelector('img[alt]'))
      .map((anchor) => {
        const image = anchor.querySelector('img[alt]');
        const href = anchor.getAttribute('href') ?? '';
        const sourceSlug = href.split('/').filter(Boolean).pop() ?? '';
        const rawSource = image.getAttribute('src') || image.currentSrc || image.src;
        const avatarUrl = new URL(rawSource, window.location.origin).href;
        const archetype =
          anchor.querySelector('span.mt-auto')?.textContent?.trim() ?? '';
        const tier =
          anchor
            .querySelector('div.absolute.top-0.right-0')
            ?.textContent?.trim() ?? '';

        return {
          name: image.alt.trim(),
          sourceSlug,
          sourceId: avatarUrl.match(/\/heroes\/(\d+)\./)?.[1] ?? '',
          avatarUrl,
          archetype,
          tier,
        };
      });
  });
}

async function readVisibleSlugs(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('a[href^="/hok/en/heroes/"]')]
      .filter((anchor) => anchor.querySelector('img[alt]'))
      .map((anchor) => (anchor.getAttribute('href') ?? '').split('/').filter(Boolean).pop())
      .filter(Boolean),
  );
}

async function selectFilterOption(page, filterTitle, optionLabel) {
  const openButton = `button[title="${filterTitle}"]`;

  await page.evaluate((selector) => {
    const button = document.querySelector(selector);
    if (!button) throw new Error(`Filter button not found: ${selector}`);
    button.click();
  }, openButton);

  await page.waitForFunction(
    (label) =>
      [...document.querySelectorAll('ul[role="listbox"] li[role="option"]')].some(
        (option) => option.textContent?.trim() === label,
      ),
    { timeout: 10000 },
    optionLabel,
  );

  await page.evaluate((label) => {
    const option = [...document.querySelectorAll('ul[role="listbox"] li[role="option"]')].find(
      (item) => item.textContent?.trim() === label,
    );
    if (!option) throw new Error(`Filter option not found: ${label}`);
    option.click();
  }, optionLabel);

  await page.waitForFunction(
    ({ title, label }) => {
      const button = document.querySelector(`button[title="${title}"]`);
      return button?.getAttribute('aria-label') === `${title}: ${label}`;
    },
    { timeout: 10000 },
    { title: filterTitle, label: optionLabel },
  );

  await sleep(450);
}

async function collectLaneMap(page) {
  const lanesBySlug = new Map();

  for (const lane of LANES) {
    await selectFilterOption(page, 'Lane', lane);
    const slugs = await readVisibleSlugs(page);
    if (slugs.length === 0) {
      throw new Error(`Lane filter "${lane}" returned no heroes.`);
    }
    for (const slug of slugs) lanesBySlug.set(slug, lane);
    console.log(`  [LANE] ${lane.padEnd(6)} -> ${slugs.length} heroes`);
  }

  await selectFilterOption(page, 'Lane', 'All lanes');
  return lanesBySlug;
}

async function collectRoleMap(page) {
  const rolesBySlug = new Map();

  for (const role of ROLES) {
    await selectFilterOption(page, 'Role', role);
    const slugs = await readVisibleSlugs(page);
    if (slugs.length === 0) {
      throw new Error(`Role filter "${role}" returned no heroes.`);
    }
    for (const slug of slugs) {
      const current = rolesBySlug.get(slug) ?? [];
      if (!current.includes(role)) current.push(role);
      rolesBySlug.set(slug, current);
    }
    console.log(`  [ROLE] ${role.padEnd(8)} -> ${slugs.length} heroes`);
  }

  await selectFilterOption(page, 'Role', 'All roles');
  return rolesBySlug;
}

async function downloadAvatar(hero) {
  const response = await fetchWithRetry(hero.avatarUrl, {
    headers: {
      accept: 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8',
      referer: PAGE_URL,
    },
    label: `${hero.name} avatar`,
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 512) {
    throw new Error(`avatar is only ${buffer.length} bytes`);
  }

  const extension = detectImageExtension(buffer);
  if (!extension) {
    throw new Error('avatar is not a recognised image format');
  }

  const filename = `${hero.id}.${extension}`;
  const destination = path.join(HERO_DIR, filename);
  const temporary = `${destination}.tmp`;

  await fs.writeFile(temporary, buffer);
  await fs.rename(temporary, destination);

  return {
    filename,
    localAvatar: `/heroes/${filename}`,
    avatarBytes: buffer.length,
  };
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function main() {
  console.log(`Launching headless browser: ${PAGE_URL}`);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    await page.setViewport({ width: 1440, height: 1000 });

    await page.goto(PAGE_URL, { waitUntil: 'networkidle2', timeout: 90000 });
    await page.waitForFunction(
      (minimum) =>
        document.querySelectorAll('a[href^="/hok/en/heroes/"] img[alt]').length >= minimum,
      { timeout: 45000 },
      EXPECTED_MIN_HEROES,
    );
    console.log('Hero grid rendered. Scrolling through the catalog...');
    await autoScroll(page);

    const cards = await readVisibleCards(page);
    if (cards.length < EXPECTED_MIN_HEROES) {
      throw new Error(
        `Only ${cards.length} hero cards found; expected at least ${EXPECTED_MIN_HEROES}.`,
      );
    }

    const uniqueNames = new Set(cards.map((card) => card.name));
    if (uniqueNames.size !== cards.length) {
      throw new Error('Duplicate hero names found in the rendered grid.');
    }
    console.log(`Extracted ${cards.length} hero cards from the DOM.`);

    console.log('Reading Lane filter results from the page...');
    const lanesBySlug = await collectLaneMap(page);

    console.log('Reading Role filter results from the page...');
    const rolesBySlug = await collectRoleMap(page);

    const heroes = cards.map((card) => {
      const id = slugify(card.name);
      if (!id) throw new Error(`Could not derive a slug for ${card.name}.`);

      const roles = rolesBySlug.get(card.sourceSlug) ?? [];
      const lane = lanesBySlug.get(card.sourceSlug);
      if (roles.length === 0) {
        throw new Error(`No role found for ${card.name} (${card.sourceSlug}).`);
      }
      if (!lane) {
        throw new Error(`No lane found for ${card.name} (${card.sourceSlug}).`);
      }

      return {
        id,
        slug: id,
        name: card.name,
        sourceSlug: card.sourceSlug,
        sourceId: card.sourceId,
        role: roles[0],
        roles,
        lane,
        archetype: card.archetype,
        tier: card.tier,
        avatarUrl: card.avatarUrl,
        localAvatar: `/heroes/${id}.webp`,
      };
    });

    const duplicateSlugs = heroes
      .map((hero) => hero.id)
      .filter((id, index, all) => all.indexOf(id) !== index);
    if (duplicateSlugs.length > 0) {
      throw new Error(`Duplicate hero slugs: ${[...new Set(duplicateSlugs)].join(', ')}`);
    }

    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(HERO_DIR, { recursive: true });

    console.log(`Downloading ${heroes.length} avatars into public/heroes/ ...`);
    const downloads = await mapWithConcurrency(
      heroes,
      DOWNLOAD_CONCURRENCY,
      async (hero) => {
        try {
          const result = await downloadAvatar(hero);
          console.log(
            `  [OK] ${hero.name.padEnd(20)} -> ${result.filename} ` +
              `(${result.avatarBytes} bytes)`,
          );
          return { ok: true, ...result };
        } catch (error) {
          console.error(`  [FAIL] ${hero.name}: ${error.message}`);
          return { ok: false, error: error.message };
        }
      },
    );

    const finalHeroes = heroes.map((hero, index) => {
      const download = downloads[index];
      return {
        ...hero,
        localAvatar: download.ok ? download.localAvatar : null,
        avatarBytes: download.ok ? download.avatarBytes : 0,
        downloaded: download.ok,
      };
    });

    await fs.writeFile(DATA_FILE, `${JSON.stringify(finalHeroes, null, 2)}\n`, 'utf8');

    const failures = finalHeroes.filter((hero) => !hero.downloaded);
    console.log('\n--- Summary ---');
    console.log(`Catalog heroes : ${finalHeroes.length}`);
    console.log(`Avatars saved  : ${finalHeroes.length - failures.length}`);
    console.log(`JSON           : ${path.relative(ROOT_DIR, DATA_FILE)}`);
    console.log(`Avatar folder  : ${path.relative(ROOT_DIR, HERO_DIR)}`);

    console.log('\nPreviously missing/typo heroes:');
    for (const id of REQUIRED_HEROES) {
      const hero = finalHeroes.find((item) => item.id === id);
      if (!hero?.downloaded) {
        console.log(`  [MISSING] ${id}`);
        continue;
      }
      const filePath = path.join(HERO_DIR, path.basename(hero.localAvatar));
      const stat = await fs.stat(filePath);
      const bytes = await fs.readFile(filePath);
      const extension = detectImageExtension(bytes);
      if (!extension) {
        throw new Error(`Downloaded avatar for ${hero.name} is not a valid image.`);
      }
      console.log(
        `  [CONFIRMED] ${hero.name.padEnd(8)} -> ${hero.localAvatar} ` +
          `(${stat.size} bytes, lane ${hero.lane}, role ${hero.roles.join('/')})`,
      );
    }

    if (failures.length > 0) {
      throw new Error(
        `${failures.length} avatar(s) failed to download: ` +
          failures.map((hero) => hero.name).join(', '),
      );
    }

    console.log('\nPhase 1 complete.');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(`\nPhase 1 failed: ${error.message}`);
  process.exitCode = 1;
});
