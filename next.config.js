module.exports = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    // Trim per-page cost of large icon / animation libs
    optimizePackageImports: ["lucide-react", "framer-motion", "date-fns"],
  },
  async redirects() {
    // Canonical domain is non-www. Permanent redirect preserves path + query.
    // Scoped to the www host only — no loops, no other routing changes.
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.internkhojo.com" }],
        destination: "https://internkhojo.com/:path*",
        permanent: true,
      },
    ];
  },
};
