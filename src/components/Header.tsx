import { Menu } from "lucide-react";

interface HeaderProps {
  activeTab: "practice" | "collections" | "discover" | "profile";
  setActiveTab: (
    tab: "practice" | "collections" | "discover" | "profile",
  ) => void;
  clearSubviews: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  clearSubviews,
}: HeaderProps) {
  const navItems = [
    { id: "practice" as const, label: "Practice" },
    { id: "collections" as const, label: "Collections" },
    { id: "discover" as const, label: "Discover" },
    { id: "profile" as const, label: "Profile" },
  ];

  return (
    <header className="sticky top-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md shadow-xs h-16 flex justify-between items-center px-container-padding border-b border-outline-variant/15">
      <div className="flex items-center gap-4">
        {/* Mobile menu grid icon */}
        <button className="md:hidden p-2 -ml-2 rounded-full hover:bg-surface-container transition-all active:scale-95 duration-200">
          <Menu className="w-6 h-6 text-primary" />
        </button>
        <div
          onClick={() => {
            setActiveTab("collections");
            clearSubviews();
          }}
          className="flex items-center cursor-pointer group"
        >
          <div className="p-1.5 rounded-lg group-hover:bg-primary/20 transition-all">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 256 256"
              className="w-6 h-6 text-primary"
            >
              <rect width="240" height="240" x="8" y="8" fill="#fbfbfb" />
              <path
                fill="#0c7979"
                fillRule="evenodd"
                d="M73.834 23.662c-6.334 2.095-10.691 6.39-13.216 13.015l-.952 2.507-.117 46.238c-.065 25.426-.039 46.233.055 46.233.234 0 31.574-18.496 36.881-21.764l4.23-2.605v-33.2c0-26.712-.112-33.654-.58-35.529-1.5-6.021-5.798-11.255-11.364-13.847-3.047-1.42-3.635-1.542-7.946-1.675-3.658-.112-5.156.024-6.991.627m21.164 100.615c-2.907 1.736-12.095 7.204-20.413 12.147l-15.124 8.99v31.741c0 26.827.099 32.165.64 34.456 1.734 7.363 7.012 12.987 14.37 15.314 1.326.42 14.357.556 60.096.624 32.12.046 60.084-.073 62.143-.266 10.332-.967 17.64-8.998 17.64-19.398 0-9.589-6.528-17.964-15.287-19.615-1.331-.25-19.258-.41-45.924-.413-27.963 0-44.229-.153-45.209-.426-2.652-.731-4.31-2.145-5.663-4.823L101 180.07v-29.307c0-16.079-.094-29.258-.211-29.245-.117.01-2.595 1.43-5.79 2.759"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold font-display text-primary tracking-tight -ml-1.5">
            isenare
          </h1>
        </div>
      </div>

      {/* Desktop Responsive Header Navigation Items */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex gap-8 mr-8">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  clearSubviews();
                }}
                className={`font-semibold text-sm transition-colors py-2 tracking-wide ${
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

        {/* User avatar headshot */}
        <div
          onClick={() => {
            setActiveTab("profile");
            clearSubviews();
          }}
          className="w-10 h-10 rounded-full border-2 border-primary-fixed-dim overflow-hidden bg-surface-container-high transition-transform active:scale-95 cursor-pointer shadow-xs hover:border-primary"
          title="User profile picture"
        >
          <img
            className="w-full h-full object-cover"
            alt="User profile"
            src="/coder_cat.png"
          />
        </div>
      </div>
    </header>
  );
}
