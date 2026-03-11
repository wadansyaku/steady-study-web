'use client';

import { usePathname } from 'next/navigation';
import { siteSettings } from '@aiyoume/content';
import { SiteFooter } from '@aiyoume/ui';

export function FooterClient() {
  const pathname = usePathname();

  if (pathname.startsWith('/cms')) {
    return null;
  }

  return (
    <SiteFooter navItems={siteSettings.footerNav} utilityItems={siteSettings.footerUtility} />
  );
}
