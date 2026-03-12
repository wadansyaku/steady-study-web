import type { MetadataRoute } from 'next';
import { getGlobalSettings } from '@aiyoume/content';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getGlobalSettings();

  return {
    name: settings.name,
    short_name: settings.name,
    description: settings.tagline,
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F4ED',
    theme_color: '#5DCBF3',
    icons: [
      {
        src: '/favicon.svg',
        sizes: '64x64',
        type: 'image/svg+xml',
      },
      {
        src: '/favicon.ico',
        sizes: '64x64',
        type: 'image/x-icon',
      },
    ],
  };
}
