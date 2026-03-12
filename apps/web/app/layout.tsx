import type { ReactNode } from 'react';
import { Noto_Sans_JP, Sora } from 'next/font/google';
import { getGlobalSettings } from '@aiyoume/content';
import { JsonLd } from '@/components/JsonLd';
import { FooterClient } from '@/components/FooterClient';
import { HeaderClient } from '@/components/HeaderClient';
import { getPublicEnv } from '@/lib/env';
import { organizationJsonLd, websiteJsonLd } from '@/lib/json-ld';
import './globals.css';

const bodyFont = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '700', '900'],
});

const displayFont = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700', '800'],
});

export async function generateMetadata() {
  const env = getPublicEnv();
  const settings = await getGlobalSettings();

  return {
    metadataBase: new URL(env.siteUrl),
    title: {
      default: settings.name,
      template: `%s | ${settings.name}`,
    },
    description: settings.description,
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', type: 'image/x-icon' },
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const settings = await getGlobalSettings();

  return (
    <html lang="ja" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          本文へスキップ
        </a>
        <HeaderClient
          navItems={settings.navigation}
          cta={{ href: '/contact', label: 'お問い合わせ' }}
        />
        <main id="main">{children}</main>
        <FooterClient
          navItems={settings.footerNav}
          utilityItems={settings.footerUtility}
          tag={settings.description}
        />
        <JsonLd data={organizationJsonLd(settings)} />
        <JsonLd data={websiteJsonLd(settings)} />
      </body>
    </html>
  );
}
