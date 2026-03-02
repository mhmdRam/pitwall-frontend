import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-semibold tracking-wide text-white/80 backdrop-blur">
      {children}
    </span>
  );
}

function Dot({ className = "" }: { className?: string }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${className}`} />;
}

function FeatureCard({
  chip,
  title,
  desc,
  onClick,
}: {
  chip: string;
  title: string;
  desc: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-full w-full text-left rounded-2xl border border-white/10 bg-black/45 backdrop-blur p-5 transition hover:-translate-y-1 hover:border-white/20 overflow-hidden focus:outline-none focus:ring-2 focus:ring-pitRed/40 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_14px_50px_rgba(0,0,0,0.55)]"
    >
      <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-pitRed/18 blur-3xl opacity-60 group-hover:opacity-80 transition" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-transparent" />

      <div className="absolute left-0 top-5 h-12 w-1.5 rounded-full bg-pitRed/90" />

      <div className="pl-3 flex h-full flex-col">
        <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-semibold tracking-wide text-white/80">
          <Dot className="bg-pitRed" />
          {chip}
        </div>

        <div className="mt-4 text-base font-extrabold tracking-wide text-white/95">
          {title}
        </div>

        <div className="mt-2 text-sm text-white/65 leading-relaxed">{desc}</div>

        <div className="mt-auto pt-4 text-xs text-white/45 group-hover:text-white/55 transition">
          Tap to explore →
        </div>
      </div>
    </button>
  );
}

export default function Home() {
  const nav = useNavigate();

  const live = useMemo(
    () => ({
      gp: "Italian Grand Prix",
      track: "Monza",
      lap: 18,
      total: 53,
      flag: "GREEN FLAG",
      trackTemp: "32°C",
      rain: "5%",
    }),
    []
  );

  return (
    <div className="px-4 sm:px-6 py-5 sm:py-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/60">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: "url(/hero.jpg)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/70 to-black/90" />
          <div className="absolute inset-0 shadow-[inset_0_0_140px_rgba(0,0,0,0.9)]" />
        </div>

        <div className="relative p-6 sm:p-10">
          <div className="text-[12px] tracking-[0.22em] text-white/70 font-extrabold">
            F1 STRATEGY <span className="text-pitRed">MONITOR</span>
          </div>

          {/* Top live pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Pill>
              <Dot className="bg-pitRed" />
              LIVE
            </Pill>
            <Pill>
              <span className="text-white/60">{live.gp}</span>
              <span className="text-white/35">•</span>
              <span className="text-white/85">{live.track}</span>
            </Pill>
            <Pill>
              Lap{" "}
              <span className="text-white/90 font-extrabold">
                {live.lap}/{live.total}
              </span>
            </Pill>
            <Pill>
              <Dot className="bg-emerald-400" />
              {live.flag}
            </Pill>
            <Pill>Track {live.trackTemp}</Pill>
            <Pill>Rain {live.rain}</Pill>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-pitRed/30 bg-pitRed/15 px-4 py-2 text-xs font-semibold text-white/90">
              <Dot className="bg-pitRed" />
              LIVE RACE DATA
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-5xl sm:text-6xl font-black italic tracking-tight leading-none text-white">
              MASTER
            </div>
            <div className="mt-1 text-5xl sm:text-6xl font-black italic tracking-tight leading-none text-pitRed">
              THE GRID
            </div>

            <div className="mt-4 mx-auto max-w-xl text-sm sm:text-base text-white/75 leading-relaxed">
              Real-time pit guidance built like a strategy console. Simple for
              fans, detailed for analysts.
            </div>

            <button className="mt-4 text-pitRed hover:text-pitRed/80 text-sm font-extrabold">
              Analysis Archive →
            </button>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => nav("/app/race")}
                className="w-full sm:w-auto rounded-2xl bg-pitRed px-6 py-3 text-sm font-extrabold text-white shadow-[0_16px_50px_rgba(255,0,0,0.25)] hover:bg-pitRed/90 transition"
              >
                Let's Race →
              </button>
              <button
                type="button"
                onClick={() => nav("/app/strategy")}
                className="w-full sm:w-auto rounded-2xl border border-white/15 bg-black/40 px-6 py-3 text-sm font-extrabold text-white/90 hover:bg-black/55 transition"
              >
                Open Strategy Panel
              </button>
            </div>
          </div>

          {/* 3 feature cards only */}
          <div className="mt-10 mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <FeatureCard
                chip="LIVE"
                title="REAL-TIME TELEMETRY"
                desc="Monitor tyre age, traffic, pit congestion, and safety-car context as the race evolves."
                onClick={() => nav("/app/race")}
              />
              <FeatureCard
                chip="INSIGHTS"
                title="SMART PIT WINDOWS"
                desc="Detect undercut opportunities and get pit/stay calls with confidence + explainability."
                onClick={() => nav("/app/strategy")}
              />
              <FeatureCard
                chip="GAPS"
                title="OPPORTUNITY MAP"
                desc="Spot gaps that create overtakes and pit advantage before it becomes obvious on TV."
                onClick={() => nav("/app/race")}
              />
            </div>
          </div>

          <div className="h-4 sm:h-8" />
        </div>
      </section>
    </div>
  );
}
