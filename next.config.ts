import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s4.anilist.co",
        pathname: "/file/anilistcdn/**",
      },
      {
        protocol: "https",
        hostname: "img.anili.st",
      },
      {
        protocol: "https",
        hostname: "media.kitsu.app",
      },
    ],
    // Also allow unoptimized for CDN images with unoptimized={true}
  },
};

export default nextConfig;
