'use client';

import { usePathname } from 'next/navigation';
import { SiteFooter, type NavItem } from '@aiyoume/ui';

export function FooterClient({
  navItems,
  utilityItems,
  tag,
}: {
  navItems: NavItem[];
  utilityItems: NavItem[];
  tag: string;
}) {
  const pathname = usePathname();

  if (pathname.startsWith('/cms')) {
    return null;
  }

  return <SiteFooter navItems={navItems} utilityItems={utilityItems} tag={tag} />;
}
