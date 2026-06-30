import { createContext, useContext, useState, ReactNode } from "react";

interface SiteContextType {
  selectedSite: string;
  setSelectedSite: (site: string) => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [selectedSite, setSelectedSite] = useState("Nutrien Allan");

  return (
    <SiteContext.Provider value={{ selectedSite, setSelectedSite }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error("useSite must be used within a SiteProvider");
  }
  return context;
}
