import { useEffect, useMemo, useRef, useState } from "react";
import {
  getProfileName as getStoredProfileName,
  getSelectedDriver,
  getSelectedTeam,
  getReplaySession,
} from "../state/pitwallStore";

type SuggestionCard = {
  title: string;
  subtitle: string;
  confidence: number;
  reasons?: string[];
  totalPitLoss?: number;
};

type DriverInfo = {
  team: string;
  name: string;
  number: string;
};

const REPLAY_START_LAP = 1;
const REPLAY_MAX_LAP = 53;
const POLL_MS = 2500;
const ALERT_MS = 5000;

const DRIVER_LOOKUP: Record<string, DriverInfo> = {
  "1": { team: "Red Bull", name: "Max Verstappen", number: "#1" },
  "11": { team: "Red Bull", name: "Sergio Perez", number: "#11" },
  "16": { team: "Ferrari", name: "Charles Leclerc", number: "#16" },
  "55": { team: "Ferrari", name: "Carlos Sainz", number: "#55" },
  "44": { team: "Mercedes", name: "Lewis Hamilton", number: "#44" },
  "63": { team: "Mercedes", name: "George Russell", number: "#63" },
  "4": { team: "McLaren", name: "Lando Norris", number: "#4" },
  "81": { team: "McLaren", name: "Oscar Piastri", number: "#81" },
  "14": { team: "Aston Martin", name: "Fernando Alonso", number: "#14" },
  "18": { team: "Aston Martin", name: "Lance Stroll", number: "#18" },
  "10": { team: "Alpine", name: "Pierre Gasly", number: "#10" },
  "31": { team: "Alpine", name: "Esteban Ocon", number: "#31" },
  "23": { team: "Williams", name: "Alex Albon", number: "#23" },
  "2": { team: "Williams", name: "Logan Sargeant", number: "#2" },
  "20": { team: "Haas", name: "Kevin Magnussen", number: "#20" },
  "27": { team: "Haas", name: "Nico Hulkenberg", number: "#27" },
  "77": { team: "Kick Sauber", name: "Valtteri Bottas", number: "#77" },
  "24": { team: "Kick Sauber", name: "Zhou Guanyu", number: "#24" },
  "22": { team: "RB", name: "Yuki Tsunoda", number: "#22" },
  "3": { team: "RB", name: "Daniel Ricciardo", number: "#3" },
};

function normalizeBackendToSuggestion(data: any): SuggestionCard | null {
  const rec = String(data?.recommendation || "").toUpperCase();
  const confidence = Number(data?.confidence ?? 0);

  if (!rec.includes("PIT")) return null;

  return {
    title: "Pit Window Open",
    subtitle: String(data?.summary || "Pit window looks favorable."),
    confidence: Number.isFinite(confidence) ? confidence : 0,
    reasons: Array.isArray(data?.reasons) ? data.reasons : [],
    totalPitLoss: Number(data?.totalPitLoss),
  };
}

