import { useEffect, useMemo, useRef, useState } from "react";

type SuggestionCard = {
  title: string;
  subtitle: string;
  confidence: number;
  reasons?: string[];
  totalPitLoss?: number;
};

const REPLAY_SESSION = "9839";
const REPLAY_START_LAP = 1;
const REPLAY_MAX_LAP = 53;
const POLL_MS = 2500;

function getProfileName() {
  try {
    return localStorage.getItem("pitwall_profile_name") || "Fan";
  } catch {
    return "Fan";
  }
}

function normalizeBackendToSuggestion(data: any): SuggestionCard | null {
  const rec = String(data?.recommendation || "").toUpperCase();
  const confidence = Number(data?.confidence ?? 0);

  // Only create a visible strategy card if backend says PIT
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
  
  const profileName = useMemo(() => getProfileName(), []);

  const [statusText, setStatusText] = useState("Idle (press Start)");
  const [available, setAvailable] = useState<SuggestionCard[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const pollLock = useRef(false);
  const replayLapRef = useRef<number>(REPLAY_START_LAP);

  // Start/stop polling
  useEffect(() => {
    if (!isRunning) return;

    const id = window.setInterval(() => {
      void fetchRecommendation();
    }, POLL_MS);

    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  async function fetchRecommendation() {
    if (pollLock.current) return;
    pollLock.current = true;

    try {
      setStatusText(
        "Fetching replay recommendation (session " +
          REPLAY_SESSION +
          ", lap " +
          String(replayLapRef.current) +
          ")..."
      );

      const base = String(apiBase).replace(/\/$/, "");
      const url = base + "/strategy/replay";

      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session: REPLAY_SESSION,
          driver: 55,
          lap: replayLapRef.current,
        }),
      });

      if (!r.ok) {
        setStatusText("Backend error (" + String(r.status) + ")");
        return;
      }

      const data = await r.json();

      const suggestion = normalizeBackendToSuggestion(data);

      // Advance lap every poll
      if (replayLapRef.current < REPLAY_MAX_LAP) replayLapRef.current += 1;
      else {
        setStatusText("Replay finished (lap " + String(REPLAY_MAX_LAP) + ")");
        setIsRunning(false);
      }

      if (!suggestion) {
        // No PIT call: don’t add anything
        return;
      }

      // Add PIT call
      setAvailable((prev) => [suggestion, ...prev].slice(0, 30));
      setStatusText("PIT opportunity detected");
    } catch (e) {
      setStatusText("Error contacting backend");
    } finally {
      pollLock.current = false;
    }
  }

  return (
    <div className="min-h-screen w-full text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.72), rgba(0,0,0,.85)),url(${import.meta.env.VITE_STRATEGY_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 pt-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs tracking-widest text-white/60">STRATEGY</div>
            <h1 className="mt-2 text-3xl font-semibold">PitWall Strategy Hub</h1>
            <div className="mt-2 text-sm text-white/60">{statusText}</div>
          </div>

          <div className="flex gap-2">
            {!isRunning ? (
              <button
                className="rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 font-semibold"
                onClick={() => {
                  replayLapRef.current = REPLAY_START_LAP;
                  setAvailable([]);
                  setIsRunning(true);
                  setStatusText("Replay started");
                }}
              >
                Start
              </button>
            ) : (
              <button
                className="rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 font-semibold"
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
                <div className="text-white/60 text-sm">Waiting for the first PIT recommendation…</div>
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
                      <ul className="mt-2 text-xs text-white/60 list-disc pl-5 space-y-1">
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
