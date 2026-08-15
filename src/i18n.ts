import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'id'];

export default getRequestConfig(async (config: any) => {
  let locale = config.locale;
  if (!locale && config.requestLocale) {
    locale = await config.requestLocale;
  }
  
  if (!locale || !locales.includes(locale)) {
    locale = 'id';
  }

  return {
    locale: locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
