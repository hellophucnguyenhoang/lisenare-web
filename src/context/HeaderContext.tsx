import React, { createContext, useContext, useState } from "react";

interface HeaderContextType {
  headerContent: React.ReactNode | null;
  setHeaderContent: (content: React.ReactNode | null) => void;
}

const HeaderContext = createContext<HeaderContextType>({
  headerContent: null,
  setHeaderContent: () => {},
});

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [headerContent, setHeaderContent] = useState<React.ReactNode | null>(
    null,
  );

  return (
    <HeaderContext.Provider value={{ headerContent, setHeaderContent }}>
      {children}
    </HeaderContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useHeader() {
  return useContext(HeaderContext);
}
