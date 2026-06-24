import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { cookies, headers } from 'next/headers';

export default getRequestConfig(async () => {
  // Try to get locale from cookie first, then from Accept-Language header
  const cookieStore = await cookies();
  const headersList = await headers();
  
  let locale = routing.defaultLocale;
  
  // Check cookie first (user preference)
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  if (cookieLocale && routing.locales.includes(cookieLocale as any)) {
    locale = cookieLocale;
  }
  
  // Fallback: check Accept-Language header
  if (!cookieLocale) {
    const acceptLanguage = headersList.get('accept-language');
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
      if (routing.locales.includes(preferredLocale as any)) {
        locale = preferredLocale;
      }
    }
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
