import axios from "axios";

// Uses your existing .env value:
// VITE_API_BASE=http://localhost:3001
const baseURL = import.meta.env.VITE_API_BASE;

export const api = axios.create({
  baseURL: baseURL ?? "http://localhost:3001",
  timeout: 15000,
});

export type StrategyScoreResponse = {
  session_key: number;
  lap: number;
  total_laps: number;
  mode: string;
  scored_strategies: Array<{
    id: string;
    mode: string;
    risk: "LOW" | "MED" | "HIGH";
    stops: number;
    plan: Array<{
      compound: string;
      pit_lap_min: number | null;
      pit_lap_max: number | null;
      notes?: string;
    }>;
    explanation?: string;
    valid?: boolean;
    reasons?: string[];
    outcome: {
      predicted_total_time_seconds: number;
      predicted_finish_delta_seconds: number;
      breakdown: {
        base_time_seconds: number;
        pit_loss_seconds: number;
        tire_deg_loss_seconds: number;
        traffic_loss_seconds: number;
      };
      confidence: number;
      notes?: string[];
    };
  }>;
};

export async function getStrategyScore(params?: { mode?: "fan" | "team"; count?: number }) {
  const mode = params?.mode ?? "fan";
  const count = params?.count ?? 6;

  const res = await api.get<StrategyScoreResponse>("/strategy-score", {
    params: { mode, count },
  });

  return res.data;
}
