
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  serverActions: {
    bodySizeLimit: '2mb',
  },
  // Disable type checking and linting during build to save memory
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Reduce memory usage during static generation
  staticPageGenerationTimeout: 120,
  // Experimental features for memory optimization
  experimental: {
    optimizePackageImports: ['@genkit-ai/core', 'genkit'],
  },
};

module.exports = nextConfig;
