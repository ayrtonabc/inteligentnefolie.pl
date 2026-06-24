import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['pl', 'de', 'en', 'cs'],
  defaultLocale: 'pl',
  localePrefix: 'never',
});

export type Locale = (typeof routing.locales)[number];
