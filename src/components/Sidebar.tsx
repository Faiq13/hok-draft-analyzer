import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Gamepad2, BarChart2, Sword, Shield, Settings, ChevronDown, Trophy, BookOpen, Crosshair } from 'lucide-react';

export type ActiveView =
  | 'draft'
  | 'hero-tier'
  | 'hero-catalog'
  | 'hero-counter'
  | 'items'
  | 'item-database'
  | 'item-simulator'
  | 'item-ranking'
  | 'meta-tier'
  | 'settings';

interface SidebarProps {
  activeMenu: ActiveView;
  onMenuChange: (menu: ActiveView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeMenu, onMenuChange }) => {
  const { t } = useTranslation();
  const heroSubMenus: ActiveView[] = ['hero-tier', 'hero-catalog', 'hero-counter'];
  const heroActive = heroSubMenus.includes(activeMenu);
  const itemSubMenus: ActiveView[] = ['item-database', 'item-simulator', 'item-ranking'];
  const [itemsExpanded, setItemsExpanded] = useState(itemSubMenus.includes(activeMenu));
  const [heroExpanded, setHeroExpanded] = useState(heroActive);

  const handleHeroToggle = () => {
    if (!heroExpanded) {
      setHeroExpanded(true);
      if (!heroActive) onMenuChange('hero-tier');
    } else {
      setHeroExpanded(false);
    }
  };

  const navBtn = (
    id: ActiveView,
    icon: React.ReactNode,
    label: string,
    disabled = false,
    indent = false
  ) => {
    const isActive = activeMenu === id;
    return (
      <button
        key={id}
        onClick={() => { if (!disabled) onMenuChange(id); }}
        disabled={disabled}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-sm font-medium transition-all text-left ${
          indent ? 'pl-9' : ''
        } ${
          isActive
            ? 'bg-[#8000ff]/20 border border-[#8000ff]/40 text-white'
            : disabled
            ? 'text-white/25 cursor-not-allowed'
            : 'text-white/60 hover:text-white hover:bg-white/5'
        }`}
      >
        <span className={`flex-shrink-0 ${isActive ? 'text-[#c084fc]' : disabled ? 'text-white/20' : 'text-white/40'}`}>
          {icon}
        </span>
        <span className="flex-1 truncate">{label}</span>
        {disabled && (
          <span className="text-[8px] font-bold bg-white/5 border border-white/10 text-white/25 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            {t('sidebar.soon', { defaultValue: 'Soon' })}
          </span>
        )}
        {isActive && !disabled && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc] flex-shrink-0" />
        )}
      </button>
    );
  };

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[#191919] border-r border-white/10 flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
          <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <span className="font-black text-sm bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent tracking-tight">
          HOK DRAFT
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
        <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest px-2 mb-1.5">
          {t('sidebar.navigation', { defaultValue: 'Navigation' })}
        </p>

        {/* Draft Simulator */}
        {navBtn('draft', <Gamepad2 className="w-4 h-4" />, t('sidebar.draftSimulator', { defaultValue: 'Draft Simulator' }))}

        {/* Hero Database (expandable) */}
        <button
          onClick={handleHeroToggle}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all text-left ${
            heroActive
              ? 'bg-[#8000ff]/10 border border-[#8000ff]/25 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className={`flex-shrink-0 ${heroActive ? 'text-[#c084fc]' : 'text-white/40'}`}>
            <Sword className="w-4 h-4" />
          </span>
          <span className="flex-1 truncate">{t('sidebar.heroDatabase', { defaultValue: 'Hero Database' })}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${heroExpanded ? 'rotate-180' : ''} ${heroActive ? 'text-[#c084fc]' : 'text-white/30'}`}
          />
        </button>

        {/* Sub-menu */}
        {heroExpanded && (
          <div className="flex flex-col gap-0.5 mt-0.5">
            {navBtn(
              'hero-tier',
              <Trophy className="w-3.5 h-3.5" />,
              '🏆 Hero Tier',
              false,
              true
            )}
            {navBtn(
              'hero-catalog',
              <BookOpen className="w-3.5 h-3.5" />,
              '📖 Database Hero',
              false,
              true
            )}
            {navBtn(
              'hero-counter',
              <Crosshair className="w-3.5 h-3.5" />,
              '🎯 Counter Hero',
              false,
              true
            )}
          </div>
        )}

        <button onClick={() => setItemsExpanded(v => !v)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-sm text-white/60 hover:text-white hover:bg-white/5"><Shield className="w-4 h-4" /><span className="flex-1 text-left">Items</span><ChevronDown className={`w-3.5 ${itemsExpanded ? 'rotate-180' : ''}`} /></button>
        {itemsExpanded && <div className="flex flex-col gap-0.5">{navBtn('item-database', <BookOpen className="w-3.5 h-3.5" />, '📦 Database Item', false, true)}{navBtn('item-simulator', <Sword className="w-3.5 h-3.5" />, '🛠️ Build Simulator', false, true)}{navBtn('item-ranking', <BarChart2 className="w-3.5 h-3.5" />, '📈 Item Pick Ranking', false, true)}</div>}

        {/* Meta Tier List — Coming Soon, posisi setelah Item Tactics */}
        {navBtn('meta-tier', <BarChart2 className="w-4 h-4" />, t('sidebar.metaTierList', { defaultValue: 'Meta Tier List' }), true)}
      </nav>

      {/* Settings at bottom */}
      <div className="px-2 py-3 border-t border-white/10">
        <button
          onClick={() => onMenuChange('settings')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all text-left ${
            activeMenu === 'settings'
              ? 'bg-[#8000ff]/20 border border-[#8000ff]/40 text-white'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className={`w-4 h-4 ${activeMenu === 'settings' ? 'text-[#c084fc]' : 'text-white/35'}`} />
          <span>{t('sidebar.settings', { defaultValue: 'Settings' })}</span>
        </button>
      </div>
    </aside>
  );
};
