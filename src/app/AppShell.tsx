import { Outlet, NavLink } from "react-router-dom";
import { useMode } from "../state/mode";

function TabLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex-1 text-center py-3 text-sm font-semibold",
          isActive ? "text-pitRed" : "text-white/60",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export default function AppShell() {
  const { mode, setMode } = useMode();

  return (
    <div className="min-h-screen flex flex-col bg-pitBg text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-pitRed" />
            <div className="font-extrabold tracking-wide">PITWALL AI</div>
          </div>

          {/* Mode toggle (Fan-first, Analyst ready) */}
          <div className="flex rounded-xl border border-white/10 bg-black/40 p-1">
            <button
              onClick={() => setMode("fan")}
              className={
                "px-3 py-2 text-sm rounded-lg " +
                (mode === "fan" ? "bg-white/10 text-white" : "text-white/60")
              }
            >
              Fan
            </button>
            <button
              onClick={() => setMode("analyst")}
              className={
                "px-3 py-2 text-sm rounded-lg " +
                (mode === "analyst" ? "bg-white/10 text-white" : "text-white/60")
              }
            >
              Analyst
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom nav (mobile-first) */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black/70 backdrop-blur">
        <div className="max-w-3xl mx-auto flex h-16 px-2" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <TabLink to="/app/home" label="Home" />
          <TabLink to="/app/race" label="Race" />
          <TabLink to="/app/strategy" label="Strategy" />
        </div>
      </nav>
    </div>
  );
}