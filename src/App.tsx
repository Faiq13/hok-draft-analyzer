import React, { useState } from 'react';
import { DraftState } from './types/draft';
import { HOK_HEROES, Hero } from './data/hokHeroes';
import { DraftBoard } from './components/DraftBoard';
import { HeroGrid } from './components/HeroGrid';
import { CounterRecommendations } from './components/CounterRecommendations';
import { TeamSynergyPanel } from './components/TeamSynergyPanel';
import { ItemCounterPanel } from './components/ItemCounterPanel';
import { RotateCcw, Swords, Shield } from 'lucide-react';
import { HOK_ITEM_COUNTERS } from './data/hokItems';

// --- Language state & transliteration ---
type Language = 'EN' | 'ID';

const idDictionary: Record<string, string> = {
  // Counter reasons
  "still holds a second leap": "Masih memiliki lonjakan kedua",
  "holds a second leap once Agudo has spent her only roll": "Masih memiliki lonjakan kedua setelah Agudo telah menghabiskan gulirannya",
  "drags Agudo in": "Tarik Agudo ke dalam",
  "Prey mark adds true damage": "Tanda Perjuangan menambahkan damage sejati",
  "cannot be targeted during his ultimate": "Tidak dapat ditarget selama ultimate-nya",
  "Frag Grenade slows hard": "Grenade pelan keras",
  "Ultimate Shell is far harder to dodge": "Ultimate Shell jauh lebih sulit dielakkan",
  "poison pool slows": "Kolam racun pelan",
  "much harder to dodge": "Sulit dielakkan",
  "shield covers": "Perlindungan menutup",
  "can stay on the front line": "Bisa tetap berada di lini depan",
  "keep landing Basic Attacks": "Landing serangan dasar",
  "attacks find nothing at all": "Serangan tidak menemukan apa-apa",
  "Rentan vs": "Rentan vs",
  "synergy": "sinergi",
  "attach": "menempel",
  "shield and stays untargetable": "melindungi dan tidak dapat ditarget",
  "follows him straight through his dashes": "mengikuti langsung melalui dash-nya",
  "pull enemies into one stunned cluster": "Taruh lawan ke dalam cluster yang terkaget",
  "area shots hit the whole group": "Menembak area menebak seluruh kelompok",
  "buys him exactly that time": "membeli waktu yang tepat itu",
  "shields the target": "melindungi target",
  "grows thickest on a Health-stacking": "mempercatat pada penumpang Health-stacking",
  "taunt buys her exactly that time": "menyuari membeli waktu yang tepat itu",
  "pulls enemies into one pile": "Mengelompokkan lawan",
  "stuns them": "mengkagetkan mereka",
  "keeps enemies from escaping": "Menjaga lawan dari melarikan diri",
  // Synergy reasons
  "slow keeps enemies from escaping": "Pelan menjaga lawan dari melarikan diri",
  "keeps Tune of Tranquility's heal and defense": "Menjaga penyembuhan dan pertahanan Tune of Tranquility",
};

const transliterate = (text: string, language: Language): string => {
  if (language === 'EN') return text;

  // Check for exact matches first
  for (const [key, value] of Object.entries(idDictionary)) {
    if (text.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // If no match, generate a brief Indonesian summary
  const sentences = text.split('.').filter(s => s.trim().length > 0);
  if (sentences.length > 0) {
    return sentences[0].trim() + (sentences[0].trim().endsWith('.') ? '' : '.');
  }
  return text;
};

export default function App() {
  const [draftState, setDraftState] = useState<DraftState>({
    blueTeam: [null, null, null, null, null],
    redTeam: [null, null, null, null, null],
    blueBans: [null, null, null],
    redBans: [null, null, null],
    activeSlot: { side: 'blue', type: 'pick', index: 0 },
  });

  const [language, setLanguage] = useState<Language>('EN');

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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage('EN')}
            className={`flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md ${language === 'EN' ? 'border-amber-400 text-amber-400' : ''}`}
            title="English"
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('ID')}
            className={`flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md ${language === 'ID' ? 'border-amber-400 text-amber-400' : ''}`}
            title="Indonesia"
          >
            ID
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full flex flex-col gap-6">
        <CounterRecommendations
          draftState={draftState}
          onSelectHeroForActiveSlot={(heroId) => {
            const hero = HOK_HEROES.find((h: Hero) => h.id === heroId);
            if (hero) handleSelectHero(hero);
          }}
          language={language}
          transliterate={(text: string) => transliterate(text, language)}
        />

      {/* Team Synergy Panel - di bawah Counter Recommendations */}
      <TeamSynergyPanel
        draftState={draftState}
        language={language}
        transliterate={(text: string) => transliterate(text, language)}
      />

      {/* Item Counter Panel - di bagian bawah dashboard */}
      <ItemCounterPanel
        draftState={draftState}
        language={language}
        transliterate={(text: string) => transliterate(text, language)}
      />

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <HeroGrid
            pickedOrBannedIds={pickedOrBannedIds}
            onSelectHero={handleSelectHero}
            activeSlotInfo={activeSlotLabel}
          />
        </div>
      </main>
    </div>
  );
}