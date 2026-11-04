import React from 'react';
import { useTranslation } from 'react-i18next';
import { HOK_HEROES, Hero } from '../data/hokHeroes';
import { DraftState } from '../types/draft';
import { Sparkles } from 'lucide-react';
import { HeroAvatar } from './HeroAvatar';

interface CounterRecommendationsProps {
  draftState: DraftState;
  onSelectHeroForActiveSlot: (heroId: string) => void;
}

interface RecommendationItem {
  hero: Hero;
  score: number;
  reason: string;
  fullReason: string;
  matchedEnemies: string[];
  matchedAllies: string[];
  counterReasons: string[];
  vulnerabilityReasons: string[];
}

const ROLES: Hero['role'][] = ['Roam', 'Clash', 'Mid', 'Farm', 'Jungle'];

const COUNTER_SCORE = 40;
const SYNERGY_SCORE = 20;
const VULNERABILITY_PENALTY = 20;

const heroById = new Map(HOK_HEROES.map(hero => [hero.id, hero]));

// Helper to get localized tactical reason
function getLocalizedReason(t: (key: string, options?: any) => string, heroId: string, targetId: string, type: string) {
  const path = `tactical.${type}s.${heroId}.${targetId}`;
  return t(path, { defaultValue: '' });
}

export const CounterRecommendations: React.FC<CounterRecommendationsProps> = ({
  draftState,
  onSelectHeroForActiveSlot,
}) => {
  const { t } = useTranslation();
  const enemyPickedIds = draftState.redTeam.filter((id): id is string => id !== null);
  const allyPickedIds = draftState.blueTeam.filter((id): id is string => id !== null);

  // Hero yang sudah dipick atau dibanned kedua tim tidak boleh muncul lagi.
  const unavailableIds = new Set(
    [
      ...draftState.blueTeam,
      ...draftState.redTeam,
      ...draftState.blueBans,
      ...draftState.redBans,
    ].filter((id): id is string => id !== null)
  );

  const recommendationsPerRole = {} as Record<Hero['role'], RecommendationItem[]>;

  ROLES.forEach(role => {
    const candidates = HOK_HEROES.filter(
      hero => hero.role === role && !unavailableIds.has(hero.id)
    );

    const scored: RecommendationItem[] = [];

    candidates.forEach(candidate => {
      let score = 0;
      const matchedEnemies: string[] = [];
      const matchedAllies: string[] = [];
      const counterReasons: string[] = [];
      const vulnerabilityReasons: string[] = [];

      // STRICT: Only check COUNTERS against enemy picks (Red Side)
      // This panel ONLY shows heroes that counter enemy heroes
      for (const enemyId of enemyPickedIds) {
        const enemy = heroById.get(enemyId);
        if (!enemy) continue;

        // Check if candidate counters this enemy
        const counterEntry = enemy.counteredBy.find(entry => entry.id === candidate.id);
        const isCounter = Boolean(counterEntry) || candidate.counters.includes(enemy.id);

        if (isCounter) {
          score += COUNTER_SCORE;
          matchedEnemies.push(enemy.name);
          // Use localized reason if available
          const localizedReason = getLocalizedReason(t, enemyId, candidate.id, 'counter');
          if (localizedReason) {
            counterReasons.push(localizedReason);
          } else if (counterEntry?.reason) {
            counterReasons.push(counterEntry.reason);
          }
        }

        // Check vulnerability (enemy counters candidate) - for transparency
        const vulnerability = candidate.counteredBy.find(entry => entry.id === enemy.id);
        if (vulnerability) {
          score -= VULNERABILITY_PENALTY;
          vulnerabilityReasons.push(`Rentan vs ${enemy.name}`);
          const localizedVuln = getLocalizedReason(t, candidate.id, enemyId, 'counter');
          if (localizedVuln) {
            vulnerabilityReasons.push(localizedVuln);
          } else if (vulnerability.reason) {
            vulnerabilityReasons.push(vulnerability.reason);
          }
        }
      }

      // DO NOT include synergy with allies in Counter panel - that's for Synergy panel only
      // This ensures strict separation

      // Prioritaskan hero yang menjawab lebih dari satu pick musuh.
      if (matchedEnemies.length > 1) {
        score += 10 * (matchedEnemies.length - 1);
      }

      // Only show if has actual counter value (score > 0 from counters)
      const hasCounterValue = matchedEnemies.length > 0;
      if (!hasCounterValue || score <= 0) return;

      const fullReasonParts = [
        matchedEnemies.length > 0 ? `Counter: ${matchedEnemies.join(', ')}` : '',
        ...counterReasons,
        ...vulnerabilityReasons,
      ].filter(Boolean);

      const fallbackReason = matchedEnemies.length > 0
        ? t('counterPanel.effectiveAgainst', { enemies: matchedEnemies.join(' & ') })
        : t('counterPanel.synergyWithTeam');

      scored.push({
        hero: candidate,
        score,
        reason: counterReasons[0] ?? fallbackReason,
        fullReason: fullReasonParts.join(' • '),
        matchedEnemies,
        matchedAllies,
        counterReasons,
        vulnerabilityReasons,
      });
    });

    scored.sort((a, b) => b.score - a.score || a.hero.name.localeCompare(b.hero.name, 'en'));
    recommendationsPerRole[role] = scored.slice(0, 3);
  });

  const getCounterBadge = (matchedEnemies: string[]) => {
    if (matchedEnemies.length === 0) return null;
    const isMulti = matchedEnemies.length > 1;
    const badgeClass = isMulti
      ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50";
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold ${badgeClass}`}>
        <span className="font-semibold">{t('counterPanel.counterBadge')}</span>
        {matchedEnemies.map((name, i) => {
          if (i > 0) return <span key={`sep-${i}`}>& </span>;
          return <span key={i} className="hover:underline">{name}</span>;
        })}
      </span>
    );
  };

  const renderRoleColumn = (role: Hero['role'], recommendations: RecommendationItem[]) => (
    <div key={role} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
        <span className="font-bold text-sm text-amber-400">{t(`roles.${role}`)}</span>
        <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{t('counterPanel.title').split(' ')[0]}</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {recommendations.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-4 text-center bg-slate-900/40 rounded-lg border border-slate-800">
            {t('counterPanel.noSpecificCounter')}
          </div>
        ) : (
          recommendations.map((item, idx) => (
            <div
              key={item.hero.id}
              onClick={() => {
                if (draftState.activeSlot && draftState.activeSlot.side === 'blue') {
                  onSelectHeroForActiveSlot(item.hero.id);
                }
              }}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-2 flex items-center gap-2.5 cursor-pointer transition-all group"
            >
              <HeroAvatar
                hero={item.hero}
                className="w-10 h-10 rounded-md flex-shrink-0 border border-slate-600 group-hover:border-amber-400"
                initialsClassName="text-[10px]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-semibold text-xs text-white truncate">{item.hero.name}</h4>
                  <span className="text-[10px] text-emerald-400 font-bold">#{idx + 1}</span>
                </div>

                {getCounterBadge(item.matchedEnemies)}

                <p
                  className="text-[10px] text-slate-400 line-clamp-none leading-snug"
                  title={item.fullReason}
                >
                  {item.reason}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <h2 className="font-bold text-lg text-slate-100">{t('counterPanel.title')}</h2>
      </div>

      {enemyPickedIds.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm space-y-1">
          {draftState.activeSlot ? (
            <>
              <p className="font-semibold text-amber-400">{t('counterPanel.waitingForActiveSlot', { side: draftState.activeSlot.side === 'blue' ? t('header.blueSide') : t('header.redSide') })}</p>
              <p>{draftState.activeSlot.side === 'red' ? t('counterPanel.waitingForEnemyPick') : t('counterPanel.waitingForOurPick')}</p>
            </>
          ) : (
            <p>{t('counterPanel.waitingForEnemy')}</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {ROLES.map(role => renderRoleColumn(role, recommendationsPerRole[role] || []))}
        </div>
      )}
    </div>
  );
};