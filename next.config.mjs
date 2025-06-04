import NextBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const baseNextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react', '@tabler/icons-react', 'lodash-es'],
  },
};

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = withBundleAnalyzer(baseNextConfig);

export default nextConfig;
