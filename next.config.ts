import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // When multiple lockfiles exist (e.g. parent folder), Next can infer the wrong root and break CSS/asset tracing.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
