import { Mic, BookOpen, Compass, User } from 'lucide-react';
import { type ActiveTab } from '@/types';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  clearSubviews?: () => void;
}

export default function BottomNavBar({ activeTab, setActiveTab, clearSubviews }: BottomNavBarProps) {
  const tabs = [
    { id: 'practice' as const, label: 'Practice', icon: Mic },
    { id: 'collections' as const, label: 'Collection', icon: BookOpen },
    { id: 'discover' as const, label: 'Discover', icon: Compass },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 w-full z-50 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/30 shadow-lg safe-bottom"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                clearSubviews?.();
              }}
              id={`nav-tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              className="group flex-1 flex flex-col items-center justify-center py-1 px-1 cursor-pointer transition-all duration-200 focus:outline-none select-none active:scale-95"
            >
              {/* Active pill indicator container */}
              <div
                className={`relative flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-md shadow-primary/25 scale-105'
                    : 'text-on-surface-variant/75 group-hover:text-on-surface group-hover:bg-surface-container-low'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'stroke-[2.5px] scale-105' : 'stroke-[1.8px]'
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[11px] mt-1 transition-all duration-200 tracking-tight ${
                  isActive
                    ? 'font-bold text-primary'
                    : 'font-medium text-outline group-hover:text-on-surface-variant'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
