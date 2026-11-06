import React, { useState, useMemo } from 'react';
import { HOK_HEROES, Hero } from '../../data/hokHeroes';
import { HOK_TIER_DATA } from '../../data/hokTierData';

const ROLE_FILTERS = ['All', 'Roam', 'Clash', 'Mid', 'Farm', 'Jungle'] as const;
type RoleFilter = typeof ROLE_FILTERS[number];

const ROLE_COLORS: Record<string, string> = {
  Roam:   'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  Clash:  'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Mid:    'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Farm:   'bg-green-500/20 text-green-300 border-green-500/30',
  Jungle: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const TIER_DOT: Record<string, string> = {
  S: 'bg-amber-400',
  A: 'bg-orange-400',
  B: 'bg-blue-400',
  C: 'bg-slate-500',
};

function getTier(heroName: string): string {
  const entry = HOK_TIER_DATA.find(e => e.name.toLowerCase() === heroName.toLowerCase());
  return entry?.tier ?? '';
}

export const HeroCatalogView: React.FC = () => {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return HOK_HEROES.filter(h => {
      if (roleFilter !== 'All' && h.role !== roleFilter) return false;
      if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [roleFilter, search]);

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 min-h-full">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">📖</span>
          <h2 className="text-xl font-bold text-white">Database Hero</h2>
          <span className="text-[10px] font-semibold text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
            {HOK_HEROES.length} hero
          </span>
        </div>
        <p className="text-xs text-white/40">Katalog lengkap hero HoK dengan role, tier, counter, dan sinergi</p>
      </div>

      {/* Search + filter row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari hero..."
            className="w-full bg-[#191919] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#8000ff]/50 focus:ring-1 focus:ring-[#8000ff]/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-lg leading-none"
            >×</button>
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          {ROLE_FILTERS.map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                roleFilter === r
                  ? 'bg-[#8000ff]/25 border-[#8000ff]/50 text-[#c084fc]'
                  : 'text-white/40 border-white/10 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {filtered.map(hero => {
          const tier = getTier(hero.name);
          return (
            <div
              key={hero.id}
              className="group bg-[#191919] border border-white/8 rounded-xl p-3 flex flex-col items-center gap-2 hover:border-[#8000ff]/30 hover:bg-[#8000ff]/5 transition-all cursor-default"
            >
              <div className="relative">
                <img
                  src={hero.avatarUrl}
                  alt={hero.name}
                  className="w-12 h-12 rounded-xl object-cover bg-white/5"
                  onError={e => { (e.target as HTMLImageElement).src = '/heroes/default.webp'; }}
                />
                {tier && (
                  <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border border-[#191919] ${TIER_DOT[tier] ?? 'bg-slate-500'}`} title={`Tier ${tier}`} />
                )}
              </div>
              <div className="text-center w-full">
                <p className="text-xs font-semibold text-white/90 leading-tight truncate">{hero.name}</p>
                <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${ROLE_COLORS[hero.role] ?? 'bg-white/5 text-white/40 border-white/10'}`}>
                  {hero.role}
                </span>
              </div>
              {/* Hover detail */}
              <div className="w-full hidden group-hover:flex flex-col gap-1 text-[10px] text-white/50 border-t border-white/5 pt-2">
                {hero.counters.length > 0 && (
                  <p className="truncate">⚔️ {hero.counters.slice(0, 2).map(id => {
                    const h = HOK_HEROES.find(x => x.id === id);
                    return h?.name ?? id;
                  }).join(', ')}</p>
                )}
                {hero.synergies.length > 0 && (
                  <p className="truncate">🤝 {hero.synergies.slice(0, 2).map(s => s.name).join(', ')}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex-1 flex items-center justify-center py-20 text-white/25 text-sm">
          Tidak ada hero yang cocok dengan filter
        </div>
      )}

      <p className="text-[10px] text-white/20">
        {filtered.length} hero ditampilkan · Tier dot: <span className="text-amber-400">■</span>S <span className="text-orange-400">■</span>A <span className="text-blue-400">■</span>B <span className="text-slate-500">■</span>C
      </p>
    </div>
  );
};
