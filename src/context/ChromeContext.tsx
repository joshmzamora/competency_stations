import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ChromeContextValue = {
  navHidden: boolean;
  setNavHidden: (hidden: boolean) => void;
};

const ChromeContext = createContext<ChromeContextValue | null>(null);

export function ChromeProvider({ children }: { children: ReactNode }) {
  const [navHidden, setNavHidden] = useState(false);
  const value = useMemo(() => ({ navHidden, setNavHidden }), [navHidden]);

  return <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>;
}

export function useAppChrome() {
  const context = useContext(ChromeContext);
  if (!context) {
    throw new Error("useAppChrome must be used inside ChromeProvider");
  }
  return context;
}
