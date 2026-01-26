const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3001",
  },
  
  // Transpile monorepo packages
  transpilePackages: ['@parel/db', '@parel/features', '@parel/core'],
  
  // Performance optimizations (v0.11.1)
  swcMinify: true,
  compress: true,
  
  // Static export for mobile/desktop builds
  output: process.env.BUILD_TARGET === 'mobile' ? 'export' : undefined,
  
  // Suppress production warnings if enabled
  productionBrowserSourceMaps: false,
  
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Headers for caching
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/sfx/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, immutable',
          },
        ],
      },
    ];
  },
  
  // Experimental features
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      'lucide-react',
      'framer-motion',
    ],
    instrumentationHook: false, // Disable OpenTelemetry for build stability (v0.35.16d)
  },
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    const path = require('path');
    const prismaClientPath = require.resolve('@prisma/client');
    const prismaClientDir = path.dirname(prismaClientPath);
    
    // Fix pnpm resolution for @prisma/client and runtime modules
    config.resolve.alias = {
      '@parel/features/flow': path.resolve(__dirname, '../../packages/features/flow'),
      ...config.resolve.alias,
      '@prisma/client$': prismaClientPath,
      '@prisma/client/runtime/library.js': path.join(prismaClientDir, 'runtime', 'library.js'),
      '@prisma/client/runtime/library$': path.join(prismaClientDir, 'runtime', 'library.js'),
      '@prisma/client/runtime/index-browser.js': path.join(prismaClientDir, 'runtime', 'index-browser.js'),
      '@prisma/client/runtime/index-browser$': path.join(prismaClientDir, 'runtime', 'index-browser.js'),
    };
    
    // Add runtime path to resolve modules
    config.resolve.modules = [
      ...((config.resolve.modules) || []),
      path.join(prismaClientDir, 'runtime'),
    ];
    
    // Bundle analyzer (only in production builds with ANALYZE=true)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer
            ? '../analyze/server.html'
            : './analyze/client.html',
        })
      );
    }
    
    // Exclude Node.js-only packages from client bundle (v0.33.4)
    if (!isServer) {
      // Mark ioredis as external to prevent bundling
      config.externals = config.externals || [];
      config.externals.push('ioredis');
      
      // Fallback for Node.js built-ins
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        crypto: false,
        stream: false,
      };
    }
    
    return config;
  },
  
  typescript: {
    // Ignore TypeScript build errors (useful on Windows until Prisma client is fully generated)
    ignoreBuildErrors: true,
  },
};

// Only enable Sentry webpack plugin if DSN is configured
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  const sentryWebpackPluginOptions = {
    silent: true, // Suppresses source map uploading logs during build
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    disableLogger: true, // Disable Sentry build-time warnings
    // v0.35.16d - Additional build stability
    disableClientWebpackPlugin: process.env.NODE_ENV === 'development',
    disableServerWebpackPlugin: process.env.NODE_ENV === 'development',
  };
  
  module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
} else {
  module.exports = nextConfig;
}



