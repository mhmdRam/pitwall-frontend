import React, { useEffect, useMemo, useRef, useState } from "react";

type StrategySuggestion = {
  id: string;
  title: string;
  confidence: number; // 0..1
  summary: string;
  details: string[];
};

type LeaderEntry = { name: string; points: number };

const LS_LEADERBOARD = "pitwall:leaderboard";
const LS_FANNAME = "pitwall:fanName";

// Background file you control:
// Put your image in: /public/backgrounds/
// Rename it to: strategy-bg.jpg (or change this constant)
const BG_URL = "/backgrounds/strategy-bg.jpg";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function loadBoard(): LeaderEntry[] {
  const seed: LeaderEntry[] = [
    { name: "ApexHunter", points: 120 },
    { name: "PitSensei", points: 95 },
    { name: "UndercutPro", points: 70 },
    { name: "Fan", points: 0 },
  ];
  const parsed = safeJsonParse<LeaderEntry[]>(localStorage.getItem(LS_LEADERBOARD), seed);
  return Array.isArray(parsed) ? parsed : seed;
}

function saveBoard(data: LeaderEntry[]) {
  localStorage.setItem(LS_LEADERBOARD, JSON.stringify(data));
}

function normalizeBackendToSuggestion(res: any): StrategySuggestion | null {
  if (!res) return null;

  const rec = res.recommendation ?? res.call ?? res.decision ?? null;
  if (!rec) return null;

  const confRaw = typeof res.confidence === "number" ? res.confidence : 0.65;
  const confidence = clamp01(confRaw);

  const recStr = String(rec);
  const title = recStr.toUpperCase().includes("PIT") ? "Pit Window Open" : recStr;

  const summary =
    typeof res.summary === "string" && res.summary.trim().length
      ? res.summary
      : "A live recommendation was generated from the current race context.";

  const details: string[] = [];

  if (Array.isArray(res.reasons)) {
    for (const r of res.reasons) details.push(String(r));
  }

  const explanation = res.explanation ?? res.reasoning ?? "";
  if (typeof explanation === "string" && explanation.trim().length) {
    const parts = explanation
      .split(/[\n•-]+/)
      .map((s: string) => s.trim())
      .filter(Boolean)
      .slice(0, 4);
    for (const p of parts) details.push(p);
  }

  if (details.length === 0) {
    details.push("Confidence is calculated from pit loss, traffic, and safety-car context.");
    details.push("Recommendation is generated using the current race state features.");
  }

  return {
    id: String(Date.now()),
    title,
    confidence,
    summary,
    details,
  };
}

