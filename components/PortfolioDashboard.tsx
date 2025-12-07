"use client";

import { useMemo } from "react";
import { PortfolioTable } from "./PortfolioTable";
import { SectorSummaryGrid } from "./SectorSummary";
import { usePortfolio } from "@/src/hooks/usePortfolio";
import { formatCurrency } from "@/src/lib/formatters";

export const PortfolioDashboard = () => {
  const { data, isLoading, error, refetch } = usePortfolio();

  const totals = useMemo(() => {
    if (!data) {
      return { investment: 0, present: 0, gain: 0 };
    }
    const investment = data.holdings.reduce((acc, h) => acc + h.investment, 0);
    const present = data.holdings.reduce((acc, h) => acc + h.presentValue, 0);
    const gain = present - investment;
    return { investment, present, gain };
  }, [data]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-700">Portfolio Dashboard</p>
          <p className="text-xs text-zinc-500">
            Live CMP, P/E, and earnings refresh every 15 seconds.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-700">
          <div className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
            Total Gain: {formatCurrency(totals.gain)}
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Refresh now
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </div>
      ) : null}

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700">Holdings</h2>
          {data?.updatedAt && (
            <p className="text-xs text-zinc-500">
              Updated {new Date(data.updatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
        <PortfolioTable data={data?.holdings ?? []} isLoading={isLoading} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-700">Sector Summary</h2>
        <SectorSummaryGrid sectors={data?.sectors ?? []} isLoading={isLoading} />
      </section>
    </div>
  );
};

