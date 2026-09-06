import { useState, useRef, useEffect } from "react";
import {
  Headphones,
  User as UserIcon,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Mail,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { type Learner, type AuthMode, type ActiveTab } from "@/types";
import { maskEmail } from "@/utils/maskEmail";

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  clearSubviews: () => void;
  currentLearner?: Learner;
  onOpenAuth?: (mode: AuthMode) => void;
  onLogout?: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  clearSubviews,
  currentLearner,
  onOpenAuth,
  onLogout,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: "practice" as const, label: "Practice" },
    { id: "collections" as const, label: "Collections" },
    { id: "discover" as const, label: "Discover" },
  ];

  const isLoggedIn = Boolean(currentLearner);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const learnerName = currentLearner?.name || "Learner";
  const learnerEmail = currentLearner?.email || "";
  const isEmailVerified =
    currentLearner?.isEmailVerified ?? Boolean(learnerEmail);
  const learnerAvatar =
    currentLearner?.avatarUrl || "https://placecats.com/300/300";

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    onLogout?.();
  };

  const handleNavigateToProfile = () => {
    setIsMenuOpen(false);
    setActiveTab("profile");
    clearSubviews();
  };

  const handleSwitchAccount = () => {
    setIsMenuOpen(false);
    onOpenAuth?.("login");
  };

  return (
    <header className="sticky top-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md shadow-xs h-16 border-b border-outline-variant/15">
      <div className="max-w-5xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div
            onClick={() => {
              setActiveTab("collections");
              clearSubviews();
            }}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary group-hover:text-on-primary text-primary transition-all shadow-xs">
              <Headphones className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-primary tracking-tight">
                Lisenare
              </h1>
            </div>
          </div>
        </div>

        {/* Desktop Responsive Header Navigation Items */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex gap-8 mr-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    clearSubviews();
                  }}
                  className={`font-semibold text-sm transition-colors py-2 tracking-wide cursor-pointer ${
                    isActive
                      ? "text-primary border-b-2 border-primary font-bold"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Header Action / Auth Button with Personal Info Popover */}
          <div className="relative" ref={menuRef}>
            {!isLoggedIn ? (
              <button
                id="btn-header-signin"
                onClick={() => onOpenAuth?.("login")}
                className="px-4 py-2 bg-primary text-on-primary font-bold text-xs rounded-xl shadow-xs hover:bg-primary-container transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Sign In
              </button>
            ) : (
              <button
                id="btn-header-auth-trigger"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-expanded={isMenuOpen}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 border ${
                  isMenuOpen
                    ? "bg-primary/10 border-primary text-primary shadow-xs"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface border-outline-variant/50"
                }`}
              >
                <div className="w-6 h-6 rounded-full overflow-hidden border border-primary/30 relative shrink-0">
                  <img
                    src={learnerAvatar}
                    alt={learnerName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-bold text-xs">{learnerName}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-outline transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
            )}

            {/* Logged-In Learner Information & Logout Popover Dropdown */}
            {isLoggedIn && isMenuOpen && (
              <div
                id="header-learner-dropdown"
                className="absolute right-0 mt-2 w-72 sm:w-80 bg-surface-container-lowest border border-outline-variant/80 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Header profile info */}
                <div className="flex items-center gap-3 pb-3.5 border-b border-outline-variant/40">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-fixed-dim bg-surface-container-high">
                      <img
                        src={learnerAvatar}
                        alt={learnerName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-on-surface truncate">
                        {learnerName}
                      </h3>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                        Active
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-primary truncate">
                      {learnerName}
                    </p>

                    {/* Email & status */}
                    {learnerEmail ? (
                      <div className="flex items-center gap-1 text-[11px] text-outline mt-0.5 truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {maskEmail(learnerEmail)}
                        </span>
                        {isEmailVerified && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-0.5">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>No email linked</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status pill & quick highlight */}
                <div className="mt-3 p-2.5 rounded-xl bg-surface-container-low/70 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-on-surface-variant font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-secondary" />
                    <span>
                      Level:{" "}
                      <strong className="text-on-surface font-bold">
                        Explorer 3
                      </strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleNavigateToProfile}
                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    View Profile <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Menu Action Items */}
                <div className="mt-3 pt-2 border-t border-outline-variant/30 flex flex-col gap-1">
                  <button
                    type="button"
                    id="btn-dropdown-profile"
                    onClick={handleNavigateToProfile}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-surface-container text-xs font-semibold text-on-surface flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span>Account & Security</span>
                    </div>
                    <span className="text-[10px] text-outline">Manage</span>
                  </button>

                  <button
                    type="button"
                    id="btn-dropdown-switch"
                    onClick={handleSwitchAccount}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-surface-container text-xs font-semibold text-on-surface flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-outline" />
                      <span>Switch Account</span>
                    </div>
                  </button>

                  {/* Logout Button */}
                  <button
                    type="button"
                    id="btn-dropdown-logout"
                    onClick={handleLogoutClick}
                    className="w-full mt-1 px-3 py-2 text-left rounded-xl bg-error-container/10 hover:bg-error-container/30 text-error text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-error" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
