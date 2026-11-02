import React, { useState } from 'react';
import { HOK_HEROES, Hero } from '../data/hokHeroes';
import { DraftState } from '../types/draft';
import { Sparkles } from 'lucide-react';

interface CounterRecommendationsProps {
  draftState: DraftState;
  onSelectHeroForActiveSlot: (heroId: string) => void;
}

interface RecommendationItem {
  hero: Hero;
  score: number;
  reason: string;
}

export const CounterRecommendations: React.FC<CounterRecommendationsProps> = ({
  draftState,
  onSelectHeroForActiveSlot,
}) => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const enemyPickedIds = draftState.redTeam.filter((id): id is string => id !== null);
  const alreadyPickedOrBanned = [
    ...draftState.blueTeam,
    ...draftState.redTeam,
    ...draftState.blueBans,
    ...draftState.redBans,
  ].filter((id): id is string => id !== null);

  const roles: ('Roam' | 'Clash' | 'Mid' | 'Farm' | 'Jungle')[] = ['Roam', 'Clash', 'Mid', 'Farm', 'Jungle'];
  const recommendationsPerRole: Record<string, RecommendationItem[]> = {};

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Roam': return 'bg-emerald-600';
      case 'Clash': return 'bg-amber-600';
      case 'Mid': return 'bg-purple-600';
      case 'Farm': return 'bg-blue-600';
      case 'Jungle': return 'bg-rose-600';
      default: return 'bg-slate-600';
    }
  };

  const getInitials = (name: string) => {
    const parts = name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  roles.forEach(role => {
    // 1. Filter out already picked or banned heroes completely
    const candidates = HOK_HEROES.filter(
      h => h.role === role && !alreadyPickedOrBanned.includes(h.id)
    );

    const scoredCandidates: RecommendationItem[] = [];

    candidates.forEach(candidate => {
      let totalScore = 0;
      let matchedEnemies: string[] = [];

      // 2. Accumulate counter score against ALL enemy picks in redPicks
      enemyPickedIds.forEach(enemyId => {
        const enemyHero = HOK_HEROES.find(h => h.id === enemyId);
        if (enemyHero) {
          const isCounter = enemyHero.counteredBy.includes(candidate.id) || candidate.counters.includes(enemyHero.id);
          if (isCounter) {
            totalScore += 40;
            matchedEnemies.push(enemyHero.name);
          }
        }
      });

      // Only consider heroes that are genuine counters to at least one enemy pick when enemies are picked
      if (enemyPickedIds.length > 0 && totalScore > 0) {
        let reason = '';
        if (matchedEnemies.length === 1) {
          reason = `Efektif melawan ${matchedEnemies[0]}`;
        } else if (matchedEnemies.length > 1) {
          reason = `Efektif melawan ${matchedEnemies.join(' & ')}`;
        }

        scoredCandidates.push({
          hero: candidate,
          score: totalScore,
          reason,
        });
      } else if (enemyPickedIds.length === 0) {
        // If no enemies picked yet, suggest general top heroes or synergy
        scoredCandidates.push({
          hero: candidate,
          score: 10,
          reason: `Pilihan solid untuk role ${role}`,
        });
      }
    });

    scoredCandidates.sort((a, b) => b.score - a.score);

    // 3. No random fallback: if scoredCandidates is empty, return empty array so UI displays "Tidak ada counter spesifik"
    recommendationsPerRole[role] = scoredCandidates.slice(0, 3);
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <h2 className="font-bold text-lg text-slate-100">Rekomendasi Counter & Taktis per Role</h2>
      </div>

      {enemyPickedIds.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          Pilih hero di Red Side (Lawan) terlebih dahulu untuk melihat rekomendasi counter taktis otomatis.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {roles.map(role => {
            const recs = recommendationsPerRole[role] || [];
            return (
              <div key={role} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="font-bold text-sm text-amber-400">{role}</span>
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">Top Rec</span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {recs.length === 0 ? (
                    <div className="text-xs text-slate-500 italic py-4 text-center bg-slate-900/40 rounded-lg border border-slate-800">
                      Tidak ada counter spesifik
                    </div>
                  ) : (
                    recs.map((item, idx) => {
                      const hasFailed = failedImages[item.hero.id];
                      return (
                        <div
                          key={item.hero.id}
                          onClick={() => {
                            if (draftState.activeSlot && draftState.activeSlot.side === 'blue') {
                              onSelectHeroForActiveSlot(item.hero.id);
                            }
                          }}
                          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-2 flex items-center gap-2.5 cursor-pointer transition-all group"
                        >
                          <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 border border-slate-600 group-hover:border-amber-400 flex items-center justify-center">
                            {!hasFailed ? (
                              <img
                                src={item.hero.avatarUrl}
                                alt={item.hero.name}
                                className="w-full h-full object-cover"
                                onError={() => {
                                 setFailedImages(prev => ({ ...prev, [item.hero.id]: true }));
                                }}
                              />
                            ) : (
                              <div className={`w-full h-full flex flex-col items-center justify-center text-white font-bold text-[10px] ${getRoleColor(item.hero.role)}`}>
                                <span>{getInitials(item.hero.name)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-xs text-white truncate">{item.hero.name}</h4>
                              <span className="text-[10px] text-emerald-400 font-bold">#{idx + 1}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate" title={item.reason}>{item.reason}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
