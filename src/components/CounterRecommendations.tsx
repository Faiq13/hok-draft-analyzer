import React from 'react';
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
}

const ROLES: Hero['role'][] = ['Roam', 'Clash', 'Mid', 'Farm', 'Jungle'];

const COUNTER_SCORE = 40;
const SYNERGY_SCORE = 20;
const VULNERABILITY_PENALTY = 20;

const heroById = new Map(HOK_HEROES.map(hero => [hero.id, hero]));

export const CounterRecommendations: React.FC<CounterRecommendationsProps> = ({
  draftState,
  onSelectHeroForActiveSlot,
}) => {
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
      const tacticalReasons: string[] = [];
      const vulnerabilities: string[] = [];

      // 1. Akumulasi counter terhadap SEMUA hero musuh yang dipilih.
      for (const enemyId of enemyPickedIds) {
        const enemy = heroById.get(enemyId);
        if (!enemy) continue;

        const counterEntry = enemy.counteredBy.find(entry => entry.id === candidate.id);
        const isCounter = Boolean(counterEntry) || candidate.counters.includes(enemy.id);

        if (isCounter) {
          score += COUNTER_SCORE;
          matchedEnemies.push(enemy.name);
          if (counterEntry?.reason) tacticalReasons.push(counterEntry.reason);
        }

        // 2. Penalti bila hero musuh justru meng-counter kandidat.
        const vulnerability = candidate.counteredBy.find(entry => entry.id === enemy.id);
        if (vulnerability) {
          score -= VULNERABILITY_PENALTY;
          vulnerabilities.push(`Rentan vs ${enemy.name}`);
          if (vulnerability.reason) tacticalReasons.push(vulnerability.reason);
        }
      }

      // 3. Bonus sinergi dengan hero tim kita yang sudah dipilih.
      for (const allyId of allyPickedIds) {
        const ally = heroById.get(allyId);
        if (!ally) continue;

        const synergy =
          candidate.synergies.find(entry => entry.id === ally.id) ??
          ally.synergies.find(entry => entry.id === candidate.id);

        if (synergy) {
          score += SYNERGY_SCORE;
          matchedAllies.push(ally.name);
          if (synergy.reason) tacticalReasons.push(synergy.reason);
        }
      }

      // Prioritaskan hero yang menjawab lebih dari satu pick musuh.
      if (matchedEnemies.length > 1) {
        score += 10 * (matchedEnemies.length - 1);
      }

      if (score <= 0) return;

      const fullReasonParts = [
        matchedEnemies.length > 0 ? `Counter: ${matchedEnemies.join(', ')}` : '',
        matchedAllies.length > 0 ? `Sinergi: ${matchedAllies.join(', ')}` : '',
        ...tacticalReasons,
        ...vulnerabilities,
      ].filter(Boolean);

      const fallbackReason = matchedEnemies.length > 0
        ? `Efektif melawan ${matchedEnemies.join(' & ')}`
        : `Sinergi dengan ${matchedAllies.join(' & ')}`;

      scored.push({
        hero: candidate,
        score,
        reason: tacticalReasons[0] ?? fallbackReason,
        fullReason: fullReasonParts.join(' • '),
      });
    });

    scored.sort((a, b) => b.score - a.score || a.hero.name.localeCompare(b.hero.name, 'en'));
    recommendationsPerRole[role] = scored.slice(0, 3);
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
          {ROLES.map(role => {
            const recs = recommendationsPerRole[role] ?? [];
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
                    recs.map((item, idx) => (
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
                          <p
                            className="text-[10px] text-slate-400 line-clamp-2 leading-snug"
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
          })}
        </div>
      )}
    </div>
  );
};
