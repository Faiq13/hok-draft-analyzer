import fs from 'fs';
import path from 'path';

const OUTPUT_TS_PATH = path.join(process.cwd(), 'src/data/hokHeroes.ts');
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'heroes');

if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

const HERO_LIST = [
  { id: 'alessio', name: 'Alessio', title: 'No. 1 Spitfire', role: 'Farm', heroRole: 'Marksman' },
  { id: 'agudo', name: 'Agudo', title: 'Mountain Guardian', role: 'Jungle', heroRole: 'Tank' },
  { id: 'aoyin', name: 'Ao\'yin', title: 'Dragon\'s Blessing', role: 'Farm', heroRole: 'Marksman' },
  { id: 'allain', name: 'Allain', title: 'Heartfelt Blade', role: 'Clash', heroRole: 'Warrior' },
  { id: 'angela', name: 'Angela', title: 'Spirited Wizardry', role: 'Mid', heroRole: 'Mage' },
  { id: 'annette', name: 'Annette', title: 'Wind Whisperer', role: 'Roam', heroRole: 'Support' },
  { id: 'arike', name: 'Arke', title: 'Shadow Blade', role: 'Jungle', heroRole: 'Assassin' },
  { id: 'arli', name: 'Arli', title: 'Wandering Troupe', role: 'Farm', heroRole: 'Marksman' },
  { id: 'arthur', name: 'Arthur', title: 'The Paladin', role: 'Clash', heroRole: 'Warrior' },
  { id: 'ata', name: 'Ata', title: 'Ship\'s Cook', role: 'Clash', heroRole: 'Tank' },
  { id: 'athena', name: 'Athena', title: 'Goddess of War', role: 'Jungle', heroRole: 'Warrior' },
  { id: 'augran', name: 'Augran', title: 'Pathfinder', role: 'Jungle', heroRole: 'Assassin' },
  { id: 'bai-qi', name: 'Bai Qi', title: 'The Reaper', role: 'Clash', heroRole: 'Tank' },
  { id: 'biron', name: 'Biron', title: 'Storm Lance', role: 'Clash', heroRole: 'Warrior' },
  { id: 'butterfly', name: 'Butterfly', title: 'Death\'s Whisper', role: 'Jungle', heroRole: 'Assassin' },
  { id: 'cai-yan', name: 'Cai Yan', title: 'Healing Melody', role: 'Roam', heroRole: 'Support' },
  { id: 'charlotte', name: 'Charlotte', title: 'Rose Blade', role: 'Clash', heroRole: 'Warrior' },
  { id: 'consort-yu', name: 'Consort Yu', title: 'Peerless Beauty', role: 'Farm', heroRole: 'Marksman' },
  { id: 'da-qiao', name: 'Da Qiao', title: 'Flower of the East', role: 'Roam', heroRole: 'Support' },
  { id: 'daji', name: 'Daji', title: 'Enchanting Fox', role: 'Mid', heroRole: 'Mage' },
  { id: 'dharma', name: 'Dharma', title: 'Monk of Strength', role: 'Clash', heroRole: 'Warrior' },
  { id: 'di-renjie', name: 'Di Renjie', title: 'Great Judge', role: 'Farm', heroRole: 'Marksman' },
  { id: 'dian-wei', name: 'Dian Wei', title: 'Fierce Berserker', role: 'Jungle', heroRole: 'Warrior' },
  { id: 'diaochan', name: 'Diaochan', title: 'Dance of the Moon', role: 'Mid', heroRole: 'Mage' },
  { id: 'dolia', name: 'Dolia', title: 'Mermaid Song', role: 'Roam', heroRole: 'Support' },
  { id: 'donghuang', name: 'Donghuang', title: 'Eastern Emperor', role: 'Roam', heroRole: 'Tank' },
  { id: 'erin', name: 'Erin', title: 'Elven Archer', role: 'Farm', heroRole: 'Marksman' },
  { id: 'fang', name: 'Fang', title: 'Detective Paws', role: 'Farm', heroRole: 'Marksman' },
  { id: 'florentino', name: 'Florentino', title: 'Romantic Blade', role: 'Clash', heroRole: 'Warrior' },
  { id: 'fuzi', name: 'Fuzi', title: 'Master Sage', role: 'Clash', heroRole: 'Warrior' },
  { id: 'gan-mo', name: 'Gan & Mo', title: 'Twin Swords', role: 'Mid', heroRole: 'Mage' },
  { id: 'garo', name: 'Garo', title: 'Purest Sky', role: 'Farm', heroRole: 'Marksman' },
  { id: 'guan-yu', name: 'Guan Yu', title: 'Saint of Warriors', role: 'Clash', heroRole: 'Warrior' },
  { id: 'guiguzi', name: 'Guiguzi', title: 'Mystic Master', role: 'Roam', heroRole: 'Support' },
  { id: 'han-xin', name: 'Han Xin', title: 'The Spear of Chu', role: 'Jungle', heroRole: 'Assassin' },
  { id: 'heino', name: 'Heino', title: 'Time Mage', role: 'Mid', heroRole: 'Mage' },
  { id: 'hou-yi', name: 'Hou Yi', title: 'Sun Shooter', role: 'Farm', heroRole: 'Marksman' },
  { id: 'huang-zhong', name: 'Huang Zhong', title: 'Master Gunner', role: 'Farm', heroRole: 'Marksman' },
  { id: 'jing', name: 'Jing', title: 'Shadow Dancer', role: 'Jungle', heroRole: 'Assassin' },
  { id: 'kaizer', name: 'Kaizer', title: 'Blade of Ruin', role: 'Clash', heroRole: 'Warrior' },
  { id: 'kongming', name: 'Kongming', title: 'Sleeping Dragon', role: 'Mid', heroRole: 'Mage' },
  { id: 'kui', name: 'Kui', title: 'Demon Terror', role: 'Roam', heroRole: 'Tank' },
  { id: 'lady-sun', name: 'Lady Sun', title: 'Fiery Shot', role: 'Farm', heroRole: 'Marksman' },
  { id: 'lady-zhen', name: 'Lady Zhen', title: 'Ice Princess', role: 'Mid', heroRole: 'Mage' },
  { id: 'lam', name: 'Lam', title: 'Shark Hunter', role: 'Jungle', heroRole: 'Assassin' },
  { id: 'li-bai', name: 'Li Bai', title: 'Sword Immortal', role: 'Jungle', heroRole: 'Assassin' },
  { id: 'li-xin', name: 'Li Xin', title: 'Dawn & Dusk', role: 'Clash', heroRole: 'Warrior' },
  { id: 'lian-po', name: 'Lian Po', title: 'Iron Wall', role: 'Clash', heroRole: 'Tank' },
  { id: 'liang', name: 'Liang', title: 'Scholar of Wisdom', role: 'Mid', heroRole: 'Mage' },
  { id: 'liu-bang', name: 'Liu Bang', title: 'Lord of Han', role: 'Clash', heroRole: 'Tank' },
  { id: 'liu-bei', name: 'Liu Bei', title: 'Righteous Emperor', role: 'Jungle', heroRole: 'Warrior' },
  { id: 'liu-shan', name: 'Liu Shan', title: 'Mecha Genius', role: 'Roam', heroRole: 'Tank' },
  { id: 'lu-bu', name: 'Lu Bu', title: 'Warlord', role: 'Clash', heroRole: 'Warrior' },
  { id: 'luban-no-7', name: 'Luban No.7', title: 'Mechanical Wonder', role: 'Farm', heroRole: 'Marksman' },
  { id: 'luna', name: 'Luna', title: 'Moonlight Blade', role: 'Jungle', heroRole: 'Assassin' },
  { id: 'mai-shiranui', name: 'Mai Shiranui', title: 'Flame Dancer', role: 'Mid', heroRole: 'Mage' },
  { id: 'marco-polo', name: 'Marco Polo', title: 'Exotic Explorer', role: 'Farm', heroRole: 'Marksman' },
  { id: 'mayene', name: 'Mayene', title: 'Martial Prodigy', role: 'Clash', heroRole: 'Warrior' },
  { id: 'mi-yue', name: 'Mi Yue', title: 'Queen of Hell', role: 'Clash', heroRole: 'Mage' },
  { id: 'milady', name: 'Milady', title: 'Mechanoid Empress', role: 'Mid', heroRole: 'Mage' },
  { id: 'mozi', name: 'Mozi', title: 'Master of Mechanisms', role: 'Mid', heroRole: 'Mage' },
  { id: 'mulan', name: 'Mulan', title: 'Unyielding Heroine', role: 'Clash', heroRole: 'Warrior' },
  { id: 'musashi', name: 'Musashi', title: 'Swordmaster', role: 'Clash', heroRole: 'Warrior' },
  { id: 'nakoruru', name: 'Nakoruru', title: 'Nature\'s Guardian', role: 'Jungle', heroRole: 'Assassin' },
  { id: 'nezha', name: 'Nezha', title: 'Lotus Prince', role: 'Clash', heroRole: 'Warrior' },
  { id: 'nuwa', name: 'Nuwa', title: 'Creator of All', role: 'Mid', heroRole: 'Mage' },
  { id: 'pei', name: 'Pei', title: 'Tiger Fist', role: 'Jungle', heroRole: 'Assassin' },
  { id: 'shangguan', name: 'Shangguan', title: 'Calligraphy Master', role: 'Mid', heroRole: 'Mage' },
  { id: 'shi', name: 'Shi', title: 'Puppet Master', role: 'Mid', heroRole: 'Mage' },
  { id: 'shouyue', name: 'Shouyue', title: 'Sniper', role: 'Farm', heroRole: 'Marksman' },
  { id: 'sima-yi', name: 'Sima Yi', title: 'Silent Reaper', role: 'Jungle', heroRole: 'Assassin' },
  { id: 'sun-bin', name: 'Sun Bin', title: 'Time Oracle', role: 'Roam', heroRole: 'Support' },
  { id: 'sun-ce', name: 'Sun Ce', title: 'Conqueror of the Sea', role: 'Clash', heroRole: 'Tank' },
  { id: 'ukyo-tachibana', name: 'Ukyo Tachibana', title: 'Iai Swordsman', role: 'Jungle', heroRole: 'Assassin' },
  { id: 'wang-zhaojun', name: 'Wang Zhaojun', title: 'Frost Blossom', role: 'Mid', heroRole: 'Mage' },
  { id: 'wukong', name: 'Wukong', title: 'Monkey King', role: 'Jungle', heroRole: 'Assassin' },
  { id: 'wuyan', name: 'Wuyan', title: 'Chief Artisan', role: 'Clash', heroRole: 'Warrior' },
  { id: 'xiang-yu', name: 'Xiang Yu', title: 'Overlord', role: 'Clash', heroRole: 'Tank' },
  { id: 'xiao-qiao', name: 'Xiao Qiao', title: 'Lotus Blossom', role: 'Mid', heroRole: 'Mage' },
  { id: 'xuance', name: 'Xuance', title: 'Wild Chain', role: 'Jungle', heroRole: 'Assassin' },
  { id: 'yang-jian', name: 'Yang Jian', title: 'God of Eyes', role: 'Clash', heroRole: 'Warrior' },
  { id: 'yao', name: 'Yao', title: 'Star Chaser', role: 'Clash', heroRole: 'Warrior' },
  { id: 'yaria', name: 'Yaria', title: 'Deer Spirit', role: 'Roam', heroRole: 'Support' },
  { id: 'ying', name: 'Ying', title: 'Spear Maiden', role: 'Clash', heroRole: 'Warrior' },
  { id: 'yixing', name: 'Yixing', title: 'Go Master', role: 'Mid', heroRole: 'Mage' },
  { id: 'yuhuan', name: 'Yuhuan', title: 'Melodic Grace', role: 'Mid', heroRole: 'Mage' },
  { id: 'zhang-fei', name: 'Zhang Fei', title: 'Beast Roar', role: 'Roam', heroRole: 'Tank' },
  { id: 'zhou-yu', name: 'Zhou Yu', title: 'Master Tactician', role: 'Mid', heroRole: 'Mage' },
  { id: 'zhuangzi', name: 'Zhuangzi', title: 'Dream Weaver', role: 'Roam', heroRole: 'Support' },
  { id: 'zilong', name: 'Zilong', title: 'Dragon Spear', role: 'Jungle', heroRole: 'Assassin' },
  { id: 'ziya', name: 'Ziya', title: 'Prime Minister', role: 'Mid', heroRole: 'Mage' }
];

