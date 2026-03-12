import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('../../', import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: ['@aiyoume/ui', '@aiyoume/content'],
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
  async redirects() {
    return [
      {
        source: '/education',
        destination: '/learning',
        permanent: true,
      },
      {
        source: '/creator',
        destination: '/studio',
        permanent: true,
      },
      {
        source: '/creator/void-rush/:path*',
        destination: 'https://labs.ai-yu-me.com/void-rush/:path*',
        permanent: true,
      },
      {
        source: '/articles',
        destination: '/case-studies',
        permanent: true,
      },
      {
        source: '/articles/study-tools',
        destination: '/learning',
        permanent: true,
      },
      {
        source: '/articles/studio-canare-gs6',
        destination: '/studio',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
