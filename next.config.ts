import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  turbopack: {
    root: path.join(process.cwd()),
  },
  images: {
    // Solo avatares de prueba del hero (i.pravatar.cc). Las fotos del sitio
    // son locales en public/img/ via static import — no agregar hosts nuevos.
    remotePatterns: [{ protocol: "https", hostname: "i.pravatar.cc" }],
  },
};

export default nextConfig;
