"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PortfolioApiResponse, PortfolioSnapshot } from "@/src/types/portfolio";

const fetchPortfolio = async (): Promise<PortfolioSnapshot> => {
  const response = await fetch("/api/portfolio", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to load portfolio data");
  }

  const payload = (await response.json()) as PortfolioApiResponse;
  if (!payload.data) {
    throw new Error(payload.error ?? "Portfolio payload missing");
  }

  return payload.data;
};

export const usePortfolio = () => {
  const query = useQuery<PortfolioSnapshot, Error>({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  useEffect(() => {
    const id = setInterval(() => {
      query.refetch();
    }, 15_000);
    return () => clearInterval(id);
  }, [query.refetch]);

  return query;
};

