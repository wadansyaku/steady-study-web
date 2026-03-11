import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AIYouMe',
    short_name: 'AIYouMe',
    description: '学習・制作・業務を、軽く動く運用へ。',
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
