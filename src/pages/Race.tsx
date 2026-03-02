import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type TeamKey =
  | "Red Bull"
  | "Ferrari"
  | "Mercedes"
  | "McLaren"
  | "Aston Martin"
  | "Alpine"
  | "Williams"
  | "Haas"
  | "Kick Sauber"
  | "RB";

type Driver = { name: string; number: string };

type Team = {
  key: TeamKey;
  color: string; // placeholder "logo" color for now
  drivers: [Driver, Driver];
};

function Dot({ className = "" }: { className?: string }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${className}`} />;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[12px] text-white/80">
      {children}
    </span>
  );
}

function ModalShell({
  title,
  subtitle,
  open,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <button
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* modal */}
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-black/70 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <div className="text-xs tracking-[0.2em] text-white/50">TEAM / DRIVER</div>
            <div className="mt-1 text-lg font-semibold text-white">{title}</div>
            {subtitle ? <div className="mt-1 text-sm text-white/60">{subtitle}</div> : null}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function Race() {
  const navigate = useNavigate();

  // ====== Demo race header pills (same vibe as your screenshot) ======
  const headerPills = useMemo(
    () => [
      <Pill key="live">
        <Dot className="bg-pitRed" />
        LIVE
      </Pill>,
      <Pill key="gp">Italian Grand Prix</Pill>,
      <Pill key="track">Monza</Pill>,
      <Pill key="lap">Lap 18/53</Pill>,
      <Pill key="flag">
        <Dot className="bg-green-500" />
        GREEN FLAG
      </Pill>,
      <Pill key="sc">SC NONE</Pill>,
      <Pill key="temp">Track 32°C</Pill>,
      <Pill key="rain">Rain 5%</Pill>,
    ],
    []
  );

  // ====== Team + Driver selection modal state ======
  const teams: Team[] = useMemo(
    () => [
      { key: "Red Bull", color: "bg-blue-600", drivers: [{ name: "Max Verstappen", number: "#1" }, { name: "Sergio Pérez", number: "#11" }] },
      { key: "Ferrari", color: "bg-red-600", drivers: [{ name: "Charles Leclerc", number: "#16" }, { name: "Carlos Sainz", number: "#55" }] },
      { key: "Mercedes", color: "bg-emerald-500", drivers: [{ name: "Lewis Hamilton", number: "#44" }, { name: "George Russell", number: "#63" }] },
      { key: "McLaren", color: "bg-orange-500", drivers: [{ name: "Lando Norris", number: "#4" }, { name: "Oscar Piastri", number: "#81" }] },
      { key: "Aston Martin", color: "bg-green-600", drivers: [{ name: "Fernando Alonso", number: "#14" }, { name: "Lance Stroll", number: "#18" }] },
      { key: "Alpine", color: "bg-sky-500", drivers: [{ name: "Pierre Gasly", number: "#10" }, { name: "Esteban Ocon", number: "#31" }] },
      { key: "Williams", color: "bg-indigo-500", drivers: [{ name: "Alex Albon", number: "#23" }, { name: "Logan Sargeant", number: "#2" }] },
      { key: "Haas", color: "bg-zinc-400", drivers: [{ name: "Kevin Magnussen", number: "#20" }, { name: "Nico Hülkenberg", number: "#27" }] },
      { key: "Kick Sauber", color: "bg-lime-500", drivers: [{ name: "Valtteri Bottas", number: "#77" }, { name: "Zhou Guanyu", number: "#24" }] },
      { key: "RB", color: "bg-fuchsia-500", drivers: [{ name: "Yuki Tsunoda", number: "#22" }, { name: "Daniel Ricciardo", number: "#3" }] },
    ],
    []
  );

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  function openTeamPicker() {
    setTeamModalOpen(true);
  }

  function closeTeamPicker() {
    setTeamModalOpen(false);
  }

  function pickTeam(team: Team) {
    setSelectedTeam(team);
    setSelectedDriver(null);
  }

  function pickDriver(driver: Driver) {
    setSelectedDriver(driver);
    setTeamModalOpen(false);
  }

  function clearTeam() {
    setSelectedTeam(null);
    setSelectedDriver(null);
  }

  // ====== Background (whole Race page) ======
  // Put an image at: public/images/race-bg.jpg
  // (Step 2 below shows the command)
  const bgUrl = "/images/race-bg.jpg";

  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.72), rgba(0,0,0,.85)), url(${bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.25em] text-white/40">
              RACE <span className="text-pitRed">CONSOLE</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">{headerPills}</div>
          </div>

          {/* ✅ Removed "Go to Strategy" button as requested */}
        </div>

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left: Track Map + stats */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold tracking-wide">TRACK MAP</div>
                <div className="text-xs text-white/50">Live positions (soon)</div>
              </div>

              <div className="mt-3 flex h-[340px] items-center justify-center rounded-xl border border-white/10 bg-black/30">
                <div className="text-center">
                  <div className="text-base font-semibold text-white/80">Track visualization will go here</div>
                  <div className="mt-2 text-sm text-white/50">
                    Next: render the circuit and animate car markers using OpenF1 position data.
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="text-[10px] tracking-[0.25em] text-white/40">LEADER</div>
                  <div className="mt-1 text-sm font-semibold">VER</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="text-[10px] tracking-[0.25em] text-white/40">PIT WINDOW</div>
                  <div className="mt-1 text-sm font-semibold">OPEN</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="text-[10px] tracking-[0.25em] text-white/40">PIT CONG.</div>
                  <div className="mt-1 text-sm font-semibold">LOW</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="text-[10px] tracking-[0.25em] text-white/40">SAFETY</div>
                  <div className="mt-1 text-sm font-semibold">NONE</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Session + Team/Driver + Actions */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur">
              <div className="text-sm font-semibold">SESSION</div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/70 hover:bg-black/40">
                  Practice
                </button>
                <button className="flex-1 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/70 hover:bg-black/40">
                  Quali
                </button>
                <button className="flex-1 rounded-full border border-pitRed/40 bg-pitRed/10 px-3 py-2 text-sm text-white">
                  Live Race
                </button>
              </div>
              <div className="mt-3 text-xs text-white/45">
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur">
              <div className="text-sm font-semibold">TEAM / DRIVER</div>

              {/* Big “Select Team & Driver” button */}
              <button
                onClick={openTeamPicker}
                className="mt-3 w-full rounded-2xl border border-pitRed/30 bg-pitRed/10 p-4 text-left hover:bg-pitRed/15"
              >
                <div className="text-[10px] tracking-[0.25em] text-white/40">SELECTION</div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-base font-semibold">
                      {selectedTeam ? selectedTeam.key : "Select Team & Driver"}
                    </div>
                    <div className="mt-1 text-sm text-white/60">
                      {selectedTeam
                        ? selectedDriver
                          ? `${selectedDriver.name} ${selectedDriver.number}`
                          : "Team selected — pick a driver"
                        : "Tap to pick a team, then choose your driver."}
                    </div>
                  </div>
                  <div className="text-white/60">→</div>
                </div>
              </button>

              {selectedTeam ? (
                <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                  <span>Selected: {selectedTeam.key}</span>
                  <button onClick={clearTeam} className="text-pitRed hover:underline">
                    Clear
                  </button>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">QUICK ACTIONS</div>
              </div>

              <button
                onClick={() => navigate("/app/strategy")}
                className="mt-3 w-full rounded-xl bg-pitRed px-4 py-3 text-sm font-semibold text-white hover:brightness-110"
              >
                Open Strategy Panel →
              </button>

              <button
                disabled
                className="mt-2 w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/40"
              >
                View Race Strategies (soon)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Team/Driver picker */}
      <ModalShell
        open={teamModalOpen}
        onClose={closeTeamPicker}
        title={selectedTeam ? "Choose your driver" : "Choose your team"}
        subtitle={selectedTeam ? "Pick one of the two drivers." : "Tap a team to continue."}
      >
        {!selectedTeam ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {teams.map((t) => (
              <button
                key={t.key}
                onClick={() => pickTeam(t)}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:bg-black/55"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${t.color}`} />
                  <div>
                    <div className="font-semibold">{t.key}</div>
                    <div className="text-xs text-white/50">Tap to select</div>
                  </div>
                </div>
                <div className="text-white/50">→</div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/70">
                Team: <span className="font-semibold text-white">{selectedTeam.key}</span>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="text-sm text-pitRed hover:underline"
              >
                Change team
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {selectedTeam.drivers.map((d) => (
                <button
                  key={d.name}
                  onClick={() => pickDriver(d)}
                  className="rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:bg-black/55"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{d.name}</div>
                      <div className="text-xs text-white/50">Tap to confirm</div>
                    </div>
                    <div className="text-xs text-white/50">{d.number}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </ModalShell>
    </div>
  );
}
