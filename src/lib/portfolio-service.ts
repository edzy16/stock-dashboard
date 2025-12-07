import { buildPortfolioSnapshot } from "./calculations";
import { fetchLiveMetricsForHoldings } from "./finance";
import { loadBaseHoldings } from "./portfolio-loader";
import { PortfolioApiResponse } from "@/src/types/portfolio";

export const getPortfolioSnapshot = async (): Promise<PortfolioApiResponse> => {
  const holdings = loadBaseHoldings();
  const liveLookup = await fetchLiveMetricsForHoldings(holdings);
  const snapshot = buildPortfolioSnapshot(holdings, liveLookup);
  return { data: snapshot };
};


