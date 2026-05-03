import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const config: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async redirects() {
    return [
      {
        source: "/:locale(hy|ru|en)/admin/:path*",
        destination: "/admin/:path*",
        permanent: false,
      },
      {
        source: "/:locale(hy|ru|en)/admin",
        destination: "/admin",
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(config);
