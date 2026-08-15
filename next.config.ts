import withPWAInit from "next-pwa";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  // Add i18n or other configs if necessary
};

export default withNextIntl(withPWA(nextConfig));
