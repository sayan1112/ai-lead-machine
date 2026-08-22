import type { NextConfig } from "next";

const authUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL;
const authOrigin = authUrl ? new URL(authUrl).host : undefined;

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Netlify forwards server actions through its function host. Allow the
      // configured public application origin so browser actions pass Next's
      // CSRF/origin validation without allowing arbitrary origins.
      allowedOrigins: authOrigin ? [authOrigin] : [],
    },
  },
};

export default nextConfig;
