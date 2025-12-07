import type { NextConfig } from "next";

const serverExternals = ["@deno/shim-deno", "yahoo-finance2"];

const nextConfig: NextConfig = {
  // Keep deno shims and yahoo-finance on the Node runtime side to
  // avoid Turbopack attempting to bundle their dynamic fs/deno shims.
  serverExternalPackages: serverExternals,
};

export default nextConfig;
