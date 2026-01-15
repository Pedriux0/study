import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/study", // Required for GitHub Pages project sites
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
