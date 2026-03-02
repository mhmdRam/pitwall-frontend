import React, { createContext, useContext, useMemo, useState } from "react";

export type AppMode = "fan" | "analyst";

type ModeCtx = {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  toggleMode: () => void;
};

const Ctx = createContext<ModeCtx | null>(null);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppMode>("fan");

  const value = useMemo<ModeCtx>(() => {
    return {
      mode,
      setMode,
      toggleMode: () => setMode((m) => (m === "fan" ? "analyst" : "fan")),
    };
  }, [mode]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMode() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useMode must be used inside <ModeProvider>");
  return v;
}
