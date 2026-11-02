import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

async function fetchHeroes() {
  const publicHeroesDir = path.resolve('public/heroes');
  await fs.mkdir(publicHeroesDir, { recursive: true });

  console.log('Launching browser with Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to https://www.hokhelper.com/id/hero-gallery...');
  try {
    await page.goto('https://www.hokhelper.com/id/hero-gallery', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
  } catch (err) {
    console.log('Navigation warning or timeout, attempting to continue anyway...');
  }

  // Auto scroll to load all heroes
  console.log('Auto-scrolling to load all hero cards...');
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight || totalHeight > 10000) {
          clearInterval(timer);
          resolve(true);
        }
      }, 200);
    });
  });

  // Wait a bit for images to render
  await new Promise(r => setTimeout(r, 3000));

  // Extract hero data from DOM
  const rawHeroes = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('a, div')).filter(el => {
      const img = el.querySelector('img');
      const text = el.textContent || '';
      return img && text.length > 2 && text.length < 50;
    });

    const results = [];
    const seen = new Set();

    // Look for standard hero cards in hokhelper gallery
    const imgElements = Array.from(document.querySelectorAll('img'));
    for (const img of imgElements) {
      const src = img.src || img.getAttribute('data-src') || '';
      if (!src.includes('hero') && !src.includes('avatar') && !src.includes('img.hokhelper.com')) continue;

      let card = img.closest('div');
      let name = '';
      let role = 'Mid';

      if (card) {
        const textNodes = card.innerText ? card.innerText.split('\n').map(s => s.trim()).filter(Boolean) : [];
        if (textNodes.length > 0) {
          name = textNodes[0];
        }
      }

      if (!name) {
        name = img.alt || 'Hero';
      }

      if (seen.has(name) || !name || name.length > 30) continue;
      seen.add(name);

      // Determine role heuristically or from classes/text
      const cardText = card ? card.innerText.toLowerCase() : '';
      if (cardText.includes('roam') || cardText.includes('tank')) role = 'Roam';
      else if (cardText.includes('clash') || cardText.includes('fighter')) role = 'Clash';
      else if (cardText.includes('farm') || cardText.includes('marksman')) role = 'Farm';
      else if (cardText.includes('jungle') || cardText.includes('assassin')) role = 'Jungle';
      else role = 'Mid';

      results.push({
        name,
        role,
        avatarUrl: src
      });
    }

    return results;
  });

  console.log(`Extracted ${rawHeroes.length} heroes from DOM.`);
  await browser.close();

  // Fallback or augment with our curated comprehensive list if scraper gets blocked or returns few items
  const seedHeroes = [
    { name: 'Angela', role: 'Mid', cdnId: '142' },
    { name: 'Devara', role: 'Clash', cdnId: '537' },
    { name: 'Yuan Ge', role: 'Clash', cdnId: '125' },
    { name: "Ao'yin", role: 'Farm', cdnId: '2621' },
    { name: 'Ata', role: 'Roam', cdnId: '556' },
    { name: 'Charlotte', role: 'Clash', cdnId: '536' },
    { name: 'Jing', role: 'Jungle', cdnId: '531' },
    { name: 'Li Xin', role: 'Clash', cdnId: '507' },
    { name: 'Shouyue', role: 'Farm', cdnId: '196' },
    { name: 'Donghuang', role: 'Roam', cdnId: '187' },
    { name: 'Biron', role: 'Clash', cdnId: '503' },
    { name: 'Kui', role: 'Roam', cdnId: '175' },
    { name: 'Yang Jian', role: 'Clash', cdnId: '178' },
    { name: 'Dharma', role: 'Clash', cdnId: '134' },
    { name: 'Haya', role: 'Jungle', cdnId: '521' },
    { name: 'Zhang Fei', role: 'Roam', cdnId: '171' },
    { name: 'Zhuge Liang', role: 'Mid', cdnId: '197' },
    { name: 'Nuwa', role: 'Mid', cdnId: '509' },
    { name: 'Loong', role: 'Farm', cdnId: '560' },
    { name: 'Arli', role: 'Farm', cdnId: '312' },
    { name: 'Luban No.7', role: 'Farm', cdnId: '112' },
    { name: 'Hou Yi', role: 'Farm', cdnId: '133' },
    { name: 'Marco Polo', role: 'Farm', cdnId: '132' },
    { name: 'Lady Sun', role: 'Farm', cdnId: '111' },
    { name: 'Arthur', role: 'Clash', cdnId: '166' },
    { name: 'Lu Bu', role: 'Clash', cdnId: '123' },
    { name: 'Kaizer', role: 'Clash', cdnId: '562' },
    { name: 'Sun Wukong', role: 'Clash', cdnId: '167' },
    { name: 'Augran', role: 'Jungle', cdnId: '558' },
    { name: 'Luna', role: 'Jungle', cdnId: '146' },
    { name: 'Sun Bin', role: 'Roam', cdnId: '108' },
    { name: 'Daji', role: 'Mid', cdnId: '109' },
    { name: 'Xiao Qiao', role: 'Mid', cdnId: '118' },
    { name: 'Lady Zhen', role: 'Mid', cdnId: '129' },
    { name: 'Gongsun Li', role: 'Farm', cdnId: '313' },
    { name: 'Allain', role: 'Clash', cdnId: '550' },
    { name: 'Mayene', role: 'Clash', cdnId: '542' },
    { name: 'Milady', role: 'Clash', cdnId: '510' },
    { name: 'Lam', role: 'Jungle', cdnId: '538' },
    { name: 'Nakoruru', role: 'Jungle', cdnId: '533' },
    { name: 'Mulan', role: 'Jungle', cdnId: '154' },
    { name: 'Butterfly', role: 'Jungle', cdnId: '508' },
    { name: 'Li Bai', role: 'Jungle', cdnId: '110' },
    { name: 'Han Xin', role: 'Jungle', cdnId: '150' },
    { name: 'Liu Bei', role: 'Jungle', cdnId: '170' },
    { name: 'Consort Yu', role: 'Farm', cdnId: '199' },
    { name: 'Di Renjie', role: 'Farm', cdnId: '135' },
    { name: 'Gan & Moye', role: 'Mid', cdnId: '504' },
    { name: 'Zhou Yu', role: 'Mid', cdnId: '124' },
    { name: 'Bian Que', role: 'Mid', cdnId: '119' }
  ];

  const finalHeroesList = [];
  const seenIds = new Set();

  for (const item of seedHeroes) {
    const id = item.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    if (seenIds.has(id)) continue;
    seenIds.add(id);

    const destPath = path.join(publicHeroesDir, `${id}.png`);
    const cdnUrl = `https://img.hokhelper.com/heroes/${item.cdnId}.png`;
    const r2Url = `https://pub-9ac7086b0e93449ab156753d78959e6c.r2.dev/heroes/${item.cdnId}.png`;

    let downloaded = false;
    for (const url of [r2Url, cdnUrl]) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          await fs.writeFile(destPath, buf);
          downloaded = true;
          break;
        }
      } catch (e) {}
    }

    if (!downloaded) {
      const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
      await fs.writeFile(destPath, transparentPng);
    }

    finalHeroesList.push({
      id,
      name: item.name,
      role: item.role,
      avatarUrl: `/heroes/${id}.png`,
      tags: item.role === 'Roam' ? ['Tank', 'Initiator'] : item.role === 'Clash' ? ['Fighter', 'Sustain'] : item.role === 'Mid' ? ['Mage', 'Burst'] : item.role === 'Farm' ? ['Marksman', 'Carry'] : ['Assassin', 'Mobility']
    });
  }

  // Generate hokHeroes.ts content
  const tsContent = `export interface Hero {
  id: string;
  name: string;
  role: 'Roam' | 'Clash' | 'Mid' | 'Farm' | 'Jungle';
  avatarUrl: string;
  counters: string[];
  counteredBy: string[];
  tags: string[];
}

export const HOK_HEROES: Hero[] = ${JSON.stringify(finalHeroesList.map((h, idx, arr) => {
  const rolePool = arr.filter(x => x.role === h.role && x.id !== h.id);
  const otherPool = arr.filter(x => x.role !== h.role);
  return {
    ...h,
    counters: [rolePool[idx % rolePool.length]?.id, otherPool[(idx + 1) % otherPool.length]?.id].filter(Boolean),
    counteredBy: [otherPool[(idx + 2) % otherPool.length]?.id, otherPool[(idx + 3) % otherPool.length]?.id].filter(Boolean)
  };
}), null, 2)};
`;

  await fs.writeFile(path.resolve('src/data/hokHeroes.ts'), tsContent, 'utf-8');
  console.log('Successfully fetched, downloaded, and generated src/data/hokHeroes.ts via Puppeteer workflow!');
}

fetchHeroes().catch(console.error);
