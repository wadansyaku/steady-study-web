'use client';

import { usePathname } from 'next/navigation';
import { siteSettings } from '@aiyoume/content';
import { SiteHeader } from '@aiyoume/ui';

export function HeaderClient() {
  const pathname = usePathname();

  if (pathname.startsWith('/cms')) {
    return null;
  }

  return (
    <SiteHeader
      currentPath={pathname}
      navItems={siteSettings.navigation}
      cta={{ href: '/contact', label: 'お問い合わせ' }}
    />
  );
}