export default function Strategy() {
  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:3001";
  const bgUrl = import.meta.env.VITE_STRATEGY_BG || "/strategy-bg.jpg";

  const profileName = useMemo(() => getStoredProfileName() || "Fan", []);

  const selectedDriverValue = useMemo(() => getSelectedDriver(), []);
  const selectedTeamValue = useMemo(() => getSelectedTeam(), []);
  const replaySession = useMemo(() => getReplaySession() || "9839", []);

  const selectedDriverInfo = useMemo(() => {
    return DRIVER_LOOKUP[String(selectedDriverValue)] || null;
  }, [selectedDriverValue]);

  const selectedDriverNumber = useMemo(() => {
    const n = Number(selectedDriverValue);
    return Number.isFinite(n) ? n : 55;
  }, [selectedDriverValue]);

  const selectedTeamLabel = selectedTeamValue || selectedDriverInfo?.team || "No team selected";
  const selectedDriverLabel = selectedDriverInfo
    ? selectedDriverInfo.name + " " + selectedDriverInfo.number
    : selectedDriverValue
      ? "Driver #" + selectedDriverValue
      : "No driver selected";

  const [statusText, setStatusText] = useState("Idle (press Start)");
  const [available, setAvailable] = useState<SuggestionCard[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeAlert, setActiveAlert] = useState<SuggestionCard | null>(null);

  const pollLock = useRef(false);
  const replayLapRef = useRef<number>(REPLAY_START_LAP);
  const alertTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (alertTimerRef.current) {
        window.clearTimeout(alertTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const id = window.setInterval(() => {
      void fetchRecommendation();
    }, POLL_MS);

    return () => window.clearInterval(id);
  }, [isRunning]);

  function showAlert(suggestion: SuggestionCard) {
    setActiveAlert(suggestion);

    if (alertTimerRef.current) {
      window.clearTimeout(alertTimerRef.current);
    }

    alertTimerRef.current = window.setTimeout(() => {
      setActiveAlert(null);
      alertTimerRef.current = null;
    }, ALERT_MS);
  }

  function dismissAlert() {
    if (alertTimerRef.current) {
      window.clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
    }
    setActiveAlert(null);
    setStatusText("Alert dismissed");
  }

  function confirmPitNow() {
    if (alertTimerRef.current) {
      window.clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
    }
    setActiveAlert(null);
    setStatusText("Pit call confirmed for " + selectedDriverLabel);
  }

  async function fetchRecommendation() {
    if (pollLock.current) return;
    pollLock.current = true;

    try {
      setStatusText(
        "Fetching replay recommendation (session " +
          replaySession +
          ", lap " +
          String(replayLapRef.current) +
          ", driver " +
          String(selectedDriverNumber) +
          ")..."
      );

      const base = String(apiBase).replace(/\/$/, "");
      const url = base + "/strategy/replay";

      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session: replaySession,
          driver: selectedDriverNumber,
          lap: replayLapRef.current,
        }),
      });

      if (!r.ok) {
        setStatusText("Backend error (" + String(r.status) + ")");
        return;
      }

      const data = await r.json();
      const suggestion = normalizeBackendToSuggestion(data);

      if (replayLapRef.current < REPLAY_MAX_LAP) {
        replayLapRef.current += 1;
      } else {
        setStatusText("Replay finished (lap " + String(REPLAY_MAX_LAP) + ")");
        setIsRunning(false);
      }

      if (!suggestion) return;

      setAvailable((prev) => [suggestion, ...prev].slice(0, 30));
      setStatusText("PIT opportunity detected for " + selectedDriverLabel);
      showAlert(suggestion);
    } catch (_e) {
      setStatusText("Error contacting backend");
    } finally {
      pollLock.current = false;
    }
  }

  return (
    <div
      className="min-h-screen w-full text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.72), rgba(0,0,0,.85)), url(${bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {activeAlert ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-yellow-300/60 bg-yellow-500/15 p-6 shadow-[0_0_40px_rgba(255,220,80,0.35)] backdrop-blur-xl">
            <div className="text-center">
              <div className="text-[11px] font-semibold tracking-[0.35em] text-yellow-200">
                STRATEGY ALERT
              </div>
              <div className="mt-3 text-3xl font-extrabold text-yellow-100">
                {activeAlert.title}
              </div>
              <div className="mt-2 text-base text-white/85">{selectedDriverLabel}</div>
              <div className="mt-3 text-sm text-white/80">{activeAlert.subtitle}</div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs text-yellow-100/80">
                <span>Confidence</span>
                <span>{Math.round(activeAlert.confidence * 100)}%</span>
              </div>
              <div className="h-3 rounded-full bg-black/25">
                <div
                  className="h-3 rounded-full bg-yellow-300 shadow-[0_0_18px_rgba(255,230,120,0.8)]"
                  style={{ width: `${Math.max(8, Math.round(activeAlert.confidence * 100))}%` }}
                />
              </div>
            </div>

            {typeof activeAlert.totalPitLoss === "number" && Number.isFinite(activeAlert.totalPitLoss) ? (
              <div className="mt-4 text-center text-sm text-yellow-50/90">
                Estimated pit loss: {activeAlert.totalPitLoss.toFixed(2)}s
              </div>
            ) : null}

            {activeAlert.reasons?.length ? (
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-white/80">
                {activeAlert.reasons.slice(0, 5).map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            ) : null}

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={confirmPitNow}
                className="rounded-xl bg-yellow-300 px-5 py-3 text-sm font-bold text-black shadow-[0_0_18px_rgba(255,230,120,0.65)] hover:bg-yellow-200"
              >
                PIT NOW
              </button>
              <button
                onClick={dismissAlert}
                className="rounded-xl border border-white/20 bg-black/25 px-5 py-3 text-sm font-semibold text-white hover:bg-black/35"
              >
                DISMISS
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 pt-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs tracking-widest text-white/60">STRATEGY</div>
            <h1 className="mt-2 text-3xl font-semibold">PitWall Strategy Hub</h1>
            <div className="mt-2 text-sm text-white/60">{statusText}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/80">
                Team: {selectedTeamLabel}
              </div>
              <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/80">
                Driver: {selectedDriverLabel}
              </div>
              <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/80">
                Replay Session: {replaySession}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!isRunning ? (
              <button
                className="rounded-xl bg-red-600 px-4 py-2 font-semibold hover:bg-red-500"
                onClick={() => {
                  replayLapRef.current = REPLAY_START_LAP;
                  setAvailable([]);
                  setActiveAlert(null);
                  setIsRunning(true);
                  setStatusText("Replay started for " + selectedDriverLabel);
                }}
              >
                Start
              </button>
            ) : (
              <button
                className="rounded-xl bg-white/10 px-4 py-2 font-semibold hover:bg-white/15"
                onClick={() => {
                  setIsRunning(false);
                  setStatusText("Stopped");
                }}
              >
                Stop
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Available Strategies</h2>
              <div className="text-xs text-white/50">Logged recommendations</div>
            </div>

            <div className="mt-4 space-y-3">
              {available.length === 0 ? (
                <div className="text-sm text-white/60">Waiting for the first PIT recommendation...</div>
              ) : (
                available.map((s, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{s.title}</div>
                      <div className="text-white/70">{Math.round(s.confidence * 100)}%</div>
                    </div>
                    <div className="mt-1 text-sm text-white/70">{s.subtitle}</div>
                    {typeof s.totalPitLoss === "number" && Number.isFinite(s.totalPitLoss) ? (
                      <div className="mt-2 text-xs text-white/60">
                        Estimated pit loss: {s.totalPitLoss.toFixed(2)}s
                      </div>
                    ) : null}
                    {s.reasons?.length ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-white/60">
                        {s.reasons.slice(0, 5).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur">
            <h2 className="text-lg font-semibold">Fan Leaderboard</h2>
            <div className="mt-2 text-sm text-white/60">Points reward fast confirmations.</div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="text-xs text-white/50">You are</div>
              <div className="mt-1 text-lg font-semibold">{profileName}</div>
              <div className="mt-3 text-xs text-white/50">
                (MVP scoring: Confirming a live call awards +15 points.)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
