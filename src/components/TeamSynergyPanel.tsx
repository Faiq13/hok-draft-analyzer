import React from 'react';
import { useTranslation } from 'react-i18next';
import { HOK_HEROES, Hero } from '../data/hokHeroes';
import { DraftState } from '../types/draft';
import { Sparkles } from 'lucide-react';
import { HeroAvatar } from './HeroAvatar';

interface TeamSynergyPanelProps {
  draftState: DraftState;
}

const ROLES: Hero['role'][] = ['Roam', 'Clash', 'Mid', 'Farm', 'Jungle'];

// Helper to get localized tactical reason
function getLocalizedReason(t: (key: string, options?: any) => string, heroId: string, targetId: string, type: string) {
  const path = `tactical.${type}s.${heroId}.${targetId}`;
  return t(path, { defaultValue: '' });
}

export const TeamSynergyPanel: React.FC<TeamSynergyPanelProps> = ({
  draftState,
}) => {
  const { t } = useTranslation();
  const enemyPickedIds = draftState.redTeam.filter(
    (id): id is string => id !== null
  );
  const allyPickedIds = draftState.blueTeam.filter(
    (id): id is string => id !== null
  );

  // Unavailable IDs
  const unavailableIds = new Set(
    [
      ...draftState.blueTeam,
      ...draftState.redTeam,
      ...draftState.blueBans,
      ...draftState.redBans,
    ].filter((id): id is string => id !== null)
  );

  // Simple hero lookup by id
  const heroById: Record<string, Hero> = {};
  HOK_HEROES.forEach(h => { heroById[h.id] = h; });

  // Calculate synergy score for each available hero
  const candidates: Array<{ hero: Hero; score: number; reasons: string[] }> = [];

  HOK_HEROES.forEach(hero => {
    if (unavailableIds.has(hero.id)) return;

    let score = 0;
    const reasons: string[] = [];

    // STRICT: Only check SYNERGIES with ally picked heroes (Blue Side)
    // This panel ONLY shows heroes that have synergy with our team
    for (const allyId of allyPickedIds) {
      const ally = heroById[allyId];
      if (!ally) continue;

      // Candidate's synergy with ally
      const synergy = hero.synergies.find(
        (e: any) => e.id === ally.id
      );
      if (synergy) {
        score += 20;
        // Use localized reason if available
        const localizedReason = getLocalizedReason(t, hero.id, ally.id, 'synergy');
        if (localizedReason) {
          reasons.push(localizedReason);
        } else {
          reasons.push(synergy.reason ?? t('synergyPanel.synergyLabel') + ' ' + ally.name);
        }
      }

      // Ally's synergy with candidate
      const allySynergy = ally.synergies.find(
        (e: any) => e.id === hero.id
      );
      if (allySynergy && !hero.synergies.some((f: any) => f.id === ally.id)) {
        score += 20;
        const localizedReason = getLocalizedReason(t, ally.id, hero.id, 'synergy');
        if (localizedReason) {
          reasons.push(localizedReason);
        } else {
          reasons.push(allySynergy.reason ?? t('synergyPanel.synergyLabel') + ' ' + ally.name);
        }
      }
    }

    if (reasons.length > 1) {
      score += 10 * (reasons.length - 1);
    }

    if (score > 0) {
      candidates.push({ hero, score, reasons });
    }
  });

  // Sort by score desc, then by name
  candidates.sort((a, b) => b.score - a.score || a.hero.name.localeCompare(b.hero.name, 'en'));

  // Top 3 per role
  const topByRole = ROLES.map(role => {
    return {
      role,
      heroes: candidates
        .filter((c) => c.hero.role === role)
        .slice(0, 3),
    };
  });

  const renderRoleColumn = (role: Hero['role'], heroes: Array<{ hero: Hero; score: number; reasons: string[] }>) => (
    <div key={role} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 flex flex-col gap-3 min-w-[240px] md:min-w-[260px] flex-1">
      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
        <span className="font-bold text-sm text-indigo-400">{t(`roles.${role}`)}</span>
        <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{t('synergyPanel.synergyLabel')}</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {heroes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-5 text-center rounded-xl bg-slate-900/40 border border-dashed border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800/60 flex items-center justify-center mb-1.5 text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t('synergyPanel.noSpecificSynergy')}
            </p>
          </div>
        ) : (
          heroes.map((item, idx) => (
            <div
              key={item.hero.id}
              className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl p-3 flex flex-row items-start gap-3 transition-all shadow-sm group"
            >
              <div className="relative w-12 h-12 rounded-xl flex-shrink-0 border border-slate-700 overflow-hidden ring-1 ring-slate-700 group-hover:ring-indigo-500/50 transition-all">
                <HeroAvatar
                  hero={item.hero}
                  className="w-full h-full rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-slate-100 group-hover:text-white truncate">{item.hero.name}</span>
                </div>
                <p
                  className="text-[11px] text-slate-300 leading-relaxed line-clamp-2"
                  title={item.reasons[0]}
                >
                  {item.reasons[0]}
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
        <Sparkles className="w-5 h-5 text-indigo-400" />
        <h2 className="font-bold text-lg text-slate-100">{t('synergyPanel.title')}</h2>
      </div>

      {allyPickedIds.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm space-y-1">
          {draftState.activeSlot ? (
            <>
              <p className="font-semibold text-indigo-400">{t('synergyPanel.waitingForActiveSlot', { side: draftState.activeSlot.side === 'blue' ? t('header.blueSide') : t('header.redSide') })}</p>
              <p>{draftState.activeSlot.side === 'blue' ? t('synergyPanel.waitingForAllyPick') : t('synergyPanel.waitingForOurPick')}</p>
            </>
          ) : (
            <p>{t('synergyPanel.waitingForAlly')}</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pb-2">
          {topByRole.map(({ role, heroes }) => renderRoleColumn(role, heroes))}
        </div>
      )}
    </div>
  );
};