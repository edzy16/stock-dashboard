import axios from "axios";
import * as cheerio from "cheerio";
import yahooFinance from "yahoo-finance2";
import { TtlCache } from "./cache";
import { ExchangeCode, HoldingInput, LiveMetrics } from "@/src/types/portfolio";

const priceCache = new TtlCache<number>(12_000);
const statsCache = new TtlCache<{ peRatio: number | null; latestEarnings: string | null }>(
  5 * 60_000
);

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const normalizeSymbol = (symbol: string, exchangeCode: ExchangeCode) => {
  const trimmed = symbol.trim().toUpperCase();
  if (exchangeCode === "NSE") return `${trimmed}.NS`;
  if (exchangeCode === "BSE") return `${trimmed}.BO`;
  return trimmed;
};

const fetchCmp = async (symbol: string, exchangeCode: ExchangeCode) => {
  const cacheKey = `cmp:${symbol}:${exchangeCode}`;
  const cached = priceCache.get(cacheKey);
  if (cached !== null) return cached;

  try {
    const yahooSymbol = normalizeSymbol(symbol, exchangeCode);
    const quote = await yahooFinance.quote(yahooSymbol, {
      fields: ["regularMarketPrice"],
    });
    const cmp =
      typeof quote.regularMarketPrice === "number"
        ? quote.regularMarketPrice
        : null;
    if (cmp !== null) {
      priceCache.set(cacheKey, cmp);
    }
    return cmp;
  } catch (error) {
    console.error("CMP fetch failed", symbol, exchangeCode, error);
    return null;
  }
};

const extractStat = ($: cheerio.CheerioAPI, label: string): string | null => {
  const labelNode = $(`div:contains("${label}")`).first();
  if (!labelNode.length) return null;
  const peer = labelNode.next("div");
  const text = peer.text().trim() || labelNode.parent().find("div").eq(1).text().trim();
  return text || null;
};

const scrapeGoogleStats = async (
  symbol: string,
  exchangeCode: ExchangeCode
): Promise<{ peRatio: number | null; latestEarnings: string | null }> => {
  const cacheKey = `stats:${symbol}:${exchangeCode}`;
  const cached = statsCache.get(cacheKey);
  if (cached) return cached;

  try {
    const market = exchangeCode === "NSE" ? "NSE" : "BOM";
    const url = `https://www.google.com/finance/quote/${symbol.toUpperCase()}:${market}`;
    const { data } = await axios.get<string>(url, {
      timeout: 7000,
      headers: {
        "User-Agent": USER_AGENT,
      },
    });
    const $ = cheerio.load(data);
    const peText = extractStat($, "P/E ratio");
    const earningsText =
      extractStat($, "Earnings per share") || extractStat($, "EPS (TTM)");

    const peRatio = peText ? Number.parseFloat(peText.replace(/,/g, "")) : null;
    const latestEarnings = earningsText ?? null;

    const payload = { peRatio, latestEarnings };
    statsCache.set(cacheKey, payload);
    return payload;
  } catch (error) {
    console.error("Google Finance scrape failed", symbol, exchangeCode, error);
    return { peRatio: null, latestEarnings: null };
  }
};

const fallbackStatsFromYahoo = async (
  symbol: string,
  exchangeCode: ExchangeCode
): Promise<{ peRatio: number | null; latestEarnings: string | null }> => {
  try {
    const yahooSymbol = normalizeSymbol(symbol, exchangeCode);
    const summary = await yahooFinance.quoteSummary(yahooSymbol, {
      modules: ["summaryDetail", "defaultKeyStatistics"],
    });
    const pe =
      typeof summary.summaryDetail?.trailingPE === "number"
        ? summary.summaryDetail.trailingPE
        : typeof summary.defaultKeyStatistics?.trailingPE === "number"
          ? summary.defaultKeyStatistics.trailingPE
          : null;
    const earnings =
      (summary.defaultKeyStatistics as any)?.lastFiscalYearEnd ??
      summary.defaultKeyStatistics?.lastSplitDate ??
      null;

    return { peRatio: pe, latestEarnings: earnings?.toString() ?? null };
  } catch (error) {
    console.error("Yahoo fallback stats failed", symbol, exchangeCode, error);
    return { peRatio: null, latestEarnings: null };
  }
};

export const fetchLiveMetrics = async (
  holding: HoldingInput
): Promise<LiveMetrics> => {
  const cmp = await fetchCmp(holding.particulars, holding.exchangeCode);

  const scraped = await scrapeGoogleStats(holding.particulars, holding.exchangeCode);
  const stats =
    scraped.peRatio === null && scraped.latestEarnings === null
      ? await fallbackStatsFromYahoo(holding.particulars, holding.exchangeCode)
      : scraped;

  return {
    cmp,
    peRatio: stats.peRatio,
    latestEarnings: stats.latestEarnings,
  };
};

export const fetchLiveMetricsForHoldings = async (
  holdings: HoldingInput[]
): Promise<Record<string, LiveMetrics>> => {
  const pairs = await Promise.all(
    holdings.map(async (holding) => {
      const metrics = await fetchLiveMetrics(holding);
      return [holding.particulars, metrics] as const;
    })
  );

  return Object.fromEntries(pairs);
};


