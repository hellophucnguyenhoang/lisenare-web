import { GraduationCap, Grid, Compass, User } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'practice' | 'collections' | 'discover' | 'profile';
  setActiveTab: (tab: 'practice' | 'collections' | 'discover' | 'profile') => void;
  clearSubviews: () => void;
}

export default function BottomNavBar({ activeTab, setActiveTab, clearSubviews }: BottomNavBarProps) {
  const tabs = [
    { id: 'practice' as const, label: 'Practice', icon: GraduationCap },
    { id: 'collections' as const, label: 'Collections', icon: Grid },
    { id: 'discover' as const, label: 'Discover', icon: Compass },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-3 pb-safe bg-surface-container-lowest border-t border-outline-variant/30 shadow-lg md:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              clearSubviews();
            }}
            id={`nav-tab-${tab.id}`}
            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all duration-300 ${
              isActive
                ? 'bg-primary/10 text-primary scale-105 font-semibold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
            <span className="text-xs font-medium tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
