import { NextRequest, NextResponse } from "next/server";
import { Elysia } from "elysia";
import { getPortfolioSnapshot } from "@/src/lib/portfolio-service";
import { rateLimit } from "@/src/lib/rate-limit";

export const runtime = "nodejs";

const api = new Elysia({ prefix: "/api" })
  .get("/health", () => new Response("ok"))
  .get("/portfolio", async () => {
    try {
      const result = await getPortfolioSnapshot();
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    } catch (error) {
      console.error("Portfolio fetch failed", error);
      return new Response(
        JSON.stringify({ error: "Failed to load portfolio snapshot" }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        }
      );
    }
  });

const resolveHandler = (appInstance: unknown) =>
  (appInstance as any).handle ?? (appInstance as any).fetch;

export async function GET(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientId =
    forwardedFor?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anon";
  if (!rateLimit(clientId)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const handler = resolveHandler(api);
  const response = await handler.call(api, request);
  if (response instanceof Response) return response;
  return NextResponse.json(response as any, { status: 200 });
}
