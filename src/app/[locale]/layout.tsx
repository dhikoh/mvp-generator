import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import AuthProvider from '@/components/AuthProvider';
import '../globals.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MVP Generator | Supercharge Your Content Creation',
  description: 'Tingkatkan produktivitas pembuatan konten Anda dengan AI Prompt JSON.',
  manifest: '/manifest.json'
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <AuthProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
