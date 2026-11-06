import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DraftState } from './types/draft';
import { HOK_HEROES, Hero } from './data/hokHeroes';
import { DraftBoard } from './components/DraftBoard';
import { CounterRecommendations } from './components/CounterRecommendations';
import { TeamSynergyPanel } from './components/TeamSynergyPanel';
import { ItemCounterPanel } from './components/ItemCounterPanel';
import { LandingPage } from './components/LandingPage';
import { DashboardLayout } from './components/DashboardLayout';
import { RotateCcw, Swords, Shield, Globe } from 'lucide-react';
import { HOK_ITEM_COUNTERS } from './data/hokItems';
import { FloatingHeroPicker } from './components/FloatingHeroPicker';

// Generate strategy summary text using locale
const generateStrategySummary = (draftState: DraftState, t: (key: string, options?: any) => string) => {
  const enemyPickedIds = draftState.redTeam.filter((id): id is string => id !== null);
  const allyPickedIds = draftState.blueTeam.filter((id): id is string => id !== null);
  const heroById: Record<string, Hero> = {};
  HOK_HEROES.forEach(h => { heroById[h.id] = h; });

  const allyNames = allyPickedIds.map(id => heroById[id]?.name || 'Unknown').filter(Boolean);
  const enemyNames = enemyPickedIds.map(id => heroById[id]?.name || 'Unknown').filter(Boolean);

  const ROLES: Hero['role'][] = ['Roam', 'Clash', 'Mid', 'Farm', 'Jungle'];
  const unavailableHeroIds: string[] = [];
  for (const id of [...draftState.blueTeam, ...draftState.redTeam, ...draftState.blueBans, ...draftState.redBans]) {
    if (id) unavailableHeroIds.push(id);
  }

  const counterScore = 40;
  const vulnerabilityPenalty = 20;
  const recommendationsPerRole = {} as Record<string, Array<any>>;

  ROLES.forEach(role => {
    const candidates = HOK_HEROES.filter(
      (hero: Hero) => hero.role === role && !unavailableHeroIds.includes(hero.id)
    );
    const scored: any[] = [];
    candidates.forEach(candidate => {
      let score = 0;
      const matchedEnemies: string[] = [];
      const tacticalReasons: string[] = [];
      for (const enemyId of enemyPickedIds) {
        const enemy = heroById[enemyId];
        if (!enemy) continue;
        const counterEntry = enemy.counteredBy?.find((e: any) => e.id === candidate.id);
        const isCounter = Boolean(counterEntry) || (candidate.counters && candidate.counters.includes(enemy.id));
        if (isCounter) {
          score += counterScore;
          matchedEnemies.push(enemy.name);
          if (counterEntry?.reason) tacticalReasons.push(counterEntry.reason);
        }
        const vulnerability = candidate.counteredBy?.find((e: any) => e.id === enemy.id);
        if (vulnerability) {
          score -= vulnerabilityPenalty;
          tacticalReasons.push(`Rentan vs ${enemy.name}`);
        }
      }
      if (matchedEnemies.length > 1) score += 10 * (matchedEnemies.length - 1);
      if (score <= 0) return;
      const fallbackReason = matchedEnemies.length > 0
        ? `Efektif melawan ${matchedEnemies.join(' & ')}`
        : `Sinergi dengan tim`;
      scored.push({ hero: candidate, score, reason: tacticalReasons[0] ?? fallbackReason });
    });
    scored.sort((a: any, b: any) => b.score - a.score || a.hero.name.localeCompare(b.hero.name, 'en'));
    recommendationsPerRole[role] = scored.slice(0, 3);
  });

  const itemPriorities = HOK_ITEM_COUNTERS.filter(item => {
    if (item.category === 'anti-heal') {
      return enemyNames.some(l => l.toLowerCase().includes('cai-yan') || l.toLowerCase().includes('dyadia') || l.toLowerCase().includes('ao-yin') || l.toLowerCase().includes('yang-jian') || l.toLowerCase().includes('fuzi'));
    }
    if (item.category === 'anti-physical-burst') {
      return enemyNames.some(l => l.toLowerCase().includes('lu-bu') || l.toLowerCase().includes('butterfly') || l.toLowerCase().includes('arthur'));
    }
    if (item.category === 'anti-magic-burst') {
      return enemyNames.some(l => l.toLowerCase().includes('angela') || l.toLowerCase().includes('daji') || l.toLowerCase().includes('mai-shiranui'));
    }
    if (item.category === 'anti-shield') {
      return enemyNames.some(l => l.toLowerCase().includes('zhang-fei') || l.toLowerCase().includes('dun'));
    }
    return false;
  });

  const categoryPriority: Record<string, number> = { 'anti-heal': 1, 'anti-magic-burst': 2, 'anti-physical-burst': 3, 'anti-shield': 4 };
  itemPriorities.sort((a, b) => (categoryPriority[a.category] ?? 99) - (categoryPriority[b.category] ?? 99));
  const topItems = itemPriorities.slice(0, 5);

  const lines: string[] = [];
  lines.push(t('strategySummary.header'));
  lines.push('');
  lines.push(t('strategySummary.teamComposition'));
  lines.push(t('strategySummary.ourTeam', { heroes: allyNames.length > 0 ? allyNames.join(', ') : t('strategySummary.noHeroesPicked') }));
  lines.push(t('strategySummary.enemyTeam', { heroes: enemyNames.length > 0 ? enemyNames.join(', ') : t('strategySummary.noHeroesPicked') }));
  lines.push('');
  lines.push(t('strategySummary.counterRecommendations'));
  ROLES.forEach(role => {
    const recs = recommendationsPerRole[role];
    if (recs && recs.length > 0) {
      lines.push(`(${role}) ${recs.slice(0, 3).map((r: any) => r.hero.name).join(', ')}`);
      recs.slice(0, 3).forEach((r: any, i) => { lines.push(`  ${i + 1}. ${r.hero.name}: ${r.reason}`); });
    }
  });
  lines.push('');
  lines.push(t('strategySummary.itemCounterPriority'));
  if (topItems.length === 0) {
    lines.push(t('strategySummary.noItemCounter'));
  } else {
    topItems.forEach((item, idx) => {
      const desc = t(`items.${item.descriptionKey}`, { defaultValue: item.name });
      lines.push(`${idx + 1}. ${item.name} (${t(`itemCounterPanel.categories.${item.category}`)}): ${desc}`);
    });
  }
  lines.push('');
  lines.push(t('strategySummary.footer'));
  return lines.join('\n');
};

