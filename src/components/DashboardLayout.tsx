import React, { useState } from 'react';
import { Sidebar, ActiveView } from './Sidebar';
import { HeroTierView } from './views/HeroTierView';
import { HeroCatalogView } from './views/HeroCatalogView';
import { HeroCounterView } from './views/HeroCounterView';
import { DatabaseItemView } from './views/DatabaseItemView';
import { BuildSimulatorView } from './views/BuildSimulatorView';
import { ItemPickRankingView } from './views/ItemPickRankingView';

interface DashboardLayoutProps {
  children: React.ReactNode; // Draft Simulator content
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState<ActiveView>('draft');

  const renderContent = () => {
    switch (activeMenu) {
      case 'draft':     return children;
      case 'hero-tier':    return <HeroTierView />;
      case 'hero-catalog': return <HeroCatalogView />;
      case 'hero-counter': return <HeroCounterView />;
      case 'item-database': return <DatabaseItemView />;
      case 'item-simulator': return <BuildSimulatorView />;
      case 'item-ranking': return <ItemPickRankingView />;
      default:          return children;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#0f0f0f] overflow-hidden">
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
