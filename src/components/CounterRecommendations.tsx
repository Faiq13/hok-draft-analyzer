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

      for (const enemyId of enemyPickedIds) {
        const enemy = heroById.get(enemyId);
        if (!enemy) continue;

        const counterEntry = enemy.counteredBy.find(entry => entry.id === candidate.id);
        const isCounter = Boolean(counterEntry) || candidate.counters.includes(enemy.id);

        if (isCounter) {
          score += COUNTER_SCORE;
          matchedEnemies.push(enemy.name);
          const localizedReason = getLocalizedReason(t, enemyId, candidate.id, 'counter');
          if (localizedReason) {
            counterReasons.push(localizedReason);
          } else if (counterEntry?.reason) {
            counterReasons.push(counterEntry.reason);
          }
        }

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

      if (matchedEnemies.length > 1) {
        score += 10 * (matchedEnemies.length - 1);
      }

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
      ? 'bg-[#8000ff]/20 text-[#c084fc] border border-[#8000ff]/50'
      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40';
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold ${badgeClass}`}
        style={{ fontFamily: 'Poppins, sans-serif' }}>
        <span className="font-semibold">{t('counterPanel.counterBadge')}</span>
        {matchedEnemies.map((name, i) => {
          if (i > 0) return <span key={`sep-${i}`}> & </span>;
          return <span key={i}>{name}</span>;
        })}
      </span>
    );
  };

  const renderRoleColumn = (role: Hero['role'], recommendations: RecommendationItem[]) => (
    <div key={role} className="bg-slate-900/70 backdrop-blur-md border border-slate-800/60 rounded-xl p-4 flex flex-col gap-3 min-w-0 flex-1 transition-all duration-200 hover:-translate-y-0.5">
      {/* Role Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <span className="font-bold text-sm text-amber-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {t(`roles.${role}`)}
        </span>
        <span className="text-[9px] bg-black/60 text-white/50 px-2 py-0.5 rounded-full border border-white/10"
          style={{ fontFamily: 'Poppins, sans-serif' }}>
          {t('counterPanel.title').split(' ')[0]}
        </span>
      </div>

      {/* Recommendation List */}
      <div className="flex flex-col gap-2">
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-5 text-center rounded-[8px] bg-black/30 border border-dashed border-white/10">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-2 text-white/30">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {t('counterPanel.noSpecificCounter')}
            </p>
          </div>
        ) : (
          recommendations.map((item) => (
            <div
              key={item.hero.id}
              onClick={() => onSelectHeroForActiveSlot(item.hero.id)}
              className="bg-slate-950/60 hover:bg-violet-500/8 border border-slate-800/60 hover:border-violet-500/40 rounded-xl p-3 flex flex-row items-start gap-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group shadow-sm"
            >
              {/* Avatar */}
              <div className="relative w-11 h-11 rounded-[6px] flex-shrink-0 overflow-hidden ring-1 ring-white/15 group-hover:ring-[#8000ff]/60 transition-all">
                <HeroAvatar
                  hero={item.hero}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  initialsClassName="text-xs"
                />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-xs text-white group-hover:text-white truncate block mb-1"
                  style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {item.hero.name}
                </span>
                <p className="text-[10px] text-white/60 leading-relaxed line-clamp-2"
                  title={item.fullReason}
                  style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {item.reason}
                </p>
                <div className="mt-1.5">
                  {getCounterBadge(item.matchedEnemies)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/60 rounded-2xl p-5 shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center gap-2.5 mb-5 border-b border-white/10 pb-4">
        <div className="w-8 h-8 rounded-[6px] bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
        <h2 className="font-bold text-base text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {t('counterPanel.title')}
        </h2>
      </div>

      {enemyPickedIds.length === 0 ? (
        <div className="text-center py-10 text-white/40 text-sm">
          {draftState.activeSlot ? (
            <>
              <p className="font-semibold text-amber-400 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {t('counterPanel.waitingForActiveSlot', { side: draftState.activeSlot.side === 'blue' ? t('header.blueSide') : t('header.redSide') })}
              </p>
              <p style={{ fontFamily: 'Poppins, sans-serif' }}>
                {draftState.activeSlot.side === 'red' ? t('counterPanel.waitingForEnemyPick') : t('counterPanel.waitingForOurPick')}
              </p>
            </>
          ) : (
            <p style={{ fontFamily: 'Poppins, sans-serif' }}>{t('counterPanel.waitingForEnemy')}</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {ROLES.map(role => renderRoleColumn(role, recommendationsPerRole[role] || []))}
        </div>
      )}
    </div>
  );
};
