import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL('https://www.google.com/url?sa=i&url=https%3A%2F%2Fpk.ign.com%2Favatar-generations&psig=AOvVaw1JpJZzp70p5Eg7kPa3nolz&ust=1750535885642000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCMi4sMTkgI4DFQAAAAAdAAAAABAE')],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // This ensures Prisma client is properly bundled
      config.externals.push('@prisma/client');
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

export default nextConfig;
