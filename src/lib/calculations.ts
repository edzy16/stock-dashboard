import { HoldingInput, HoldingComputed, LiveMetrics, PortfolioSnapshot, SectorSummary } from "@/src/types/portfolio";

const safeNumber = (value: number | null | undefined, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

export const computeHolding = (
  holding: HoldingInput,
  live: LiveMetrics,
  totalInvestment: number
): HoldingComputed => {
  const investment = holding.purchasePrice * holding.quantity;
  const cmp = safeNumber(live.cmp, holding.purchasePrice);
  const presentValue = cmp * holding.quantity;
  const gainLoss = presentValue - investment;
  const portfolioPercentage = totalInvestment > 0 ? (investment / totalInvestment) * 100 : 0;

  return {
    ...holding,
    sector: holding.sector ?? "Unspecified",
    investment,
    portfolioPercentage,
    presentValue,
    gainLoss,
    live: {
      cmp: live.cmp,
      peRatio: live.peRatio,
      latestEarnings: live.latestEarnings,
    },
  };
};

export const buildPortfolioSnapshot = (
  holdings: HoldingInput[],
  liveLookup: Record<string, LiveMetrics>
): PortfolioSnapshot => {
  const totalInvestment = holdings.reduce(
    (acc, item) => acc + item.purchasePrice * item.quantity,
    0
  );

  const computed = holdings.map((holding) =>
    computeHolding(
      holding,
      liveLookup[holding.particulars] ?? { cmp: null, peRatio: null, latestEarnings: null },
      totalInvestment
    )
  );

  const sectors = aggregateBySector(computed);

  return {
    holdings: computed,
    sectors,
    updatedAt: new Date().toISOString(),
    errors: [],
  };
};

export const aggregateBySector = (holdings: HoldingComputed[]): SectorSummary[] => {
  const sectorTotals: Record<string, SectorSummary> = {};
  const totalInvestment = holdings.reduce((acc, h) => acc + h.investment, 0);

  holdings.forEach((holding) => {
    const sector = holding.sector ?? "Unspecified";
    const entry =
      sectorTotals[sector] ??
      {
        sector,
        totalInvestment: 0,
        totalPresentValue: 0,
        totalGainLoss: 0,
        percentage: 0,
      };

    entry.totalInvestment += holding.investment;
    entry.totalPresentValue += holding.presentValue;
    entry.totalGainLoss += holding.gainLoss;
    sectorTotals[sector] = entry;
  });

  return Object.values(sectorTotals).map((summary) => ({
    ...summary,
    percentage:
      totalInvestment > 0 ? (summary.totalInvestment / totalInvestment) * 100 : 0,
  }));
};


