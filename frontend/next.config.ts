import type { NextConfig } from "next";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const frontendRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: join(frontendRoot),
  },
};

export default nextConfig;
