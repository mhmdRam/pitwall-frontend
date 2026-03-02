import axios from "axios";
import type { StrategyEvaluateRequest, StrategyEvaluateResponse } from "../types/strategy";

const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!baseURL) {
  // eslint-disable-next-line no-console
  console.warn("VITE_API_BASE_URL is not set. Add it to .env.local");
}

export const api = axios.create({
  baseURL: baseURL ?? "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
});

export async function evaluateStrategy(
  payload: StrategyEvaluateRequest
): Promise<StrategyEvaluateResponse> {
  const res = await api.post<StrategyEvaluateResponse>("/strategy/evaluate", payload);
  return res.data;
}