export default function Strategy() {
  const apiBase = useMemo(() => {
    const env = (import.meta as any).env;
    return env && env.VITE_API_BASE ? String(env.VITE_API_BASE) : "";
  }, []);

  const [fanName, setFanName] = useState<string>(localStorage.getItem(LS_FANNAME) || "Fan");
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>(() => loadBoard());

  const [liveCard, setLiveCard] = useState<StrategySuggestion | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(7);
  const [available, setAvailable] = useState<StrategySuggestion[]>([]);
  const [statusText, setStatusText] = useState<string>("Live engine connected");

  const pollLock = useRef(false);

  function persistFanName(next?: string) {
    const v = typeof next === "string" ? next : fanName;
    localStorage.setItem(LS_FANNAME, v);
  }

  function deleteFan(name: string) {
    const updated = leaderboard.filter((x) => x.name !== name);
    setLeaderboard(updated);
    saveBoard(updated);

    if (name === fanName) {
      setFanName("Fan");
      persistFanName("Fan");
    }
  }

  function awardPoints(points: number) {
    const cleanName = (fanName || "Fan").trim() || "Fan";

    const updated = [...leaderboard];
    const idx = updated.findIndex((u) => u.name === cleanName);

    if (idx === -1) updated.push({ name: cleanName, points });
    else updated[idx] = { ...updated[idx], points: updated[idx].points + points };

    updated.sort((a, b) => b.points - a.points);
    setLeaderboard(updated);
    saveBoard(updated);

    if (cleanName !== fanName) setFanName(cleanName);
    persistFanName(cleanName);
  }

  function confirmPit() {
    awardPoints(15);
    if (liveCard) setAvailable((prev) => [liveCard, ...prev]);
    setLiveCard(null);
  }

  function dismissCard() {
    if (liveCard) setAvailable((prev) => [liveCard, ...prev]);
    setLiveCard(null);
  }

  async function fetchRecommendation() {
    if (pollLock.current) return;
    pollLock.current = true;

    try {
      setStatusText("Fetching live recommendation...");

      const payload = {
        mode: "fan",
        tyreAgeLaps: 18,
        pitCongestion: 0.2,
        scProbability: 0.15,
        undercutOpportunity: true,
        pitLossThreshold: 55,
        features: {
          lane: { meeting_key: "9839", lap_number: 18, pit_congestion_30s: 0.2 },
          in: {
            meeting_key: "9839",
            lap_number: 18,
            pit_congestion_30s: 0.2,
            baseline_lap_duration: 90,
            sc_state: 0,
            vsc_state: 0,
          },
          out: {
            meeting_key: "9839",
            lap_number: 18,
            pit_congestion_30s: 0.2,
            baseline_lap_duration: 90,
            sc_state: 0,
            vsc_state: 0,
          },
        },
      };

      const base = apiBase ? String(apiBase).replace(/\/$/, "") : "";
      const url = base + "/strategy/evaluate";

      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        setStatusText("Backend error (" + String(r.status) + ")");
        return;
      }

      const data = await r.json();
      const suggestion = normalizeBackendToSuggestion(data);

      if (!suggestion) {
        setStatusText("No recommendation returned");
        return;
      }

      setLiveCard(suggestion);
      setSecondsLeft(7);
      setStatusText("Live engine connected");
    } catch {
      setStatusText("Backend not reachable");
    } finally {
      pollLock.current = false;
    }
  }

  useEffect(() => {
    fetchRecommendation();
    const id = window.setInterval(fetchRecommendation, 12000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  useEffect(() => {
    if (!liveCard) return;

    if (secondsLeft <= 0) {
      setAvailable((prev) => [liveCard, ...prev]);
      setLiveCard(null);
      return;
    }

    const t = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [liveCard, secondsLeft]);

  return (
    <div className="relative min-h-screen text-white">
      {/* Background controlled by file in /public/backgrounds */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('" + BG_URL + "')" }}
      />
      <div className="absolute inset-0 bg-black/75" />

      {/* Live pop-up */}
      {liveCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-black/80 backdrop-blur-md p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs tracking-widest text-white/60">LIVE RECOMMENDATION</div>
                <div className="text-2xl font-semibold mt-2">{liveCard.title}</div>
                <div className="text-sm text-white/70 mt-2">{liveCard.summary}</div>
              </div>
              <div className="text-sm text-white/60">{secondsLeft}s</div>
            </div>

            <div className="mt-5 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600"
                style={{ width: Math.round(liveCard.confidence * 100) + "%" }}
              />
            </div>

            <div className="mt-4 text-sm text-white/70">
              <ul className="list-disc pl-5 space-y-1">
                {liveCard.details.slice(0, 4).map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={confirmPit}
                className="bg-red-600 px-5 py-3 rounded-xl font-semibold hover:brightness-110"
              >
                Confirm Pit →
              </button>
              <button
                onClick={dismissCard}
                className="border border-white/20 px-5 py-3 rounded-xl hover:bg-white/10"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="text-xs tracking-widest text-white/60">STRATEGY</div>
            <div className="text-3xl font-semibold mt-1">PitWall Strategy Hub</div>
            <div className="text-sm text-white/70 mt-2">
              Live strategy calls backed by confidence and clear reasoning.
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/70">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              {statusText}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/55 backdrop-blur-md p-6">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Available Strategies</div>
              <div className="text-xs text-white/50">Logged recommendations</div>
            </div>

            <div className="mt-4 space-y-4">
              {available.length === 0 ? (
                <div className="text-white/60 text-sm">Waiting for the first live recommendation...</div>
              ) : (
                available.map((s) => (
                  <div key={s.id} className="rounded-xl border border-white/10 bg-black/35 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{s.title}</div>
                        <div className="text-sm text-white/70 mt-1">{s.summary}</div>
                      </div>
                      <div className="text-sm text-white/60">{Math.round(s.confidence * 100)}%</div>
                    </div>

                    <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600"
                        style={{ width: Math.round(s.confidence * 100) + "%" }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Leaderboard card (profile is inside here only) */}
          <div className="rounded-2xl border border-white/10 bg-black/55 backdrop-blur-md p-6">
            <div className="text-lg font-semibold">Fan Leaderboard</div>
            <div className="text-sm text-white/60 mt-1">Points reward fast confirmations.</div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/35 p-3">
              <div className="text-xs text-white/60">You are</div>
              <div className="mt-2 flex gap-2">
                <input
                  value={fanName}
                  onChange={(e) => setFanName(e.target.value)}
                  className="flex-1 rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none"
                  placeholder="Your name"
                />
                <button
                  onClick={() => persistFanName()}
                  className="rounded-xl border border-white/15 bg-black/40 px-4 py-2 text-sm hover:bg-white/10"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {leaderboard.map((u, i) => (
                <div
                  key={u.name + "-" + i}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/35 px-4 py-3"
                >
                  <div className="text-sm">
                    <span className="text-white/50 mr-2">{i + 1}</span>
                    {u.name}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-white/80">{u.points} pts</div>
                    <button
                      onClick={() => deleteFan(u.name)}
                      className="text-xs rounded-lg border border-white/15 px-2 py-1 hover:bg-white/10"
                      aria-label={"Delete " + u.name}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 text-xs text-white/50">MVP scoring: Confirming a live call awards +15 points.</div>
          </div>
        </div>
      </div>
    </div>
  );
}