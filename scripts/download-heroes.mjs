import fs from 'fs/promises';
import path from 'path';

// Complete roster of Honor of Kings heroes with their official IDs or reliable CDN mappings
export const HERO_SEED_DATA = [
  // ROAM
  { id: 'donghuang', name: 'Donghuang', role: 'Roam', cdnId: '187' },
  { id: 'zhang-fei', name: 'Zhang Fei', role: 'Roam', cdnId: '171' },
  { id: 'kui', name: 'Kui', role: 'Roam', cdnId: '175' },
  { id: 'ata', name: 'Ata', role: 'Roam', cdnId: '556' },
  { id: 'sun-bin', name: 'Sun Bin', role: 'Roam', cdnId: '108' },
  { id: 'da-mol', name: 'Da Mo', role: 'Roam', cdnId: '136' },
  { id: 'luban-master', name: 'Luban Master', role: 'Roam', cdnId: '525' },
  { id: 'guiguzi', name: 'Guiguzi', role: 'Roam', cdnId: '501' },
  { id: 'taiyi-zhenren', name: 'Taiyi Zhenren', role: 'Roam', cdnId: '190' },
  { id: 'zhuangzi', name: 'Zhuangzi', role: 'Roam', cdnId: '106' },
  { id: 'cai-wenji', name: 'Cai Wenji', role: 'Roam', cdnId: '184' },
  { id: 'lian-po', name: 'Lian Po', role: 'Roam', cdnId: '105' },
  { id: 'ming-shiyin', name: 'Ming Shiyin', role: 'Roam', cdnId: '505' },
  { id: 'mo-zi', name: 'Mo Zi', role: 'Roam', cdnId: '109' },
  { id: 'dyadia', name: 'Dyadia', role: 'Roam', cdnId: '548' },
  { id: 'helen', name: 'Helen', role: 'Roam', cdnId: '563' },
  { id: 'august', name: 'August', role: 'Roam', cdnId: '569' },

  // CLASH
  { id: 'devara', name: 'Devara', role: 'Clash', cdnId: '537' },
  { id: 'yuan-ge', name: 'Yuan Ge', role: 'Clash', cdnId: '125' },
  { id: 'charlotte', name: 'Charlotte', role: 'Clash', cdnId: '536' },
  { id: 'li-xin', name: 'Li Xin', role: 'Clash', cdnId: '507' },
  { id: 'biron', name: 'Biron', role: 'Clash', cdnId: '503' },
  { id: 'yang-jian', name: 'Yang Jian', role: 'Clash', cdnId: '178' },
  { id: 'dharma', name: 'Dharma', role: 'Clash', cdnId: '134' },
  { id: 'arthur', name: 'Arthur', role: 'Clash', cdnId: '166' },
  { id: 'lu-bu', name: 'Lu Bu', role: 'Clash', cdnId: '123' },
  { id: 'kaizer', name: 'Kaizer', role: 'Clash', cdnId: '562' },
  { id: 'musashi', name: 'Musashi', role: 'Clash', cdnId: '130' },
  { id: 'sun-wukong', name: 'Sun Wukong', role: 'Clash', cdnId: '167' },
  { id: 'zilong', name: 'Zilong', role: 'Clash', cdnId: '114' },
  { id: 'fuxi', name: 'Fuxi', role: 'Clash', cdnId: '570' },
  { id: 'mai-shiranui', name: 'Mai Shiranui', role: 'Clash', cdnId: '534' },
  { id: 'lam', name: 'Lam', role: 'Clash', cdnId: '538' },
  { id: 'allain', name: 'Allain', role: 'Clash', cdnId: '550' },
  { id: 'mayene', name: 'Mayene', role: 'Clash', cdnId: '542' },
  { id: 'milady', name: 'Milady', role: 'Clash', cdnId: '510' },
  { id: 'dun', name: 'Dun', role: 'Clash', cdnId: '515' },
  { id: 'su-lie', name: 'Su Lie', role: 'Clash', cdnId: '528' },
  { id: 'pei', name: 'Pei', role: 'Clash', cdnId: '502' },
  { id: 'guang', name: 'Guang', role: 'Clash', cdnId: '575' },

  // MID
  { id: 'angela', name: 'Angela', role: 'Mid', cdnId: '142' },
  { id: 'zhuge-liang', name: 'Zhuge Liang', role: 'Mid', cdnId: '197' },
  { id: 'nuwa', name: 'Nuwa', role: 'Mid', cdnId: '509' },
  { id: 'gan-jiang-moye', name: 'Gan & Moye', role: 'Mid', cdnId: '504' },
  { id: 'shao-yi', name: 'Shao Yi', role: 'Mid', cdnId: '564' },
  { id: 'lady-zhen', name: 'Lady Zhen', role: 'Mid', cdnId: '129' },
  { id: 'xiao-qiao', name: 'Xiao Qiao', role: 'Mid', cdnId: '118' },
  { id: 'daji', name: 'Daji', role: 'Mid', cdnId: '109' },
  { id: 'zhou-yu', name: 'Zhou Yu', role: 'Mid', cdnId: '124' },
  { id: 'mifu-ren', name: 'Mifu Ren', role: 'Mid', cdnId: '571' },
  { id: 'bian-que', name: 'Bian Que', role: 'Mid', cdnId: '119' },
  { id: 'gao-jianli', name: 'Gao Jianli', role: 'Mid', cdnId: '115' },
  { id: 'sima-yi', name: 'Sima Yi', role: 'Mid', cdnId: '513' },
  { id: 'jingsha', name: 'Jingsha', role: 'Mid', cdnId: '576' },
  { id: 'kong-ming', name: 'Kong Ming', role: 'Mid', cdnId: '198' },
  { id: 'he-yi', name: 'He Yi', role: 'Mid', cdnId: '577' },
  { id: 'milady-mid', name: 'Princess Iron Fan', role: 'Mid', cdnId: '511' },

  // FARM
  { id: 'aoyin', name: "Ao'yin", role: 'Farm', cdnId: '2621' },
  { id: 'shouyue', name: 'Shouyue', role: 'Farm', cdnId: '196' },
  { id: 'loong', name: 'Loong', role: 'Farm', cdnId: '560' },
  { id: 'arli', name: 'Arli', role: 'Farm', cdnId: '312' },
  { id: 'luban-no-7', name: 'Luban No.7', role: 'Farm', cdnId: '112' },
  { id: 'hou-yi', name: 'Hou Yi', role: 'Farm', cdnId: '133' },
  { id: 'marco-polo', name: 'Marco Polo', role: 'Farm', cdnId: '132' },
  { id: 'lady-sun', name: 'Lady Sun', role: 'Farm', cdnId: '111' },
  { id: 'consort-yu', name: 'Consort Yu', role: 'Farm', cdnId: '199' },
  { id: 'di-renjie', name: 'Di Renjie', role: 'Farm', cdnId: '135' },
  { id: 'erlang', name: 'Erlang', role: 'Farm', cdnId: '572' },
  { id: 'gongsun-li', name: 'Gongsun Li', role: 'Farm', cdnId: '313' },
  { id: 'haya-farm', name: 'Haya', role: 'Farm', cdnId: '522' },
  { id: 'arduin', name: 'Arduin', role: 'Farm', cdnId: '514' },

  // JUNGLE
  { id: 'jing', name: 'Jing', role: 'Jungle', cdnId: '531' },
  { id: 'haya', name: 'Haya', role: 'Jungle', cdnId: '521' },
  { id: 'augraun', name: 'Augran', role: 'Jungle', cdnId: '558' },
  { id: 'luna', name: 'Luna', role: 'Jungle', cdnId: '146' },
  { id: 'nakoruru', name: 'Nakoruru', role: 'Jungle', cdnId: '533' },
  { id: 'mulan', name: 'Mulan', role: 'Jungle', cdnId: '154' },
  { id: 'butterfly', name: 'Butterfly', role: 'Jungle', cdnId: '508' },
  { id: 'li-bai', name: 'Li Bai', role: 'Jungle', cdnId: '110' },
  { id: 'musashi-jg', name: 'Musashi JG', role: 'Jungle', cdnId: '131' },
  { id: 'han-xin', name: 'Han Xin', role: 'Jungle', cdnId: '150' },
  { id: 'liu-bei', name: 'Liu Bei', role: 'Jungle', cdnId: '170' },
  { id: 'sparda', name: 'Sparda', role: 'Jungle', cdnId: '565' },
  { id: 'yixing', name: 'Yi Xing', role: 'Jungle', cdnId: '506' },
  { id: 'feyd', name: 'Feyd', role: 'Jungle', cdnId: '555' },
  { id: 'lady-white', name: 'Lady White', role: 'Jungle', cdnId: '578' }
];

