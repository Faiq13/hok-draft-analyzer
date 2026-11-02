// Auto-generated HoK heroes dataset matching hub-game.com schema
export interface Hero {
  id: string;
  name: string;
  role: 'Roam' | 'Clash' | 'Mid' | 'Farm' | 'Jungle';
  avatarUrl: string;
  counters: string[];      // Hero yang di-counter oleh hero ini
  counteredBy: string[];   // Hero yang meng-counter hero ini (cth Ao'yin: ['arli', 'consort-yu'])
  synergies: string[];     // Hero synergy/Frequently Paired With (cth Ao'yin: ['zhang-fei', 'dolia', 'sun-bin'])
  tags: string[];
}

export const HOK_HEROES: Hero[] = [
  {
    "id": "alessio",
    "name": "Alessio",
    "role": "Farm",
    "avatarUrl": "/heroes/alessio.webp",
    "counters": ["agudo", "allain", "angela"],
    "counteredBy": ["arli", "consort-yu", "marco-polo"],
    "synergies": ["dolia", "sun-bin", "zhang-fei"],
    "tags": ["Marksman", "AoE", "Mobility"]
  },
  {
    "id": "agudo",
    "name": "Agudo",
    "role": "Jungle",
    "avatarUrl": "/heroes/agudo.webp",
    "counters": ["alessio", "allain", "angela"],
    "counteredBy": ["peiyin", "musashi", "liu-bei"],
    "synergies": ["zhang-fei", "sun-bin", "dolia"],
    "tags": ["Tank", "Jungle", "Sustain"]
  },
  {
    "id": "aoyin",
    "name": "Ao'yin",
    "role": "Farm",
    "avatarUrl": "/heroes/aoyin.webp",
    "counters": ["alessio", "agudo", "allain", "angela"],
    "counteredBy": ["arli", "consort-yu", "di-renjie", "garo"],
    "synergies": ["zhang-fei", "dolia", "sun-bin", "da-qiao"],
    "tags": ["Marksman", "Flight", "Poke"]
  },
  {
    "id": "allain",
    "name": "Allain",
    "role": "Clash",
    "avatarUrl": "/heroes/allain.webp",
    "counters": ["alessio", "agudo", "angela"],
    "counteredBy": ["florentino", "kaizer", "mulan", "biron"],
    "synergies": ["dolia", "cai-yan", "sun-bin"],
    "tags": ["Warrior", "True Damage", "Dual Blade"]
  },
  {
    "id": "angela",
    "name": "Angela",
    "role": "Mid",
    "avatarUrl": "/heroes/angela.webp",
    "counters": ["alessio", "agudo", "allain"],
    "counteredBy": ["mai-shiranui", "sima-yi", "libai", "nakoruru"],
    "synergies": ["kui", "guiguzi", "donghuang"],
    "tags": ["Mage", "Burst", "Laser"]
  },
  {
    "id": "annette",
    "name": "Annette",
    "role": "Roam",
    "avatarUrl": "/heroes/annette.webp",
    "counters": ["alessio", "agudo", "allain"],
    "counteredBy": ["angela", "ganjiang-moye", "milady"],
    "synergies": ["aoyin", "lu-bu", "di-renjie"],
    "tags": ["Support", "Shield", "Ultimate Knockback"]
  },
  {
    "id": "arike",
    "name": "Arke",
    "role": "Jungle",
    "avatarUrl": "/heroes/arike.webp",
    "counters": ["alessio", "agudo", "aoyin"],
    "counteredBy": ["liang", "zhang-liang", "donghuang", "kui"],
    "synergies": ["sun-bin", "guiguzi", "shangguan-wan-er"],
    "tags": ["Assassin", "Stealth", "Burst"]
  },
  {
    "id": "arli",
    "name": "Arli",
    "role": "Farm",
    "avatarUrl": "/heroes/gongsun-li.webp",
    "counters": ["aoyin", "alessio", "agudo"],
    "counteredBy": ["di-renjie", "garo", "hou-yi"],
    "synergies": ["dolia", "sun-bin", "da-qiao"],
    "tags": ["Marksman", "High Mobility", "Dash"]
  },
  {
    "id": "arthur",
    "name": "Arthur",
    "role": "Clash",
    "avatarUrl": "/heroes/arthur.webp",
    "counters": ["alessio", "agudo", "allain"],
    "counteredBy": ["florentino", "lu-bu", "mulan"],
    "synergies": ["angela", "daji", "lady-sun"],
    "tags": ["Warrior", "Tank", "Silence"]
  },
  {
    "id": "ata",
    "name": "Ata",
    "role": "Clash",
    "avatarUrl": "/heroes/ata.webp",
    "counters": ["alessio", "agudo", "allain"],
    "counteredBy": ["luban-no-7", "huang-zhong", "garo", "consort-yu"],
    "synergies": ["zhou-yu", "zhuge-liang", "dolia"],
    "tags": ["Tank", "Shield", "Wall"]
  },
  {
    "id": "athena",
    "name": "Athena",
    "role": "Jungle",
    "avatarUrl": "/heroes/athena.webp",
    "counters": ["agudo", "alessio", "allain"],
    "counteredBy": ["liang", "donghuang", "kui"],
    "synergies": ["sun-bin", "guiguzi", "mozi"],
    "tags": ["Warrior", "Jungle", "Shield"]
  },
  {
    "id": "augran",
    "name": "Augran",
    "role": "Jungle",
    "avatarUrl": "/heroes/augran.webp",
    "counters": ["agudo", "alessio", "allain"],
    "counteredBy": ["liang", "donghuang", "kaizer"],
    "synergies": ["sun-bin", "zhang-fei", "dolia"],
    "tags": ["Assassin", "Reap", "Sustain"]
  },
  {
    "id": "bai-qi",
    "name": "Bai Qi",
    "role": "Clash",
    "avatarUrl": "/heroes/bai-qi.webp",
    "counters": ["alessio", "agudo"],
    "counteredBy": ["florentino", "lu-bu", "mulan"],
    "synergies": ["daji", "angela", "sun-bin"],
    "tags": ["Tank", "Taunt", "Sustain"]
  },
  {
    "id": "biron",
    "name": "Biron",
    "role": "Clash",
    "avatarUrl": "/heroes/biron.webp",
    "counters": ["alessio", "allain", "arthur"],
    "counteredBy": ["florentino", "mulan", "kaizer"],
    "synergies": ["dolia", "sun-bin", "zhang-fei"],
    "tags": ["Warrior", "Sustain", "Burst"]
  },
  {
    "id": "butterfly",
    "name": "Butterfly",
    "role": "Jungle",
    "avatarUrl": "/heroes/butterfly.webp",
    "counters": ["alessio", "agudo", "angela"],
    "counteredBy": ["liang", "donghuang", "kui", "zhang-fei"],
    "synergies": ["sun-bin", "guiguzi", "mozi"],
    "tags": ["Assassin", "Reset", "Burst"]
  },
  {
    "id": "cai-yan",
    "name": "Cai Yan",
    "role": "Roam",
    "avatarUrl": "/heroes/cai-yan.webp",
    "counters": ["agudo", "alessio"],
    "counteredBy": ["hou-yi", "luban-no-7", "milady"],
    "synergies": ["huang-zhong", "di-renjie", "lu-bu"],
    "tags": ["Support", "Heal", "Stun"]
  },
  {
    "id": "charlotte",
    "name": "Charlotte",
    "role": "Clash",
    "avatarUrl": "/heroes/charlotte.webp",
    "counters": ["allain", "arthur", "biron"],
    "counteredBy": ["florentino", "kaizer", "mulan"],
    "synergies": ["dolia", "sun-bin", "zhang-fei"],
    "tags": ["Warrior", "Combo", "Reduction"]
  },
  {
    "id": "consort-yu",
    "name": "Consort Yu",
    "role": "Farm",
    "avatarUrl": "/heroes/consort-yu.webp",
    "counters": ["aoyin", "alessio", "agudo", "li-bai", "wukong"],
    "counteredBy": ["angela", "ganjiang-moye", "mai-shiranui"],
    "synergies": ["dolia", "sun-bin", "zhang-fei"],
    "tags": ["Marksman", "Immunity", "Poke"]
  },
  {
    "id": "da-qiao",
    "name": "Da Qiao",
    "role": "Roam",
    "avatarUrl": "/heroes/da-qiao.webp",
    "counters": ["agudo", "alessio"],
    "counteredBy": ["donghuang", "liang", "kui"],
    "synergies": ["aoyin", "gongsun-li", "luban-no-7"],
    "tags": ["Support", "Teleport", "Control"]
  },
  {
    "id": "daji",
    "name": "Daji",
    "role": "Mid",
    "avatarUrl": "/heroes/daji.webp",
    "counters": ["agudo", "alessio", "arike"],
    "counteredBy": ["sima-yi", "libai", "nakoruru"],
    "synergies": ["kui", "guiguzi", "donghuang"],
    "tags": ["Mage", "Burst", "Stun"]
  },
  {
    "id": "dharma",
    "name": "Dharma",
    "role": "Clash",
    "avatarUrl": "/heroes/dharma.webp",
    "counters": ["allain", "arthur", "biron"],
    "counteredBy": ["florentino", "kaizer", "mulan"],
    "synergies": ["sun-bin", "guiguzi", "kui"],
    "tags": ["Warrior", "Displacement", "Punch"]
  },
  {
    "id": "di-renjie",
    "name": "Di Renjie",
    "role": "Farm",
    "avatarUrl": "/heroes/di-renjie.webp",
    "counters": ["aoyin", "alessio", "arli"],
    "counteredBy": ["arike", "sima-yi", "nakoruru"],
    "synergies": ["dolia", "sun-bin", "zhang-fei"],
    "tags": ["Marksman", "Cleanse", "Poke"]
  },
  {
    "id": "dian-wei",
    "name": "Dian Wei",
    "role": "Jungle",
    "avatarUrl": "/heroes/dian-wei.webp",
    "counters": ["agudo", "alessio", "allain"],
    "counteredBy": ["liang", "donghuang", "garo", "aoyin"],
    "synergies": ["sun-bin", "guiguzi", "dolia"],
    "tags": ["Warrior", "True Damage", "Berserker"]
  },
  {
    "id": "diaochan",
    "name": "Diaochan",
    "role": "Mid",
    "avatarUrl": "/heroes/diaochan.webp",
    "counters": ["agudo", "allain", "angela"],
    "counteredBy": ["liang", "donghuang", "shangguan-wan-er"],
    "synergies": ["dolia", "sun-bin", "zhang-fei"],
    "tags": ["Mage", "I-Frames", "True Damage"]
  },
  {
    "id": "dolia",
    "name": "Dolia",
    "role": "Roam",
    "avatarUrl": "/heroes/doria.webp",
    "counters": ["agudo", "alessio"],
    "counteredBy": ["donghuang", "liang", "kui"],
    "synergies": ["aoyin", "heino", "mai-shiranui"],
    "tags": ["Support", "Cooldown Reset", "Heal"]
  },
  {
    "id": "donghuang",
    "name": "Donghuang",
    "role": "Roam",
    "avatarUrl": "/heroes/donghuang-taiyi.webp",
    "counters": ["agudo", "alessio", "allain", "aoyin", "li-bai"],
    "counteredBy": ["angela", "ganjiang-moye", "garo"],
    "synergies": ["daji", "angela", "huang-zhong"],
    "tags": ["Tank", "Suppression", "Drain"]
  },
  {
    "id": "erin",
    "name": "Erin",
    "role": "Farm",
    "avatarUrl": "/heroes/erin.webp",
    "counters": ["alessio", "agudo", "allain"],
    "counteredBy": ["arli", "consort-yu", "di-renjie"],
    "synergies": ["dolia", "sun-bin", "zhang-fei"],
    "tags": ["Marksman", "Magic Damage", "Agile"]
  },
  {
    "id": "fang",
    "name": "Fang",
    "role": "Farm",
    "avatarUrl": "/heroes/li-yuanfang.webp",
    "counters": ["alessio", "agudo", "aoyin"],
    "counteredBy": ["di-renjie", "consort-yu", "garo"],
    "synergies": ["dolia", "sun-bin", "da-qiao"],
    "tags": ["Marksman", "Burst", "Objective"]
  },
  {
    "id": "florentino",
    "name": "Florentino",
    "role": "Clash",
    "avatarUrl": "/heroes/florentino.webp",
    "counters": ["allain", "arthur", "biron", "kaizer", "mulan"],
    "counteredBy": ["donghuang", "liang", "kui", "zhang-fei"],
    "synergies": ["sun-bin", "dolia", "guiguzi"],
    "tags": ["Warrior", "Lunge", "Outplay"]
  },
  {
    "id": "fuzi",
    "name": "Fuzi",
    "role": "Clash",
    "avatarUrl": "/heroes/laozi.webp",
    "counters": ["allain", "arthur", "biron"],
    "counteredBy": ["florentino", "mulan", "kaizer"],
    "synergies": ["daji", "angela", "sun-bin"],
    "tags": ["Warrior", "Binding", "Push"]
  },
  {
    "id": "gan-mo",
    "name": "Gan & Mo",
    "role": "Mid",
    "avatarUrl": "/heroes/ganjiang-moye.webp",
    "counters": ["agudo", "alessio", "angela"],
    "counteredBy": ["arike", "sima-yi", "nakoruru"],
    "synergies": ["kui", "donghuang", "guiguzi"],
    "tags": ["Mage", "Long Range", "Sniper"]
  },
  {
    "id": "garo",
    "name": "Garo",
    "role": "Farm",
    "avatarUrl": "/heroes/garo.webp",
    "counters": ["aoyin", "alessio", "agudo"],
    "counteredBy": ["arike", "sima-yi", "nakoruru"],
    "synergies": ["dolia", "sun-bin", "zhang-fei"],
    "tags": ["Marksman", "Slow", "Range"]
  },
  {
    "id": "guan-yu",
    "name": "Guan Yu",
    "role": "Clash",
    "avatarUrl": "/heroes/guan-yu.webp",
    "counters": ["allain", "arthur", "biron"],
    "counteredBy": ["donghuang", "liang", "fuzi"],
    "synergies": ["sun-bin", "guiguzi", "zhang-fei"],
    "tags": ["Warrior", "Charge", "Displacement"]
  },
  {
    "id": "guiguzi",
    "name": "Guiguzi",
    "role": "Roam",
    "avatarUrl": "/heroes/guiguzi.webp",
    "counters": ["agudo", "alessio"],
    "counteredBy": ["donghuang", "liang", "kui"],
    "synergies": ["angela", "daji", "hou-yi"],
    "tags": ["Support", "Invisibility", "Pull"]
  },
  {
    "id": "han-xin",
    "name": "Han Xin",
    "role": "Jungle",
    "avatarUrl": "/heroes/han-xin.webp",
    "counters": ["agudo", "alessio", "aoyin"],
    "counteredBy": ["liang", "donghuang", "kui"],
    "synergies": ["sun-bin", "guiguzi", "dolia"],
    "tags": ["Assassin", "Mobility", "Split Push"]
  },
  {
    "id": "heino",
    "name": "Heino",
    "role": "Mid",
    "avatarUrl": "/heroes/heino.webp",
    "counters": ["agudo", "allain", "angela"],
    "counteredBy": ["sima-yi", "libai", "nakoruru"],
    "synergies": ["dolia", "sun-bin", "zhang-fei"],
    "tags": ["Mage", "Ranged/Melee", "Time Reverse"]
  },
  {
    "id": "hou-yi",
    "name": "Hou Yi",
    "role": "Farm",
    "avatarUrl": "/heroes/hou-yi.webp",
    "counters": ["aoyin", "alessio", "agudo"],
    "counteredBy": ["arike", "sima-yi", "nakoruru"],
    "synergies": ["cai-yan", "sun-bin", "zhang-fei"],
    "tags": ["Marksman", "Stun Arrow", "Attack Speed"]
  },
  {
    "id": "huang-zhong",
    "name": "Huang Zhong",
    "role": "Farm",
    "avatarUrl": "/heroes/huang-zhong.webp",
    "counters": ["aoyin", "alessio", "agudo"],
    "counteredBy": ["arike", "sima-yi", "ganjiang-moye"],
    "synergies": ["cai-yan", "zhang-fei", "donghuang"],
    "tags": ["Marksman", "Artillery", "Siege"]
  },
  {
    "id": "jing",
    "name": "Jing",
    "role": "Jungle",
    "avatarUrl": "/heroes/jing.webp",
    "counters": ["agudo", "alessio", "aoyin"],
    "counteredBy": ["liang", "donghuang", "kui"],
    "synergies": ["sun-bin", "guiguzi", "dolia"],
    "tags": ["Assassin", "Mirror", "Burst"]
  },
  {
    "id": "kaizer",
    "name": "Kaizer",
    "role": "Clash",
    "avatarUrl": "/heroes/kaizer.webp",
    "counters": ["allain", "arthur", "biron"],
    "counteredBy": ["florentino", "lu-bu", "mulan"],
    "synergies": ["sun-bin", "dolia", "zhang-fei"],
    "tags": ["Warrior", "Transform", "Duelist"]
  },
  {
    "id": "kongming",
    "name": "Kongming",
    "role": "Mid",
    "avatarUrl": "/heroes/zhuge-liang.webp",
    "counters": ["agudo", "allain", "angela"],
    "counteredBy": ["sima-yi", "libai", "donghuang"],
    "synergies": ["dolia", "sun-bin", "guiguzi"],
    "tags": ["Mage", "Reset", "Mobility"]
  },
  {
    "id": "kui",
    "name": "Kui",
    "role": "Roam",
    "avatarUrl": "/heroes/zhong-kui.webp",
    "counters": ["agudo", "alessio"],
    "counteredBy": ["donghuang", "liang", "zhuangzi"],
    "synergies": ["angela", "daji", "hou-yi"],
    "tags": ["Tank", "Hook", "Burst"]
  },
  {
    "id": "lady-sun",
    "name": "Lady Sun",
    "role": "Farm",
    "avatarUrl": "/heroes/sun-shangxiang.webp",
    "counters": ["aoyin", "alessio", "agudo"],
    "counteredBy": ["arike", "sima-yi", "nakoruru"],
    "synergies": ["dolia", "sun-bin", "zhang-fei"],
    "tags": ["Marksman", "Roll", "Burst"]
  },
  {
    "id": "lady-zhen",
    "name": "Lady Zhen",
    "role": "Mid",
    "avatarUrl": "/heroes/zhen-ji.webp",
    "counters": ["agudo", "allain", "angela"],
    "counteredBy": ["sima-yi", "libai", "nakoruru"],
    "synergies": ["kui", "donghuang", "guiguzi"],
    "tags": ["Mage", "Freeze", "Crowd Control"]
  },
  {
    "id": "lam",
    "name": "Lam",
    "role": "Jungle",
    "avatarUrl": "/heroes/lan.webp",
    "counters": ["agudo", "alessio", "aoyin"],
    "counteredBy": ["liang", "donghuang", "kui"],
    "synergies": ["sun-bin", "guiguzi", "dolia"],
    "tags": ["Assassin", "Dive", "Shark"]
  },
  {
    "id": "li-bai",
    "name": "Li Bai",
    "role": "Jungle",
    "avatarUrl": "/heroes/li-bai.webp",
    "counters": ["agudo", "alessio", "aoyin"],
    "counteredBy": ["donghuang", "liang", "zhang-fei"],
    "synergies": ["sun-bin", "guiguzi", "dolia"],
    "tags": ["Assassin", "I-Frames", "Slash"]
  },
  {
    "id": "li-xin",
    "name": "Li Xin",
    "role": "Clash",
    "avatarUrl": "/heroes/li-xin.webp",
    "counters": ["allain", "arthur", "biron"],
    "counteredBy": ["florentino", "kaizer", "mulan"],
    "synergies": ["sun-bin", "dolia", "zhang-fei"],
    "tags": ["Warrior", "Stance Change", "Burst/Poke"]
  },
  {
    "id": "lian-po",
    "name": "Lian Po",
    "role": "Clash",
    "avatarUrl": "/heroes/lian-po.webp",
    "counters": ["allain", "arthur", "biron"],
    "counteredBy": ["florentino", "kaizer", "mulan"],
    "synergies": ["angela", "daji", "sun-bin"],
    "tags": ["Tank", "Super Armor", "Initiate"]
  },
  {
    "id": "liang",
    "name": "Liang",
    "role": "Mid",
    "avatarUrl": "/heroes/zhang-liang.webp",
    "counters": ["agudo", "allain", "angela", "arike", "li-bai"],
    "counteredBy": ["angela", "ganjiang-moye", "mai-shiranui"],
    "synergies": ["daji", "angela", "hou-yi"],
    "tags": ["Mage", "Suppression", "Control"]
  },
  {
    "id": "liu-bang",
    "name": "Liu Bang",
    "role": "Clash",
    "avatarUrl": "/heroes/liu-bang.webp",
    "counters": ["allain", "arthur", "biron"],
    "counteredBy": ["florentino", "kaizer", "mulan"],
    "synergies": ["aoyin", "huang-zhong", "luban-no-7"],
    "tags": ["Tank", "Global Teleport", "Shield"]
  },
  {
    "id": "liu-bei",
    "name": "Liu Bei",
    "role": "Jungle",
    "avatarUrl": "/heroes/liu-bei.webp",
    "counters": ["agudo", "alessio", "allain"],
    "counteredBy": ["garo", "aoyin", "di-renjie"],
    "synergies": ["sun-bin", "guiguzi", "dolia"],
    "tags": ["Warrior", "Shield", "Close Range"]
  },
  {
    "id": "liu-shan",
    "name": "Liu Shan",
    "role": "Roam",
    "avatarUrl": "/heroes/liu-shan.webp",
    "counters": ["agudo", "alessio"],
    "counteredBy": ["donghuang", "liang", "kui"],
    "synergies": ["li-yuanfang", "luban-no-7", "huang-zhong"],
    "tags": ["Tank", "Tower Stun", "Mecha"]
  },
  {
    "id": "lu-bu",
    "name": "Lu Bu",
    "role": "Clash",
    "avatarUrl": "/heroes/lu-bu.webp",
    "counters": ["allain", "arthur", "biron", "kaizer", "bai-qi"],
    "counteredBy": ["arike", "sima-yi", "garo"],
    "synergies": ["dolia", "sun-bin", "zhang-fei"],
    "tags": ["Warrior", "True Damage", "Sustain"]
  },
  {
    "id": "luban-no-7",
    "name": "Luban No.7",
    "role": "Farm",
    "avatarUrl": "/heroes/luban-no-7.webp",
    "counters": ["aoyin", "alessio", "agudo"],
    "counteredBy": ["arike", "sima-yi", "nakoruru"],
    "synergies": ["liu-shan", "sun-bin", "zhang-fei"],
    "tags": ["Marksman", "Max HP Damage", "Passive Rocket"]
  },
  {
    "id": "luna",
    "name": "Luna",
    "role": "Jungle",
    "avatarUrl": "/heroes/luna.webp",
    "counters": ["agudo", "alessio", "aoyin"],
    "counteredBy": ["donghuang", "liang", "zhang-fei"],
    "synergies": ["sun-bin", "guiguzi", "dolia"],
    "tags": ["Assassin", "Infinite Dash", "Magic Damage"]
  },
  {
    "id": "mai-shiranui",
    "name": "Mai Shiranui",
    "role": "Mid",
    "avatarUrl": "/heroes/mai-shiranui.webp",
    "counters": ["agudo", "allain", "angela", "daji"],
    "counteredBy": ["liang", "donghuang", "kui"],
    "synergies": ["sun-bin", "guiguzi", "dolia"],
    "tags": ["Mage", "Assassin", "Poke"]
  },
  {
    "id": "marco-polo",
    "name": "Marco Polo",
    "role": "Farm",
    "avatarUrl": "/heroes/marco-polo.webp",
    "counters": ["aoyin", "alessio", "agudo"],
    "counteredBy": ["di-renjie", "garo", "arike"],
    "synergies": ["dolia", "sun-bin", "da-qiao"],
    "tags": ["Marksman", "True Damage", "Mobility"]
  },
  {
    "id": "mayene",
    "name": "Mayene",
    "role": "Clash",
    "avatarUrl": "/heroes/mayene.webp",
    "counters": ["allain", "arthur", "biron"],
    "counteredBy": ["florentino", "kaizer", "mulan"],
    "synergies": ["sun-bin", "dolia", "zhang-fei"],
    "tags": ["Warrior", "Combo", "Markdown"]
  },
  {
    "id": "mi-yue",
    "name": "Mi Yue",
    "role": "Clash",
    "avatarUrl": "/heroes/miyue.webp",
    "counters": ["allain", "arthur", "biron", "kaizer"],
    "counteredBy": ["arike", "sima-yi", "nakoruru"],
    "synergies": ["dolia", "sun-bin", "zhang-fei"],
    "tags": ["Mage", "Sustain", "Split Push"]
  },
  {
    "id": "milady",
    "name": "Milady",
    "role": "Mid",
    "avatarUrl": "/heroes/milady.webp",
    "counters": ["agudo", "allain", "angela"],
    "counteredBy": ["sima-yi", "libai", "nakoruru"],
    "synergies": ["liu-shan", "kui", "guiguzi"],
    "tags": ["Mage", "Robots", "Push"]
  },
  {
    "id": "mozi",
    "name": "Mozi",
    "role": "Mid",
    "avatarUrl": "/heroes/mozi.webp",
    "counters": ["agudo", "allain", "angela"],
    "counteredBy": ["donghuang", "liang", "zhuangzi"],
    "synergies": ["hou-yi", "huang-zhong", "luban-no-7"],
    "tags": ["Mage", "Poke", "Stun"]
  },
  {
    "id": "mulan",
    "name": "Mulan",
    "role": "Clash",
    "avatarUrl": "/heroes/mulan.webp",
    "counters": ["allain", "arthur", "biron", "florentino"],
    "counteredBy": ["donghuang", "liang", "zhang-fei"],
    "synergies": ["sun-bin", "dolia", "guiguzi"],
    "tags": ["Warrior", "Silence", "Dual Stance"]
  },
  {
    "id": "musashi",
    "name": "Musashi",
    "role": "Clash",
    "avatarUrl": "/heroes/musashi-miyamoto.webp",
    "counters": ["allain", "arthur", "biron", "agudo"],
    "counteredBy": ["florentino", "kaizer", "mulan"],
    "synergies": ["sun-bin", "dolia", "zhang-fei"],
    "tags": ["Warrior", "Shield Block", "Execute"]
  },
  {
    "id": "nakoruru",
    "name": "Nakoruru",
    "role": "Jungle",
    "avatarUrl": "/heroes/nakoruru.webp",
    "counters": ["agudo", "alessio", "aoyin"],
    "counteredBy": ["liang", "donghuang", "zhang-fei"],
    "synergies": ["sun-bin", "guiguzi", "dolia"],
    "tags": ["Assassin", "Burst", "Max HP"]
  },
  {
    "id": "nezha",
    "name": "Nezha",
    "role": "Clash",
    "avatarUrl": "/heroes/nezha.webp",
    "counters": ["allain", "arthur", "biron"],
    "counteredBy": ["florentino", "kaizer", "mulan"],
    "synergies": ["sun-bin", "guiguzi", "dolia"],
    "tags": ["Warrior", "Global Vision", "True Damage"]
  },
  {
    "id": "nuwa",
    "name": "Nuwa",
    "role": "Mid",
    "avatarUrl": "/heroes/nuwa.webp",
    "counters": ["agudo", "allain", "angela"],
    "counteredBy": ["arike", "sima-yi", "nakoruru"],
    "synergies": ["da-qiao", "sun-bin", "zhang-fei"],
    "tags": ["Mage", "Global Teleport", "Matrix"]
  },
  {
    "id": "pei",
    "name": "Pei",
    "role": "Jungle",
    "avatarUrl": "/heroes/pei.webp",
    "counters": ["agudo", "alessio", "aoyin"],
    "counteredBy": ["liang", "donghuang", "kui"],
    "synergies": ["sun-bin", "guiguzi", "dolia"],
    "tags": ["Assassin", "Early Game", "Form Swap"]
  },
  {
    "id": "shangguan",
    "name": "Shangguan",
    "role": "Mid",
    "avatarUrl": "/heroes/shangguan-wan-er.webp",
    "counters": ["agudo", "allain", "angela"],
    "counteredBy": ["liang", "donghuang", "kui"],
    "synergies": ["sun-bin", "guiguzi", "dolia"],
    "tags": ["Mage", "Flight", "Dive"]
  },
  {
    "id": "shi",
    "name": "Shi",
    "role": "Mid",
    "avatarUrl": "/heroes/xi-shi.webp",
    "counters": ["agudo", "allain", "angela"],
    "counteredBy": ["sima-yi", "libai", "nakoruru"],
    "synergies": ["kui", "donghuang", "guiguzi"],
    "tags": ["Mage", "Pull", "Control"]
  },
  {
    "id": "shouyue",
    "name": "Shouyue",
    "role": "Farm",
    "avatarUrl": "/heroes/shao-siyuan.webp",
    "counters": ["aoyin", "alessio", "agudo"],
    "counteredBy": ["arike", "sima-yi", "nakoruru"],
    "synergies": ["dolia", "sun-bin", "zhang-fei"],
    "tags": ["Marksman", "Sniper", "Vision"]
  },
  {
    "id": "sima-yi",
    "name": "Sima Yi",
    "role": "Jungle",
    "avatarUrl": "/heroes/sima-yi.webp",
    "counters": ["agudo", "alessio", "aoyin", "angela", "daji"],
    "counteredBy": ["liang", "donghuang", "zhang-fei"],
    "synergies": ["sun-bin", "guiguzi", "dolia"],
    "tags": ["Assassin", "Silence", "Teleport"]
  },
  {
    "id": "sun-bin",
    "name": "Sun Bin",
    "role": "Roam",
    "avatarUrl": "/heroes/sun-bin.webp",
    "counters": ["agudo", "alessio"],
    "counteredBy": ["donghuang", "liang", "kui"],
    "synergies": ["aoyin", "lu-bu", "dolia"],
    "tags": ["Support", "Speed", "Cooldown"]
  },
  {
    "id": "sun-ce",
    "name": "Sun Ce",
    "role": "Clash",
    "avatarUrl": "/heroes/sun-ce.webp",
    "counters": ["allain", "arthur", "biron"],
    "counteredBy": ["florentino", "kaizer", "mulan"],
    "synergies": ["da-qiao", "angela", "daji"],
    "tags": ["Tank", "Boat", "Knockup"]
  },
  {
    "id": "ukyo-tachibana",
    "name": "Ukyo Tachibana",
    "role": "Jungle",
    "avatarUrl": "/heroes/ukyo-tachibana.webp",
    "counters": ["agudo", "alessio", "allain"],
    "counteredBy": ["florentino", "kaizer", "mulan"],
    "synergies": ["sun-bin", "guiguzi", "dolia"],
    "tags": ["Assassin", "Stun", "Burst"]
  },
  {
    "id": "wang-zhaojun",
    "name": "Wang Zhaojun",
    "role": "Mid",
    "avatarUrl": "/heroes/wang-zhaojun.webp",
    "counters": ["agudo", "allain", "angela"],
    "counteredBy": ["sima-yi", "libai", "nakoruru"],
    "synergies": ["kui", "donghuang", "guiguzi"],
    "tags": ["Mage", "Freeze", "Shield"]
  },
  {
    "id": "wukong",
    "name": "Wukong",
    "role": "Jungle",
    "avatarUrl": "/heroes/wukong.webp",
    "counters": ["agudo", "alessio", "aoyin"],
    "counteredBy": ["liang", "donghuang", "zhang-fei", "consort-yu"],
    "synergies": ["sun-bin", "guiguzi", "dolia"],
    "tags": ["Assassin", "Crit", "Invincibility"]
  },
  {
    "id": "wuyan",
    "name": "Wuyan",
    "role": "Clash",
    "avatarUrl": "/heroes/zhong-wuyan.webp",
    "counters": ["allain", "arthur", "biron"],
    "counteredBy": ["florentino", "kaizer", "mulan"],
    "synergies": ["daji", "angela", "sun-bin"],
    "tags": ["Warrior", "Petrify", "Burst"]
  },
  {
    "id": "xiang-yu",
    "name": "Xiang Yu",
    "role": "Clash",
    "avatarUrl": "/heroes/xiang-yu.webp",
    "counters": ["allain", "arthur", "biron"],
    "counteredBy": ["florentino", "kaizer", "mulan"],
    "synergies": ["dolia", "sun-bin", "zhang-fei"],
    "tags": ["Tank", "Undying", "Push"]
  },
  {
    "id": "xiao-qiao",
    "name": "Xiao Qiao",
    "role": "Mid",
    "avatarUrl": "/heroes/xiao-qiao.webp",
    "counters": ["agudo", "allain", "angela"],
    "counteredBy": ["sima-yi", "libai", "nakoruru"],
    "synergies": ["kui", "donghuang", "guiguzi"],
    "tags": ["Mage", "AOE", "Speed"]
  },
  {
    "id": "xuance",
    "name": "Xuance",
    "role": "Jungle",
    "avatarUrl": "/heroes/han-xin.webp",
    "counters": ["agudo", "alessio", "aoyin"],
    "counteredBy": ["liang", "donghuang", "kui"],
    "synergies": ["sun-bin", "guiguzi", "dolia"],
    "tags": ["Assassin", "Hook", "Control"]
  },
  {
    "id": "yang-jian",
    "name": "Yang Jian",
    "role": "Clash",
    "avatarUrl": "/heroes/yang-jian.webp",
    "counters": ["allain", "arthur", "biron"],
    "counteredBy": ["florentino", "kaizer", "mulan"],
    "synergies": ["sun-bin", "dolia", "zhang-fei"],
    "tags": ["Warrior", "True Damage", "Reset"]
  },
  {
    "id": "yao",
    "name": "Yao",
    "role": "Clash",
    "avatarUrl": "/heroes/dongfang-yao.webp",
    "counters": ["allain", "arthur", "biron"],
    "counteredBy": ["liang", "donghuang", "kui"],
    "synergies": ["sun-bin", "dolia", "zhang-fei"],
    "tags": ["Warrior", "Mobility", "Damage Delay"]
  },
  {
    "id": "yaria",
    "name": "Yaria",
    "role": "Roam",
    "avatarUrl": "/heroes/yaria.webp",
    "counters": ["agudo", "alessio"],
    "counteredBy": ["donghuang", "liang", "kui"],
    "synergies": ["ma-chao", "li-bai", "jing"],
    "tags": ["Support", "Shield", "Attach"]
  },
  {
    "id": "ying",
    "name": "Ying",
    "role": "Clash",
    "avatarUrl": "/heroes/ying.webp",
    "counters": ["allain", "arthur", "biron"],
    "counteredBy": ["florentino", "kaizer", "mulan"],
    "synergies": ["sun-bin", "dolia", "zhang-fei"],
    "tags": ["Warrior", "Combo", "Shield"]
  },
  {
    "id": "yixing",
    "name": "Yixing",
    "role": "Mid",
    "avatarUrl": "/heroes/yi-xing.webp",
    "counters": ["agudo", "allain", "angela"],
    "counteredBy": ["sima-yi", "libai", "nakoruru"],
    "synergies": ["kui", "donghuang", "guiguzi"],
    "tags": ["Mage", "Cage", "Control"]
  },
  {
    "id": "yuhuan",
    "name": "Yuhuan",
    "role": "Mid",
    "avatarUrl": "/heroes/yang-yuhuan.webp",
    "counters": ["agudo", "allain", "angela"],
    "counteredBy": ["sima-yi", "libai", "nakoruru"],
    "synergies": ["sun-bin", "dolia", "zhang-fei"],
    "tags": ["Mage", "Heal", "Invincibility"]
  },
  {
    "id": "zhang-fei",
    "name": "Zhang Fei",
    "role": "Roam",
    "avatarUrl": "/heroes/zhang-fei.webp",
    "counters": ["agudo", "alessio"],
    "counteredBy": ["donghuang", "liang", "kui"],
    "synergies": ["huang-zhong", "aoyin", "luban-no-7"],
    "tags": ["Tank", "Shield", "Transform"]
  },
  {
    "id": "zhou-yu",
    "name": "Zhou Yu",
    "role": "Mid",
    "avatarUrl": "/heroes/zhou-yu.webp",
    "counters": ["agudo", "allain", "angela"],
    "counteredBy": ["sima-yi", "libai", "nakoruru"],
    "synergies": ["ata", "kui", "donghuang"],
    "tags": ["Mage", "Fire Zone", "Siege"]
  },
  {
    "id": "zhuangzi",
    "name": "Zhuangzi",
    "role": "Roam",
    "avatarUrl": "/heroes/zhuangzi.webp",
    "counters": ["agudo", "alessio"],
    "counteredBy": ["donghuang", "liang", "kui"],
    "synergies": ["sun-bin", "dolia", "zhang-fei"],
    "tags": ["Support", "Cleanse", "Slow Immunity"]
  },
  {
    "id": "zilong",
    "name": "Zilong",
    "role": "Jungle",
    "avatarUrl": "/heroes/zilong.webp",
    "counters": ["agudo", "alessio", "aoyin"],
    "counteredBy": ["liang", "donghuang", "kui"],
    "synergies": ["sun-bin", "guiguzi", "dolia"],
    "tags": ["Assassin", "Dive", "Knockup"]
  },
  {
    "id": "ziya",
    "name": "Ziya",
    "role": "Mid",
    "avatarUrl": "/heroes/jiang-ziya.webp",
    "counters": ["agudo", "allain", "angela"],
    "counteredBy": ["sima-yi", "libai", "nakoruru"],
    "synergies": ["dolia", "sun-bin", "zhang-fei"],
    "tags": ["Mage", "Level Boost", "Beam"]
  }
];
