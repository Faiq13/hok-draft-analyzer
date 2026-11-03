import React from 'react';
import { HOK_HEROES, Hero } from '../data/hokHeroes';
import { DraftState } from '../types/draft';
import { Sparkles } from 'lucide-react';

interface TeamSynergyPanelProps {
  draftState: DraftState;
  language: 'EN' | 'ID';
  transliterate: (text: string, language: 'EN' | 'ID') => string;
}

const ROLES: Hero['role'][] = ['Roam', 'Clash', 'Mid', 'Farm', 'Jungle'];

export const TeamSynergyPanel: React.FC<TeamSynergyPanelProps> = ({
  draftState,
  language,
  transliterate,
}) => {
  const enemyPickedIds = draftState.redTeam.filter(
    (id): id is string => id !== null
  );
  const allyPickedIds = draftState.blueTeam.filter(
    (id): id is string => id !== null
  );
  const languageCode = language;

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

    // Check synergies with ally picked heroes
    for (const allyId of allyPickedIds) {
      const ally = heroById[allyId];
      if (!ally) continue;

      // Candidate's synergy with ally
      const synergy = hero.synergies.find(
        (e: any) => e.id === ally.id
      );
      if (synergy) {
        score += 20;
        reasons.push(synergy.reason ?? 'Sinergi dengan ' + ally.name);
      }

      // Ally's synergy with candidate
      const allySynergy = ally.synergies.find(
        (e: any) => e.id === hero.id
      );
      if (allySynergy && !hero.synergies.some((f: any) => f.id === ally.id)) {
        score += 20;
        reasons.push(allySynergy.reason ?? 'Sinergi bersama ' + ally.name);
      }
    }

    // Frequently paired with
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

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <h2 className="font-bold text-lg text-slate-100">Panel Sinergi Tim</h2>
      </div>

      {enemyPickedIds.length > 0 && allyPickedIds.length > 0 ? (
        <div className="mb-4 text-sm text-slate-400">
          <p className="font-medium">Tim Kita (Blue):</p>
          {allyPickedIds.map((id) => {
            const h = heroById[id];
            return h ? (
              <span key={id} className="mr-2 text-amber-400">
                {h.name}
              </span>
            ) : null;
          })}
          <p className="mt-1">vs</p>
          <p className="ml-2 font-medium text-rose-400">
            {enemyPickedIds.map((id) => {
              const h = heroById[id];
              return h ? (
                <span key={id} className="mr-2 text-rose-400">
                  {h.name}
                </span>
              ) : null;
            })}</p>
        </div>
      ) : (
        <p className="text-center py-4 text-slate-500 italic">
          Pilih hero untuk tim kita dan lawan
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topByRole.map(({ role, heroes }) => (
          <div
            key={role}
            className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 flex flex-col gap-2 min-h-[180px]"
          >
            <div className="font-bold text-sm text-amber-400">{role}</div>
            {heroes.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-2">Tidak ada rekomendasi</div>
            ) : (
              heroes.map((h, idx) => (
                <div
                  key={h.hero.id}
                  className="p-2 border-b border-slate-700/30 last:border-0 hover:bg-slate-700/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-semibold text-white truncate">
                      {h.hero.name}
                    </span>
                    <span className="text-[7px] bg-slate-700 text-slate-300 px-1 py-0.5 rounded">
                      {h.score} pt
                    </span>
                  </div>
                  <p className="text-[8px] text-slate-400 line-clamp-2">
                    {h.reasons.length > 0 ? transliterate(h.reasons[0], languageCode) : 'Tidak ada alasan'}
                  </p>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};