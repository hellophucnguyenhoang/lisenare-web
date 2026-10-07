import { useState } from "react";
import { Menu, Mic, Blocks, Compass, User } from "lucide-react";
import { type ActiveTab } from "@/types";
import { useHeader } from "@/context/HeaderContext";
import NavigationDrawer from "@/components/layout/NavigationDrawer";

interface AppHeaderProps {
  activeTab: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
  clearSubviews?: () => void;
  isLoggedIn?: boolean;
  onClearPracticeBrickId?: () => void;
}

export default function AppHeader({
  activeTab,
  setActiveTab,
  clearSubviews,
  isLoggedIn = false,
  onClearPracticeBrickId,
}: AppHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { headerContent } = useHeader();

  const handleLogoClick = () => {
    setActiveTab?.(isLoggedIn ? "practice" : "profile");
    onClearPracticeBrickId?.();
    clearSubviews?.();
  };

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab?.(tab);
    clearSubviews?.();
  };

  const renderDefaultDynamicContent = () => {
    switch (activeTab) {
      case "practice":
        return (
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-xl">
            <Mic className="w-3.5 h-3.5" />
            <span>Practice</span>
          </div>
        );
      case "bricks":
        return (
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-xl">
            <Blocks className="w-3.5 h-3.5" />
            <span>Bricks</span>
          </div>
        );
      case "discover":
        return (
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-xl">
            <Compass className="w-3.5 h-3.5" />
            <span>Discover</span>
          </div>
        );
      case "profile":
        return (
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-xl">
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </div>
        );
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-40 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/30 shadow-2xs transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="h-14 sm:h-16 flex items-center justify-between gap-3">
            {/* Top Left: Hamburger Menu Button + Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                id="btn-hamburger-menu"
                onClick={() => setIsMenuOpen(true)}
                className="p-2 -ml-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all active:scale-95 cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Open navigation menu"
                aria-expanded={isMenuOpen}
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div
                onClick={handleLogoClick}
                className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none shrink-0"
                title="Lisenare Home"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-primary/20 shadow-2xs flex items-center justify-center p-1.5 transition-transform group-hover:scale-105 group-active:scale-95 overflow-hidden">
                  <img
                    src="/favicon.svg"
                    alt="Lisenare Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-display font-bold text-lg sm:text-xl text-primary tracking-tight">
                  Lisenare
                </span>
              </div>
            </div>

            {/* Dynamic Content Area (Top Right) */}
            <div className="flex items-center justify-end min-w-0 shrink-0">
              {headerContent || renderDefaultDynamicContent()}
            </div>
          </div>
        </div>
      </header>

      {/* Collapsible Navigation Drawer */}
      <NavigationDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />
    </>
  );
}
