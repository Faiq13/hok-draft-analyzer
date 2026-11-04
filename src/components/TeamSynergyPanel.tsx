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

    // Frequently paired with (bonus info, not core synergy)
    for (const allyId of allyPickedIds) {
      const ally = heroById[allyId];
      if (!ally) continue;
      if (ally.frequentlyPairedWith) {
        for (const p of ally.frequentlyPairedWith) {
          if (!reasons.some(r => r.includes(p.names[0]))) {
            reasons.push('Biasanya dipasang bersama ' + p.names[0]);
          }
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
    <div key={role} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
        <span className="font-bold text-sm text-indigo-400">{t(`roles.${role}`)}</span>
        <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{t('synergyPanel.synergyLabel')}</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {heroes.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-4 text-center bg-slate-900/40 rounded-lg border border-slate-800">
            {t('synergyPanel.noSpecificSynergy')}
          </div>
        ) : (
          heroes.map((item, idx) => (
            <div
              key={item.hero.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-2 flex items-center gap-2.5 transition-all"
            >
              <HeroAvatar
                hero={item.hero}
                className="w-10 h-10 rounded-md flex-shrink-0 border border-slate-600"
                initialsClassName="text-[10px]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-semibold text-xs text-white truncate">{item.hero.name}</h4>
                  <span className="text-[10px] text-indigo-400 font-bold">#{idx + 1}</span>
                </div>
                <p
                  className="text-[10px] text-slate-400 line-clamp-none leading-snug"
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {topByRole.map(({ role, heroes }) => renderRoleColumn(role, heroes))}
        </div>
      )}
    </div>
  );
};