// ─── Draft Simulator Content ────────────────────────────────────────────────
function DraftSimulatorContent() {
  const { t, i18n } = useTranslation();

  const [pickerOpen, setPickerOpen] = useState(false);

  const [draftState, setDraftState] = useState<DraftState>({
    blueTeam: [null, null, null, null, null],
    redTeam: [null, null, null, null, null],
    blueBans: [null, null, null],
    redBans: [null, null, null],
    activeSlot: { side: 'blue', type: 'pick', index: 0 },
  });

  const handleSelectSlot = (side: 'blue' | 'red', type: 'pick' | 'ban', index: number) => {
    setDraftState(prev => ({ ...prev, activeSlot: { side, type, index } }));
    setPickerOpen(true);
  };

  const handleRemoveHero = (side: 'blue' | 'red', type: 'pick' | 'ban', index: number) => {
    setDraftState(prev => {
      const newState = { ...prev };
      if (type === 'pick') {
        if (side === 'blue') { newState.blueTeam = [...newState.blueTeam]; newState.blueTeam[index] = null; }
        else { newState.redTeam = [...newState.redTeam]; newState.redTeam[index] = null; }
      } else {
        if (side === 'blue') { newState.blueBans = [...newState.blueBans]; newState.blueBans[index] = null; }
        else { newState.redBans = [...newState.redBans]; newState.redBans[index] = null; }
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
        if (side === 'blue') { newState.blueTeam = [...newState.blueTeam]; newState.blueTeam[index] = hero.id; }
        else { newState.redTeam = [...newState.redTeam]; newState.redTeam[index] = hero.id; }
      } else {
        if (side === 'blue') { newState.blueBans = [...newState.blueBans]; newState.blueBans[index] = hero.id; }
        else { newState.redBans = [...newState.redBans]; newState.redBans[index] = hero.id; }
      }
      // Auto-advance active slot
      const nextIndex = index + 1;
      const maxIndex = type === 'pick' ? 4 : 2;
      if (nextIndex <= maxIndex) newState.activeSlot = { side, type, index: nextIndex };
      return newState;
    });
  };

  const handleSelectHeroForActiveSlot = (heroId: string) => {
    if (!draftState.activeSlot) return;
    // If no active slot on blue side, find next empty blue pick slot
    const slot = draftState.activeSlot;
    if (slot.side !== 'blue' || slot.type !== 'pick') {
      // Find next empty blue pick slot
      const nextEmpty = draftState.blueTeam.findIndex(id => id === null);
      if (nextEmpty !== -1) {
        setDraftState(prev => ({ ...prev, activeSlot: { side: 'blue', type: 'pick', index: nextEmpty } }));
        // Then select after state update — use a callback approach
        setTimeout(() => {
          const hero = HOK_HEROES.find((h: Hero) => h.id === heroId);
          if (hero) {
            setDraftState(prev => {
              if (!prev.activeSlot || prev.activeSlot.side !== 'blue' || prev.activeSlot.type !== 'pick') return prev;
              const newState = { ...prev };
              newState.blueTeam = [...newState.blueTeam];
              newState.blueTeam[prev.activeSlot.index] = hero.id;
              const ni = prev.activeSlot.index + 1;
              if (ni <= 4) newState.activeSlot = { side: 'blue', type: 'pick', index: ni };
              return newState;
            });
          }
        }, 0);
        return;
      }
      return;
    }
    const hero = HOK_HEROES.find((h: Hero) => h.id === heroId);
    if (hero) handleSelectHero(hero);
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

  const handleChangeLanguage = (lng: 'en' | 'id') => { i18n.changeLanguage(lng); };

  const pickedOrBannedIds = [
    ...draftState.blueTeam,
    ...draftState.redTeam,
    ...draftState.blueBans,
    ...draftState.redBans,
  ].filter((id): id is string => id !== null);

  const activeSlotLabel = draftState.activeSlot
    ? `${draftState.activeSlot.side === 'blue' ? t('header.blueSide') : t('header.redSide')} (${draftState.activeSlot.type.toUpperCase()} #${draftState.activeSlot.index + 1})`
    : null;

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try { document.execCommand('copy'); } catch (err) { console.error('Failed to copy text', err); }
    document.body.removeChild(textArea);
  };

  return (
    <div className="min-h-full bg-slate-900 text-slate-100 p-4 md:p-6 flex flex-col gap-6">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/40 p-2.5 rounded-xl">
            <Swords className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
              {t('app.title')}
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-0.5">{t('app.subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl p-1">
            <Globe className="w-4 h-4 text-slate-400 ml-2" />
            <button
              onClick={() => handleChangeLanguage('en')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${i18n.language === 'en' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30' : 'text-slate-300 hover:text-slate-100'}`}
              title="English"
            >EN</button>
            <button
              onClick={() => handleChangeLanguage('id')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${i18n.language === 'id' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30' : 'text-slate-300 hover:text-slate-100'}`}
              title="Indonesia"
            >ID</button>
          </div>
          <button
            id="copy-summary-btn"
            onClick={async () => {
              const summary = generateStrategySummary(draftState, t);
              try {
                await navigator.clipboard.writeText(summary);
                const btn = document.getElementById('copy-summary-btn') as HTMLButtonElement;
                const originalText = btn.textContent;
                btn.textContent = t('common.copied');
                btn.className = btn.className + ' bg-emerald-500 text-slate-950';
                setTimeout(() => {
                  btn.textContent = originalText;
                  btn.className = btn.className.replace(' bg-emerald-500 text-slate-950', '');
                }, 2000);
              } catch {
                fallbackCopyToClipboard(generateStrategySummary(draftState, t));
              }
            }}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md"
            title={t('app.copySummary')}
          >
            <Shield className="w-4 h-4" />
            <span>{t('app.copySummary')}</span>
          </button>
          <button
            onClick={handleResetDraft}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md"
            title={t('common.reset')}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('common.reset')}</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-none px-4 md:px-8 flex flex-col gap-6">
        <DraftBoard draftState={draftState} onSelectSlot={handleSelectSlot} onRemoveHero={handleRemoveHero} />
        <FloatingHeroPicker open={pickerOpen} excludedIds={pickedOrBannedIds} onClose={() => setPickerOpen(false)} onSelect={hero => { handleSelectHero(hero); setPickerOpen(false); }} />
        <CounterRecommendations draftState={draftState} onSelectHeroForActiveSlot={handleSelectHeroForActiveSlot} />

        <div className="my-2 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{t('synergyPanel.title')}</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        </div>

        <TeamSynergyPanel draftState={draftState} onSelectHeroForActiveSlot={handleSelectHeroForActiveSlot} />
        <ItemCounterPanel draftState={draftState} />
      </main>
    </div>
  );
}

// ─── App Root ────────────────────────────────────────────────────────────────
export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');

  if (currentView === 'landing') {
    return <LandingPage onEnterDashboard={() => setCurrentView('dashboard')} />;
  }

  return (
    <DashboardLayout>
      <DraftSimulatorContent />
    </DashboardLayout>
  );
}
