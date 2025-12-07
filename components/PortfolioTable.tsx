"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { classifyGain, formatCurrency, formatNumber } from "@/src/lib/formatters";
import { HoldingComputed } from "@/src/types/portfolio";

type Props = {
  data: HoldingComputed[];
  isLoading: boolean;
};

const LoadingRow = ({ columns }: { columns: ColumnDef<HoldingComputed, any>[] }) => (
  <tr className="animate-pulse">
    {columns.map((column, idx) => (
      <td key={idx} className="px-3 py-2">
        <div className="h-4 w-20 rounded bg-zinc-200" />
      </td>
    ))}
  </tr>
);

export const PortfolioTable = ({ data, isLoading }: Props) => {
  const columns = useMemo<ColumnDef<HoldingComputed, any>[]>(
    () => [
      {
        header: "Stock",
        accessorKey: "particulars",
        cell: ({ row }) => (
          <div className="font-semibold text-zinc-900">{row.original.particulars}</div>
        ),
      },
      {
        header: "Purchase Price",
        accessorKey: "purchasePrice",
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        header: "Quantity",
        accessorKey: "quantity",
        cell: ({ getValue }) => formatNumber(getValue<number>(), 0),
      },
      {
        header: "Investment",
        accessorKey: "investment",
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        header: "Portfolio (%)",
        accessorKey: "portfolioPercentage",
        cell: ({ getValue }) => `${formatNumber(getValue<number>())}%`,
      },
      {
        header: "Exchange",
        accessorKey: "exchangeCode",
      },
      {
        header: "CMP",
        accessorKey: "live.cmp",
        cell: ({ row }) => formatCurrency(row.original.live.cmp),
      },
      {
        header: "Present Value",
        accessorKey: "presentValue",
        cell: ({ getValue }) => formatCurrency(getValue<number>()),
      },
      {
        header: "Gain/Loss",
        accessorKey: "gainLoss",
        cell: ({ getValue }) => {
          const value = getValue<number>();
          return <span className={classifyGain(value)}>{formatCurrency(value)}</span>;
        },
      },
      {
        header: "P/E Ratio",
        accessorKey: "live.peRatio",
        cell: ({ row }) => formatNumber(row.original.live.peRatio),
      },
      {
        header: "Latest Earnings",
        accessorKey: "live.latestEarnings",
        cell: ({ row }) => row.original.live.latestEarnings ?? "—",
      },
      {
        header: "Sector",
        accessorKey: "sector",
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-zinc-200">
        <thead className="bg-zinc-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white">
          {isLoading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <LoadingRow key={idx} columns={columns} />
              ))
            : table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap px-3 py-3 text-sm text-zinc-800">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
};


