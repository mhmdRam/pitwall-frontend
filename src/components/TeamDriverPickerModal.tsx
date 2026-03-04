import { useEffect, useMemo, useState } from "react";

type Driver = { id: string; name: string; number?: number };
type Team = { id: string; name: string; accent: string; drivers: Driver[] };

const TEAMS: Team[] = [
  { id: "redbull", name: "Red Bull", accent: "bg-blue-600", drivers: [{ id: "verstappen", name: "Max Verstappen", number: 1 }, { id: "perez", name: "Sergio Perez", number: 11 }] },
  { id: "ferrari", name: "Ferrari", accent: "bg-red-600", drivers: [{ id: "leclerc", name: "Charles Leclerc", number: 16 }, { id: "sainz", name: "Carlos Sainz", number: 55 }] },
  { id: "mercedes", name: "Mercedes", accent: "bg-emerald-500", drivers: [{ id: "hamilton", name: "Lewis Hamilton", number: 44 }, { id: "russell", name: "George Russell", number: 63 }] },
  { id: "mclaren", name: "McLaren", accent: "bg-orange-500", drivers: [{ id: "norris", name: "Lando Norris", number: 4 }, { id: "piastri", name: "Oscar Piastri", number: 81 }] },
  { id: "aston", name: "Aston Martin", accent: "bg-green-600", drivers: [{ id: "alonso", name: "Fernando Alonso", number: 14 }, { id: "stroll", name: "Lance Stroll", number: 18 }] },
  { id: "alpine", name: "Alpine", accent: "bg-sky-500", drivers: [{ id: "ocon", name: "Esteban Ocon", number: 31 }, { id: "gasly", name: "Pierre Gasly", number: 10 }] },
  { id: "williams", name: "Williams", accent: "bg-indigo-500", drivers: [{ id: "albon", name: "Alex Albon", number: 23 }, { id: "sargeant", name: "Logan Sargeant", number: 2 }] },
  { id: "haas", name: "Haas", accent: "bg-neutral-400", drivers: [{ id: "hulkenberg", name: "Nico Hulkenberg", number: 27 }, { id: "kevin", name: "Kevin Magnussen", number: 20 }] },
  { id: "sauber", name: "Kick Sauber", accent: "bg-lime-500", drivers: [{ id: "bottas", name: "Valtteri Bottas", number: 77 }, { id: "zhou", name: "Zhou Guanyu", number: 24 }] },
  { id: "rb", name: "RB", accent: "bg-fuchsia-600", drivers: [{ id: "tsunoda", name: "Yuki Tsunoda", number: 22 }, { id: "ricciardo", name: "Daniel Ricciardo", number: 3 }] },
];

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function TeamDriverPickerModal({
  open,
  onClose,
  value,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  value: { teamId?: string; driverId?: string };
  onChange: (next: { teamId?: string; driverId?: string }) => void;
}) {
  const [step, setStep] = useState<"team" | "driver">("team");

  const selectedTeam = useMemo(
    () => TEAMS.find((t) => t.id === value.teamId),
    [value.teamId]
  );

  useEffect(() => {
    if (!open) return;
    setStep(value.teamId ? "driver" : "team");
  }, [open, value.teamId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />

      {/* Panel */}
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-black/85 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <div className="text-xs tracking-widest text-white/50">TEAM / DRIVER</div>
            <div className="text-lg font-semibold text-white">
              {step === "team" ? "Choose your team" : "Choose your driver"}
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="p-5">
          {/* Step indicator */}
          <div className="mb-4 flex gap-2 text-xs">
            <span
              className={cx(
                "rounded-full px-3 py-1",
                step === "team" ? "bg-red-600/20 text-red-200" : "bg-white/5 text-white/60"
              )}
            >
            </span>
            <span
              className={cx(
                "rounded-full px-3 py-1",
                step === "driver" ? "bg-red-600/20 text-red-200" : "bg-white/5 text-white/60"
              )}
            >
            </span>
          </div>

          {step === "team" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TEAMS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onChange({ teamId: t.id, driverId: undefined });
                    setStep("driver");
                  }}
                  className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10"
                >
                  <span className={cx("h-10 w-10 rounded-xl", t.accent)} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-white/60">Tap to select</div>
                  </div>
                  <div className="text-white/40 group-hover:text-white/70">→</div>
                </button>
              ))}
            </div>
          )}

          {step === "driver" && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm text-white/70">
                  Team:{" "}
                  <span className="font-semibold text-white">
                    {selectedTeam ? selectedTeam.name : "—"}
                  </span>
                </div>

                <button
                  onClick={() => setStep("team")}
                  className="text-sm text-red-300 hover:text-red-200"
                >
                  Change team
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(selectedTeam?.drivers || []).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      onChange({ teamId: selectedTeam?.id, driverId: d.id });
                      onClose();
                    }}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10"
                  >
                    <div className="text-sm font-semibold text-white">
                      {d.name}
                      {typeof d.number === "number" ? (
                        <span className="ml-2 text-xs text-white/50">#{d.number}</span>
                      ) : null}
                    </div>
                    <div className="text-xs text-white/60">Tap to confirm</div>
                  </button>
                ))}
              </div>

              {!selectedTeam && (
                <div className="mt-4 text-sm text-white/60">
                  Pick a team first.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