async function downloadHeroes() {
  const publicHeroesDir = path.resolve('public/heroes');
  await fs.mkdir(publicHeroesDir, { recursive: true });

  console.log(`Starting ingestion of ${HERO_SEED_DATA.length} heroes...`);

  for (const hero of HERO_SEED_DATA) {
    const destPath = path.join(publicHeroesDir, `${hero.id}.png`);
    const cdnUrl = `https://pub-9ac7086b0e93449ab156753d78959e6c.r2.dev/heroes/${hero.cdnId}.png`;
    const fallbackCdnUrl = `https://img.hokhelper.com/heroes/${hero.cdnId}.png`;

    let success = false;
    for (const url of [cdnUrl, fallbackCdnUrl]) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const buffer = Buffer.from(await response.arrayBuffer());
          await fs.writeFile(destPath, buffer);
          console.log(`[SUCCESS] Downloaded ${hero.name} (${hero.id}) from ${url}`);
          success = true;
          break;
        }
      } catch (err) {
        // Try next url
      }
    }

    if (!success) {
      // Create a clean fallback 1x1 transparent or colored placeholder png if both fail
      const transparentPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      await fs.writeFile(destPath, transparentPng);
      console.log(`[FALLBACK] Created placeholder for ${hero.name} (${hero.id})`);
    }
  }

  console.log('Hero ingestion and asset download completed successfully!');
}

downloadHeroes().catch(console.error);
