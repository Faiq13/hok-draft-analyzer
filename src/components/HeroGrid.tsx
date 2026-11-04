import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HOK_HEROES, Hero } from '../data/hokHeroes';
import { Search } from 'lucide-react';
import { HeroAvatar } from './HeroAvatar';

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
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>(t('heroCatalog.allRoles'));

  const filteredHeroes = HOK_HEROES.filter(hero => {
    const matchesSearch = hero.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === t('heroCatalog.allRoles') || hero.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <h2 className="font-bold text-lg text-slate-100">{t('heroCatalog.title')}</h2>
          {activeSlotInfo && (
            <span className="text-xs bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-md font-medium">
              {t('heroCatalog.activeSlot', { slot: activeSlotInfo })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('heroCatalog.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Instruction text */}
      <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <p className="text-sm text-amber-300 text-center font-medium">
          {t('heroCatalog.instruction')}
        </p>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 border-b border-slate-800">
        {[t('heroCatalog.allRoles'), 'Roam', 'Clash', 'Mid', 'Farm', 'Jungle'].map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              selectedRole === role
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {role === t('heroCatalog.allRoles') ? role : t(`roles.${role}`)}
          </button>
        ))}
      </div>

      {/* Hero Grid - compact responsive layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pr-0">
        {filteredHeroes.map((hero) => {
          const isDisabled = pickedOrBannedIds.includes(hero.id);

          return (
            <div
              key={hero.id}
              onClick={() => !isDisabled && onSelectHero(hero)}
              className={`relative rounded-lg p-1.5 flex flex-col items-center transition-all ${
                isDisabled
                  ? 'opacity-40 grayscale cursor-not-allowed bg-slate-950/40 border border-slate-800'
                  : 'bg-slate-800/70 border border-slate-700/60 hover:border-amber-400 hover:scale-105 cursor-pointer shadow-sm'
              }`}
            >
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-700 mb-1 border border-slate-600 flex items-center justify-center">
                <HeroAvatar
                  hero={hero}
                  className="w-full h-full"
                  initialsClassName="text-sm"
                />
                <span className="absolute bottom-0.5 right-0.5 bg-slate-950/80 text-[8px] px-0.5 py-0.1 rounded text-amber-400 font-bold">
                  {t(`roles.${hero.role}`)}
                </span>
              </div>
              <span className="font-medium text-[9px] text-slate-200 text-center truncate w-full">
                {hero.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};