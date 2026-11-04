import React from 'react';
import { useTranslation } from 'react-i18next';
import { HOK_HEROES, Hero } from '../data/hokHeroes';
import { DraftState } from '../types/draft';
import { HOK_ITEM_COUNTERS } from '../data/hokItems';

interface ItemCounterPanelProps {
  draftState: DraftState;
}

export const ItemCounterPanel: React.FC<ItemCounterPanelProps> = ({
  draftState,
}) => {
  const { t, i18n } = useTranslation();
  const enemyPickedIds = draftState.redTeam.filter((id): id is string => id !== null);
  const allyPickedIds = draftState.blueTeam.filter((id): id is string => id !== null);

  if (enemyPickedIds.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl text-center py-8">
        <p className="text-slate-500 italic">
          {t('itemCounterPanel.subtitle').split('→')[0].trim()}
        </p>
      </div>
    );
  }

  // Get enemy hero names from picked IDs
  const enemyHeroNames = enemyPickedIds
    .map(id => {
      const hero = HOK_HEROES.find(h => h.id === id);
      return hero ? hero.name : null;
    })
    .filter((h): h is string => h !== null);

  // Calculate priority items based on enemy composition
  const itemPriorities = HOK_ITEM_COUNTERS.filter(item => {
    const lowerEnemies = enemyHeroNames.map(h => h.toLowerCase());

    if (item.category === 'anti-heal') {
      return lowerEnemies.some(l =>
        l.includes('cai-yan') ||
        l.includes('dyadia') ||
        l.includes('ao-yin') ||
        l.includes('yang-jian') ||
        l.includes('fuzi')
      );
    }

    if (item.category === 'anti-physical-burst') {
      return lowerEnemies.some(l =>
        l.includes('lu-bu') ||
        l.includes('butterfly') ||
        l.includes('arthur')
      );
    }

    if (item.category === 'anti-magic-burst') {
      return lowerEnemies.some(l =>
        l.includes('angela') ||
        l.includes('daji') ||
        l.includes('mai-shiranui')
      );
    }

    if (item.category === 'anti-shield') {
      return lowerEnemies.some(l =>
        l.includes('zhang-fei') || l.includes('dun')
      );
    }

    return false;
  });

  // Sort: anti-heal first, then anti-magic-burst, anti-physical-burst, anti-shield
  const categoryPriority: Record<string, number> = {
    'anti-heal': 1,
    'anti-magic-burst': 2,
    'anti-physical-burst': 3,
    'anti-shield': 4,
  };

  itemPriorities.sort((a, b) => {
    const aPri = categoryPriority[a.category] ?? 99;
    const bPri = categoryPriority[b.category] ?? 99;
    return aPri - bPri;
  });

  // Take top 5 prioritized items
  const topItems = itemPriorities.slice(0, 5);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl mt-4">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <span className="text-amber-400">⚔️</span>
        <h2 className="font-bold text-lg text-slate-100">{t('itemCounterPanel.title')}</h2>
      </div>

      <p className="text-sm text-slate-400 mb-3">
        {t('itemCounterPanel.subtitle')}
      </p>

      {topItems.length === 0 ? (
        <div className="text-center text-slate-500 italic py-4">
          {t('itemCounterPanel.noSpecificItemCounter')}
        </div>
      ) : (
        <div className="space-y-3">
          {topItems.map((item, idx) => {
            // Get description from locale files
            const descKey = item.descriptionKey;
            const desc = t(`items.${descKey}`, { defaultValue: '' });

            // Category color and initials
            const isHeal = item.category === 'anti-heal';
            const isPhys = item.category === 'anti-physical-burst';
            const isMag = item.category === 'anti-magic-burst';
            const isShield = item.category === 'anti-shield';

            const badgeBg = isHeal
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
              : isPhys
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
              : isMag
              ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
              : 'bg-amber-500/20 text-amber-400 border-amber-500/50';

            // Try to load item image, fallback to initials
            const itemSlug = item.id;
            const imagePath = `/items/${itemSlug}.webp`;

            const initials = item.name
              .split(' ')
              .map(w => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={item.id}
                className="bg-slate-800 border border-slate-700/50 rounded-lg p-3 flex items-start gap-3 hover:bg-slate-700 transition-colors"
              >
                {/* Item Image / Initials placeholder */}
                <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-xs border ${badgeBg}`}>
                  <img
                    src={imagePath}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={e => {
                      // On error, hide image and show initials
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  {/* Initials shown when image is loading or fails - centered in the box */}
                  <span className="absolute w-full h-full text-center text-[8px] line-through">{initials}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-slate-100">{item.name}</span>
                    <span
                      className={
                        'inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold border ' + badgeBg
                      }>
                      {t(`itemCounterPanel.categories.${item.category}`)}
                    </span>
                  </div>

                  <p className="text-sm text-amber-100 leading-relaxed">
                    {desc || item.name}
                  </p>
                  <p className="text-[8px] text-slate-500 mt-1">
                    {t('itemCounterPanel.priority', { index: idx + 1 })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};