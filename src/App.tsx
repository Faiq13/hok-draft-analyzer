import React, { useState } from 'react';
import { DraftState } from './types/draft';
import { HOK_HEROES, Hero } from './data/hokHeroes';
import { DraftBoard } from './components/DraftBoard';
import { HeroGrid } from './components/HeroGrid';
import { CounterRecommendations } from './components/CounterRecommendations';
import { RotateCcw, Swords, Shield } from 'lucide-react';

export default function App() {
  const [draftState, setDraftState] = useState<DraftState>({
    blueTeam: [null, null, null, null, null],
    redTeam: [null, null, null, null, null],
    blueBans: [null, null, null],
    redBans: [null, null, null],
    activeSlot: { side: 'blue', type: 'pick', index: 0 },
  });

  const handleSelectSlot = (side: 'blue' | 'red', type: 'pick' | 'ban', index: number) => {
    setDraftState(prev => ({
      ...prev,
      activeSlot: { side, type, index },
    }));
  };

  const handleRemoveHero = (side: 'blue' | 'red', type: 'pick' | 'ban', index: number) => {
    setDraftState(prev => {
      const newState = { ...prev };
      if (type === 'pick') {
        if (side === 'blue') {
          newState.blueTeam = [...newState.blueTeam];
          newState.blueTeam[index] = null;
        } else {
          newState.redTeam = [...newState.redTeam];
          newState.redTeam[index] = null;
        }
      } else {
        if (side === 'blue') {
          newState.blueBans = [...newState.blueBans];
          newState.blueBans[index] = null;
        } else {
          newState.redBans = [...newState.redBans];
          newState.redBans[index] = null;
        }
      }
      return newState;
    });
  };

  const handleSelectHero = (hero: Hero) => {
    if (!draftState.activeSlot) return;

    const { side, type, index } = draftState.activeSlot;

    setDraftState(prev => {
      const newState = { ...prev };
      if (type === 'pick') {
        if (side === 'blue') {
          newState.blueTeam = [...newState.blueTeam];
          newState.blueTeam[index] = hero.id;
        } else {
          newState.redTeam = [...newState.redTeam];
          newState.redTeam[index] = hero.id;
        }
      } else {
        if (side === 'blue') {
          newState.blueBans = [...newState.blueBans];
          newState.blueBans[index] = hero.id;
        } else {
          newState.redBans = [...newState.redBans];
          newState.redBans[index] = null; // wait
          newState.redBans = [...newState.redBans];
          newState.redBans[index] = hero.id;
        }
      }

      // Auto advance active slot to the next empty slot in same category
      let nextIndex = index + 1;
      const maxIndex = type === 'pick' ? 4 : 2;
      if (nextIndex <= maxIndex) {
        newState.activeSlot = { side, type, index: nextIndex };
      }

      return newState;
    });
  };

  const handleResetDraft = () => {
    setDraftState({
      blueTeam: [null, null, null, null, null],
      redTeam: [null, null, null, null, null],
      blueBans: [null, null, null],
      redBans: [null, null, null],
      activeSlot: { side: 'blue', type: 'pick', index: 0 },
    });
  };

  const pickedOrBannedIds = [
    ...draftState.blueTeam,
    ...draftState.redTeam,
    ...draftState.blueBans,
    ...draftState.redBans,
  ].filter((id): id is string => id !== null);

  const activeSlotLabel = draftState.activeSlot
    ? `${draftState.activeSlot.side === 'blue' ? 'Blue Side' : 'Red Side'} (${draftState.activeSlot.type.toUpperCase()} #${draftState.activeSlot.index + 1})`
    : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 flex flex-col gap-6">
      <header className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/40 p-2.5 rounded-xl">
            <Swords className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
              HoK Draft & Counter Analyzer
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-0.5">
              Simulator Draftpick 5v5 & Algoritma Rekomendasi Counter Taktis
            </p>
          </div>
        </div>

        <button
          onClick={handleResetDraft}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md hover:border-amber-400"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          Reset Draft
        </button>
      </header>

      <main className="max-w-7xl mx-auto w-full flex flex-col gap-6">
        <DraftBoard
          draftState={draftState}
          onSelectSlot={handleSelectSlot}
          onRemoveHero={handleRemoveHero}
        />

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <CounterRecommendations
            draftState={draftState}
            onSelectHeroForActiveSlot={(heroId) => {
              const hero = HOK_HEROES.find((h: Hero) => h.id === heroId);
              if (hero) handleSelectHero(hero);
            }}
          />
        </div>

        <HeroGrid
          pickedOrBannedIds={pickedOrBannedIds}
          onSelectHero={handleSelectHero}
          activeSlotInfo={activeSlotLabel}
        />
      </main>
    </div>
  );
}
