export type ItemCategory = 'Physical' | 'Magic' | 'Defense' | 'Movement' | 'Jungling' | 'Roaming';
export type Lane = 'Clash' | 'Mid' | 'Farm' | 'Roam' | 'Jungle';
export interface HokItem { id: string; name: string; category: ItemCategory; price: number; iconUrl?: string; stats: Record<string, number>; statLabels: string[]; effect: string; }
export interface ItemMetaStat { itemId: string; pickRate: number; winRate: number; lane: Lane; }
const source = 'https://hub-game.com/hok/images/items/';
export const HOK_ITEMS: HokItem[] = [
 {id:'axe-of-torment',name:'Axe of Torment',category:'Physical',price:2160,iconUrl:`${source}1137.webp`,stats:{attack:120,cdr:10},statLabels:['+120 Physical Attack','+10% Cooldown Reduction'],effect:'Physical damage reduces target movement speed.'},
 {id:'eternity-blade',name:'Eternity Blade',category:'Physical',price:2140,iconUrl:`${source}1133.webp`,stats:{attack:110,crit:25},statLabels:['+110 Physical Attack','+25% CRIT Rate'],effect:'Critical strikes deal increased damage.'},
 {id:'shadow-ripper',name:'Shadow Ripper',category:'Physical',price:1980,iconUrl:`${source}1136.webp`,stats:{attackSpeed:40,crit:20},statLabels:['+40% Attack Speed','+20% CRIT Rate'],effect:'Basic attacks grant a short burst of attack speed.'},
 {id:'venomous-staff',name:'Venomous Staff',category:'Magic',price:2120,iconUrl:`${source}1227049.webp`,stats:{magic:180,cdr:10},statLabels:['+180 Magic Power','+10% Cooldown Reduction'],effect:'Reduces enemy healing by 50%.'},
 {id:'splendor',name:'Splendor',category:'Magic',price:2100,iconUrl:`${source}1239.webp`,stats:{magic:160,cdr:10},statLabels:['+160 Magic Power','+10% Cooldown Reduction'],effect:'Become immune to damage briefly.'},
 {id:'ominous-premonition',name:'Ominous Premonition',category:'Defense',price:2120,iconUrl:`${source}1333.webp`,stats:{hp:1200,armor:240},statLabels:['+1200 HP','+240 Armor'],effect:'Reduces attack speed of nearby attackers.'},
 {id:'boots-of-fortitude',name:'Boots of Fortitude',category:'Movement',price:710,stats:{armor:90},statLabels:['+90 Armor','+60 Movement Speed'],effect:'Reduces incoming physical damage.'},
];
export const HOK_ITEM_META: ItemMetaStat[] = HOK_ITEMS.map((item, i) => ({itemId:item.id,pickRate:[18.4,16.8,14.1,12.1,10.6,9.8,8.2][i],winRate:[56.2,54.9,53.7,52.8,51.9,51.4,50.8][i],lane:['Farm','Clash','Farm','Mid','Mid','Roam','Jungle'][i] as Lane}));
export const getItemMeta = (lane?: Lane) => HOK_ITEM_META.filter(x => !lane || x.lane === lane).sort((a,b)=>b.pickRate-a.pickRate);
export const calculateBuildStats = (items: HokItem[]) => items.reduce((total,item)=>{ total.gold += item.price; Object.entries(item.stats).forEach(([key,value])=>{total.stats[key]=(total.stats[key]||0)+value;}); return total; }, {gold:0,stats:{} as Record<string,number>});
