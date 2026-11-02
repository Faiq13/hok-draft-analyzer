import React, { useState } from 'react';
import { HOK_HEROES, Hero } from '../data/hokHeroes';
import { Search } from 'lucide-react';

interface HeroGridProps {
  pickedOrBannedIds: string[];
  onSelectHero: (hero: Hero) => void;
  activeSlotInfo: string | null;
}

export const HeroGrid: React.FC<HeroGridProps> = ({
  pickedOrBannedIds,
  onSelectHero,
  activeSlotInfo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filteredHeroes = HOK_HEROES.filter(hero => {
    const matchesSearch = hero.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All' || hero.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Roam': return 'bg-emerald-600';
      case 'Clash': return 'bg-amber-600';
      case 'Mid': return 'bg-purple-600';
      case 'Farm': return 'bg-blue-600';
      case 'Jungle': return 'bg-rose-600';
      default: return 'bg-slate-600';
    }
  };

  const getInitials = (name: string) => {
    const parts = name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <h2 className="font-bold text-lg text-slate-100">Katalog Hero</h2>
          {activeSlotInfo && (
            <span className="text-xs bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-md font-medium">
              Aktif: {activeSlotInfo}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari hero..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 border-b border-slate-800">
        {['All', 'Roam', 'Clash', 'Mid', 'Farm', 'Jungle'].map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              selectedRole === role
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Hero Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[360px] overflow-y-auto pr-1">
        {filteredHeroes.map((hero) => {
          const isDisabled = pickedOrBannedIds.includes(hero.id);
          const hasFailed = failedImages[hero.id];

          return (
            <div
              key={hero.id}
              onClick={() => !isDisabled && onSelectHero(hero)}
              className={`relative rounded-xl p-2 flex flex-col items-center transition-all ${
                isDisabled
                  ? 'opacity-40 grayscale cursor-not-allowed bg-slate-950/40 border border-slate-800'
                  : 'bg-slate-800/80 border border-slate-700/80 hover:border-amber-400 hover:scale-105 cursor-pointer shadow-md'
              }`}
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-700 mb-1.5 border border-slate-600 flex items-center justify-center">
                {!hasFailed ? (
                  <img
                    src={hero.avatarUrl}
                    alt={hero.name}
                    className="w-full h-full object-cover"
                    onError={() => {
                      setFailedImages(prev => ({ ...prev, [hero.id]: true }));
                    }}
                  />
                ) : (
                  <div className={`w-full h-full flex flex-col items-center justify-center text-white font-bold text-sm ${getRoleColor(hero.role)}`}>
                    <span>{getInitials(hero.name)}</span>
                  </div>
                )}
                <span className="absolute bottom-0.5 right-0.5 bg-slate-950/80 text-[9px] px-1 py-0.2 rounded text-amber-400 font-bold">
                  {hero.role}
                </span>
              </div>
              <span className="font-medium text-xs text-slate-200 text-center truncate w-full">
                {hero.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
