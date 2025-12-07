"use client";

import { formatCurrency, formatNumber, classifyGain } from "@/src/lib/formatters";
import { SectorSummary } from "@/src/types/portfolio";

type Props = {
  sectors: SectorSummary[];
  isLoading: boolean;
};

export const SectorSummaryGrid = ({ sectors, isLoading }: Props) => {
  const list = isLoading ? placeholderSectors : sectors;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((sector) => (
        <div
          key={sector.sector}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-900">{sector.sector}</p>
            <span className="text-xs font-medium text-zinc-600">
              {formatNumber(sector.percentage)}%
            </span>
          </div>
          <div className="space-y-1 text-sm text-zinc-700">
            <div className="flex justify-between">
              <span>Investment</span>
              <span>{formatCurrency(sector.totalInvestment)}</span>
            </div>
            <div className="flex justify-between">
              <span>Present Value</span>
              <span>{formatCurrency(sector.totalPresentValue)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gain/Loss</span>
              <span className={classifyGain(sector.totalGainLoss)}>
                {formatCurrency(sector.totalGainLoss)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const placeholderSectors: SectorSummary[] = Array.from({ length: 3 }).map((_, idx) => ({
  sector: `Sector ${idx + 1}`,
  totalInvestment: 0,
  totalPresentValue: 0,
  totalGainLoss: 0,
  percentage: 0,
}));


