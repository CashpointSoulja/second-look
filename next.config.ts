import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"], // local browser preview proxy
  // Files read at runtime from disk must be bundled into the serverless functions.
  outputFileTracingIncludes: {
    "/api/items/[id]/verify": ["./public/demo/**"],
    "/disputes": ["./db/seed.sql"],
  },
};

export default nextConfig;
