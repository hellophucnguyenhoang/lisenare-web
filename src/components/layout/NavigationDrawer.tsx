import { useEffect } from "react";
import { Mic, Blocks, Compass, User, X } from "lucide-react";
import { type ActiveTab } from "@/types";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const NAV_ITEMS = [
  { id: "practice" as const, label: "Practice", icon: Mic },
  { id: "bricks" as const, label: "Bricks", icon: Blocks },
  { id: "discover" as const, label: "Discover", icon: Compass },
  { id: "profile" as const, label: "Profile", icon: User },
];

export default function NavigationDrawer({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
}: NavigationDrawerProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        id="drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Side drawer */}
      <aside
        id="navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[80vw] bg-surface-container-lowest border-r border-outline-variant/30 shadow-2xl flex flex-col transition-transform duration-300 ease-out select-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="h-14 sm:h-16 px-4 sm:px-5 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-primary/20 shadow-2xs flex items-center justify-center p-1.5 overflow-hidden">
              <img
                src="/favicon.svg"
                alt="Lisenare Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display font-bold text-lg text-primary tracking-tight">
              Lisenare
            </span>
          </div>

          <button
            type="button"
            id="btn-close-drawer"
            onClick={onClose}
            className="p-2 -mr-2 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Options List */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                id={`drawer-nav-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-[0.98] ${
                  isActive
                    ? "bg-primary text-on-primary shadow-sm shadow-primary/20"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "stroke-[2.5]" : "stroke-[1.8] text-outline"
                  }`}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-outline-variant/20 text-center">
          <p className="text-[11px] text-outline font-medium">
            Lisenare &bull; Language Learning
          </p>
        </div>
      </aside>
    </>
  );
}
