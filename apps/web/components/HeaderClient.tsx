'use client';

import { usePathname } from 'next/navigation';
import { SiteHeader, type ActionLink, type NavItem } from '@aiyoume/ui';

export function HeaderClient({
  navItems,
  cta,
}: {
  navItems: NavItem[];
  cta: ActionLink;
}) {
  const pathname = usePathname();

  if (pathname.startsWith('/cms')) {
    return null;
  }

  return <SiteHeader currentPath={pathname} navItems={navItems} cta={cta} />;
}
