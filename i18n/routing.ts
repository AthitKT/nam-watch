import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['th'],
  defaultLocale: 'th',
  localePrefix: 'never'
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
