export type Mode = "fan" | "analyst";

export interface StrategyEvaluateRequest {
  mode: Mode;
  tyreAgeLaps: number;
  pitCongestion: number;
  scProbability: number;
  undercutOpportunity: boolean;
  pitLossThreshold: number;
  // optional: keep future room without breaking
  features?: Record<string, unknown>;
}

export interface StrategyEvaluateResponse {
  mode: Mode | string;
  pitLossBreakdown: {
    in: number;
    lane: number;
    out: number;
  };
  totalPitLoss: number;
  recommendPit: boolean;
  confidence: number; // 0..1
  reasoning: string;
}
