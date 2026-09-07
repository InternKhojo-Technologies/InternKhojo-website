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
};
