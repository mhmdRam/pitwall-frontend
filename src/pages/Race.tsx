import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSessionMode,
  setSessionMode,
  getSelectedDriver,
  setSelectedDriver as storeSetSelectedDriver,
  setSelectedTeam as storeSetSelectedTeam,
  setRaceRunning,
  setReplayLap,
  setReplaySession,
} from "../state/pitwallStore";

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
  color: string;
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
      <button
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
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
  const [sessionModeState, setSessionModeState] = useState(getSessionMode());

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedTeamState, setSelectedTeamState] = useState<Team | null>(null);
  const [selectedDriverState, setSelectedDriverState] = useState<Driver | null>(null);

  const teams: Team[] = useMemo(
    () => [
      { key: "Red Bull", color: "bg-blue-600", drivers: [{ name: "Max Verstappen", number: "#1" }, { name: "Sergio Perez", number: "#11" }] },
      { key: "Ferrari", color: "bg-red-600", drivers: [{ name: "Charles Leclerc", number: "#16" }, { name: "Carlos Sainz", number: "#55" }] },
      { key: "Mercedes", color: "bg-emerald-500", drivers: [{ name: "Lewis Hamilton", number: "#44" }, { name: "George Russell", number: "#63" }] },
      { key: "McLaren", color: "bg-orange-500", drivers: [{ name: "Lando Norris", number: "#4" }, { name: "Oscar Piastri", number: "#81" }] },
      { key: "Aston Martin", color: "bg-green-600", drivers: [{ name: "Fernando Alonso", number: "#14" }, { name: "Lance Stroll", number: "#18" }] },
      { key: "Alpine", color: "bg-sky-500", drivers: [{ name: "Pierre Gasly", number: "#10" }, { name: "Esteban Ocon", number: "#31" }] },
      { key: "Williams", color: "bg-indigo-500", drivers: [{ name: "Alex Albon", number: "#23" }, { name: "Logan Sargeant", number: "#2" }] },
      { key: "Haas", color: "bg-zinc-400", drivers: [{ name: "Kevin Magnussen", number: "#20" }, { name: "Nico Hulkenberg", number: "#27" }] },
      { key: "Kick Sauber", color: "bg-lime-500", drivers: [{ name: "Valtteri Bottas", number: "#77" }, { name: "Zhou Guanyu", number: "#24" }] },
      { key: "RB", color: "bg-fuchsia-500", drivers: [{ name: "Yuki Tsunoda", number: "#22" }, { name: "Daniel Ricciardo", number: "#3" }] },
    ],
    []
  );

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
      <Pill key="temp">Track 32C</Pill>,
      <Pill key="rain">Rain 5%</Pill>,
    ],
    []
  );

  function openTeamPicker() {
    setTeamModalOpen(true);
  }
  function closeTeamPicker() {
    setTeamModalOpen(false);
  }
  function pickTeam(team: Team) {
    setSelectedTeamState(team);
    setSelectedDriverState(null);
  }
  function pickDriver(driver: Driver) {
    if (!selectedTeamState) return;

    setSelectedDriverState(driver);
    setTeamModalOpen(false);

    storeSetSelectedTeam(selectedTeamState.key);

    const num = Number(String(driver.number).replace("#", ""));
    if (Number.isFinite(num)) storeSetSelectedDriver(num);
  }
  function clearTeam() {
    setSelectedTeamState(null);
    setSelectedDriverState(null);
  }

  function chooseSession(mode: "practice" | "quali" | "race") {
    setSessionMode(mode);
    setSessionModeState(mode);
  }

  function startAndOpenStrategy() {
    const storedDriver = getSelectedDriver();
    const uiDriverOk = !!selectedDriverState;

    if (!storedDriver && !uiDriverOk) {
      setTeamModalOpen(true);
      return;
    }

    setReplaySession("9839");
    setReplayLap(1);
    setRaceRunning(true);

    navigate("/app/strategy");
  }

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
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.25em] text-white/40">
              RACE <span className="text-pitRed">CONSOLE</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{headerPills}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur">
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
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur">
              <div className="text-sm font-semibold">SESSION</div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => chooseSession("practice")}
                  className={`flex-1 rounded-full border border-white/10 px-3 py-2 text-sm hover:bg-black/40 ${
                    sessionModeState === "practice"
                      ? "bg-pitRed/10 text-white border-pitRed/40"
                      : "bg-black/30 text-white/70"
                  }`}
                >
                  Practice
                </button>
                <button
                  onClick={() => chooseSession("quali")}
                  className={`flex-1 rounded-full border border-white/10 px-3 py-2 text-sm hover:bg-black/40 ${
                    sessionModeState === "quali"
                      ? "bg-pitRed/10 text-white border-pitRed/40"
                      : "bg-black/30 text-white/70"
                  }`}
                >
                  Quali
                </button>
                <button
                  onClick={() => chooseSession("race")}
                  className={`flex-1 rounded-full border border-white/10 px-3 py-2 text-sm hover:bg-black/40 ${
                    sessionModeState === "race"
                      ? "bg-pitRed/10 text-white border-pitRed/40"
                      : "bg-black/30 text-white/70"
                  }`}
                >
                  Live Race
                </button>
              </div>

              <div className="mt-3 text-xs text-white/45">
                Selected: <span className="text-white/70">{sessionModeState}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur">
              <div className="text-sm font-semibold">TEAM / DRIVER</div>

              <button
                onClick={openTeamPicker}
                className="mt-3 w-full rounded-2xl border border-pitRed/30 bg-pitRed/10 p-4 text-left hover:bg-pitRed/15"
              >
                <div className="text-[10px] tracking-[0.25em] text-white/40">SELECTION</div>
                <div className="mt-1">
                  <div className="text-base font-semibold">
                    {selectedTeamState ? selectedTeamState.key : "Select Team & Driver"}
                  </div>
                  <div className="mt-1 text-sm text-white/60">
                    {selectedTeamState ? (
                      selectedDriverState ? (
                        `${selectedDriverState.name} ${selectedDriverState.number}`
                      ) : (
                        "Team selected — pick a driver"
                      )
                    ) : (
                      "Tap to pick a team, then choose your driver."
                    )}
                  </div>
                </div>
              </button>

              {selectedTeamState ? (
                <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                  <span>Selected: {selectedTeamState.key}</span>
                  <button onClick={clearTeam} className="text-pitRed hover:underline">
                    Clear
                  </button>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur">
              <div className="text-sm font-semibold">QUICK ACTIONS</div>

              <button
                onClick={startAndOpenStrategy}
                className="mt-3 w-full rounded-xl bg-pitRed px-4 py-3 text-sm font-semibold text-white hover:brightness-110"
              >
                Open Strategy Panel
              </button>
            </div>
          </div>
        </div>
      </div>

      <ModalShell
        open={teamModalOpen}
        onClose={closeTeamPicker}
        title={selectedTeamState ? "Choose your driver" : "Choose your team"}
        subtitle={selectedTeamState ? "Pick one of the two drivers." : "Tap a team to continue."}
      >
        {!selectedTeamState ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {teams.map((t) => (
              <button
                key={t.key}
                onClick={() => pickTeam(t)}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-4 text-left hover:bg-black/55"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${t.color}`} />;
                  <div>
                    <div className="font-semibold">{t.key}</div>
                    <div className="text-xs text-white/50">Tap to select</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {selectedTeamState.drivers.map((d) => (
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
        )}
      </ModalShell>
    </div>
  );
}