function main() {
  const heroes = HERO_LIST.map((h, idx) => {
    const localAvatarPath = path.join(PUBLIC_DIR, `${h.id}.png`);
    if (!fs.existsSync(localAvatarPath)) {
      const svgPlaceholder = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#1e293b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="24" font-weight="bold">${h.name}</text></svg>`;
      fs.writeFileSync(localAvatarPath.replace('.png', '.svg'), svgPlaceholder);
    }

    const otherHeroes = HERO_LIST.filter(x => x.id !== h.id);
    const counters = otherHeroes.slice(0, 4).map(x => x.id);
    const counteredBy = otherHeroes.slice(4, 8).map(x => x.id);

    return {
      id: h.id,
      name: h.name,
      title: h.title,
      role: h.role, // Roam | Clash | Mid | Farm | Jungle to match CounterRecommendations & HeroGrid filters perfectly
      lane: h.role,
      avatarUrl: `/heroes/${h.id}.png`,
      difficulty: (idx % 3) + 2,
      tier: idx < 15 ? 'S+' : (idx < 40 ? 'S' : 'A'),
      counters,
      counteredBy,
      skills: [
        { name: `${h.name} Passive`, description: `Core passive ability of ${h.name}.`, type: 'Passive' },
        { name: `${h.name} Skill 1`, description: `Primary tactical active skill.`, type: 'Active' },
        { name: `${h.name} Ultimate`, description: `Ultimate game-changing ability.`, type: 'Ultimate' }
      ]
    };
  });

  let tsContent = `// Auto-generated HoK heroes dataset\n`;
  tsContent += `export interface Hero {\n`;
  tsContent += `  id: string;\n`;
  tsContent += `  name: string;\n`;
  tsContent += `  title: string;\n`;
  tsContent += `  role: 'Roam' | 'Clash' | 'Mid' | 'Farm' | 'Jungle';\n`;
  tsContent += `  lane: string;\n`;
  tsContent += `  avatarUrl: string;\n`;
  tsContent += `  difficulty: number;\n`;
  tsContent += `  tier: string;\n`;
  tsContent += `  counters: string[];\n`;
  tsContent += `  counteredBy: string[];\n`;
  tsContent += `  skills: { name: string; description: string; type: string }[];\n`;
  tsContent += `}\n\n`;

  tsContent += `export const HOK_HEROES: Hero[] = ${JSON.stringify(heroes, null, 2)};\n`;

  fs.writeFileSync(OUTPUT_TS_PATH, tsContent, 'utf-8');
  console.log(`Successfully generated ${heroes.length} heroes with role matching lanes.`);
}

main();
