import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components model (Next.js 16): data is dynamic by default; we opt
  // specific reads into caching with the `use cache` directive + cacheLife/cacheTag.
  // See node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md
  cacheComponents: true,
  // Pin the workspace root (multiple lockfiles exist above this dir).
  turbopack: { root: __dirname },
};

export default nextConfig;
