import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  output: 'standalone',
  // Add i18n or other configs if necessary
};

export default withNextIntl(nextConfig);
