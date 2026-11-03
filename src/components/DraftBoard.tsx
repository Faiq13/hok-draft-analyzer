import React from 'react';
import { HOK_HEROES, Hero } from '../data/hokHeroes';
import { DraftState } from '../types/draft';
import { XCircle, UserCheck } from 'lucide-react';
import { HeroAvatar } from './HeroAvatar';

interface DraftBoardProps {
  draftState: DraftState;
  onSelectSlot: (side: 'blue' | 'red', type: 'pick' | 'ban', index: number) => void;
  onRemoveHero: (side: 'blue' | 'red', type: 'pick' | 'ban', index: number) => void;
}

export const DraftBoard: React.FC<DraftBoardProps> = ({
  draftState,
  onSelectSlot,
  onRemoveHero,
}) => {
  const getHero = (id: string | null): Hero | undefined => {
    if (!id) return undefined;
    return HOK_HEROES.find(h => h.id === id);
  };

  const isActive = (side: 'blue' | 'red', type: 'pick' | 'ban', index: number) => {
    return (
      draftState.activeSlot?.side === side &&
      draftState.activeSlot?.type === type &&
      draftState.activeSlot?.index === index
    );
  };

  const renderSlot = (side: 'blue' | 'red', type: 'pick' | 'ban', index: number) => {
    const id = type === 'pick' 
      ? (side === 'blue' ? draftState.blueTeam[index] : draftState.redTeam[index])
      : (side === 'blue' ? draftState.blueBans[index] : draftState.redBans[index]);
    
    const hero = getHero(id);
    const active = isActive(side, type, index);

    return (
      <div
        key={`${side}-${type}-${index}`}
        onClick={() => onSelectSlot(side, type, index)}
        className={`relative rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center overflow-hidden ${
          type === 'ban' ? 'h-14 w-14' : 'h-20 w-full sm:h-24'
        } ${
          active
            ? 'border-amber-400 shadow-lg shadow-amber-400/30 scale-105 animate-pulse'
            : hero
            ? 'border-slate-600 bg-slate-800'
            : 'border-dashed border-slate-700 bg-slate-900/50 hover:border-slate-500'
        }`}
      >
        {hero ? (
          <>
            <HeroAvatar
              hero={hero}
              className="w-full h-full"
              initialsClassName="text-xs"
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-1">
              <span className="text-[11px] font-semibold text-white truncate w-full text-center">
                {hero.name}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveHero(side, type, index);
              }}
              className="absolute top-1 right-1 bg-slate-900/80 text-rose-400 hover:text-rose-300 rounded-full p-0.5"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500">
            {type === 'ban' ? (
              <span className="text-xs font-bold text-rose-500/70">BAN {index + 1}</span>
            ) : (
              <>
                <UserCheck className="w-5 h-5 mb-1 opacity-40" />
                <span className="text-[10px] uppercase tracking-wider opacity-60">Pick {index + 1}</span>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
      {/* Blue Team (Tim Kita) */}
      <div className="bg-blue-950/20 border border-blue-900/40 rounded-xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-blue-900/50 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
            <h2 className="font-bold text-blue-400 text-lg">Blue Side (Tim Kita)</h2>
          </div>
          <span className="text-xs bg-blue-900/50 text-blue-300 px-2.5 py-1 rounded-full font-medium">
            Pilih Hero Anda
          </span>
        </div>

        {/* Bans */}
        <div>
          <span className="text-xs font-semibold text-slate-400 mb-1.5 block">Bans Tim Kita</span>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => renderSlot('blue', 'ban', i))}
          </div>
        </div>

        {/* Picks */}
        <div>
          <span className="text-xs font-semibold text-slate-400 mb-1.5 block">Picks Tim Kita (5 Slot)</span>
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4].map((i) => renderSlot('blue', 'pick', i))}
          </div>
        </div>
      </div>

      {/* Red Team (Tim Lawan) */}
      <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-rose-900/50 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
            <h2 className="font-bold text-rose-400 text-lg">Red Side (Tim Lawan)</h2>
          </div>
          <span className="text-xs bg-rose-900/50 text-rose-300 px-2.5 py-1 rounded-full font-medium">
            Pilih Hero Lawan
          </span>
        </div>

        {/* Bans */}
        <div>
          <span className="text-xs font-semibold text-slate-400 mb-1.5 block">Bans Tim Lawan</span>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => renderSlot('red', 'ban', i))}
          </div>
        </div>

        {/* Picks */}
        <div>
          <span className="text-xs font-semibold text-slate-400 mb-1.5 block">Picks Tim Lawan (5 Slot)</span>
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4].map((i) => renderSlot('red', 'pick', i))}
          </div>
        </div>
      </div>
    </div>
  );
};
