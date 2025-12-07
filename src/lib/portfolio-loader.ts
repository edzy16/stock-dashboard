import fs from "node:fs";
import path from "node:path";
import { readFile, utils } from "xlsx";
import { ExchangeCode, HoldingInput } from "@/src/types/portfolio";

let cachedHoldings: HoldingInput[] | null = null;

const fallbackHoldings: HoldingInput[] = [
  {
    particulars: "TCS",
    purchasePrice: 3600,
    quantity: 12,
    exchangeCode: "NSE",
    sector: "IT Services",
  },
  {
    particulars: "RELIANCE",
    purchasePrice: 2450,
    quantity: 20,
    exchangeCode: "NSE",
    sector: "Energy",
  },
  {
    particulars: "HDFCBANK",
    purchasePrice: 1470,
    quantity: 30,
    exchangeCode: "NSE",
    sector: "Banking",
  },
  {
    particulars: "LT",
    purchasePrice: 3650,
    quantity: 8,
    exchangeCode: "NSE",
    sector: "Infrastructure",
  },
];

const coerceExchange = (value: unknown): ExchangeCode => {
  const raw = String(value ?? "NSE").toUpperCase();
  return raw === "BSE" ? "BSE" : "NSE";
};

const coerceNumber = (value: unknown): number | null => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const inferSector = (symbol: string, provided?: string): string => {
  if (provided) return String(provided).trim();
  if (symbol.includes("BANK")) return "Banking";
  if (symbol.includes("STEEL") || symbol.includes("IND")) return "Manufacturing";
  if (symbol.includes("PHAR")) return "Pharma";
  if (symbol.includes("TECH") || symbol.includes("INF") || symbol.includes("TCS")) return "IT Services";
  return "Unspecified";
};

const mapRowToHolding = (row: Record<string, unknown>): HoldingInput | null => {
  const particulars =
    (row.particulars as string) ||
    (row.Particulars as string) ||
    (row.Stock as string) ||
    (row.Name as string);
  const purchasePrice =
    coerceNumber(row.purchasePrice) ??
    coerceNumber(row.PurchasePrice) ??
    coerceNumber(row.buy_price);
  const quantity =
    coerceNumber(row.quantity) ??
    coerceNumber(row.Quantity) ??
    coerceNumber(row.qty);
  const exchangeCode = coerceExchange(
    row.exchangeCode ?? row.Exchange ?? row.ExchangeCode
  );
  const sector =
    (row.sector as string) ||
    (row.Sector as string) ||
    inferSector((particulars ?? "").toUpperCase());

  if (!particulars || purchasePrice === null || quantity === null) {
    return null;
  }

  return {
    particulars: String(particulars).toUpperCase(),
    purchasePrice,
    quantity,
    exchangeCode,
    sector,
  };
};

export const loadBaseHoldings = (): HoldingInput[] => {
  if (cachedHoldings) return cachedHoldings;

  const excelPath = path.join(process.cwd(), "E555815F_58D029050B.xlsx");
  if (!fs.existsSync(excelPath)) {
    cachedHoldings = fallbackHoldings;
    return cachedHoldings;
  }

  try {
    const workbook = readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const rows = utils.sheet_to_json<Record<string, unknown>>(
      workbook.Sheets[sheetName]
    );
    const mapped = rows
      .map(mapRowToHolding)
      .filter((row): row is HoldingInput => Boolean(row));

    cachedHoldings = mapped.length ? mapped : fallbackHoldings;
    return cachedHoldings;
  } catch (error) {
    console.error("Failed to parse Excel portfolio, using fallback", error);
    cachedHoldings = fallbackHoldings;
    return cachedHoldings;
  }
};


