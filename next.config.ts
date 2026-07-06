import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingRoot: process.cwd(),
  outputFileTracingIncludes: {
    "/**": ["./data/**"],
  },
};

export default nextConfig;
