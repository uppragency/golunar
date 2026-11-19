import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  async redirects() {
    return [{ source: "/website-6-lei", destination: "/website-4-99-lei", permanent: true }];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/email/:path*", headers: [{ key: "Access-Control-Allow-Origin", value: "*" }] },
    ];
  },
};

export default nextConfig;
