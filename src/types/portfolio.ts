export type ExchangeCode = "NSE" | "BSE";

export interface HoldingInput {
  particulars: string;
  purchasePrice: number;
  quantity: number;
  exchangeCode: ExchangeCode;
  sector?: string;
}

export interface LiveMetrics {
  cmp: number | null;
  peRatio: number | null;
  latestEarnings: string | null;
}

export interface HoldingComputed extends HoldingInput {
  investment: number;
  portfolioPercentage: number;
  presentValue: number;
  gainLoss: number;
  live: LiveMetrics;
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  percentage: number;
}

export interface PortfolioSnapshot {
  holdings: HoldingComputed[];
  sectors: SectorSummary[];
  updatedAt: string;
  errors: string[];
}

export interface PortfolioApiResponse {
  data: PortfolioSnapshot;
  error?: string;
}


