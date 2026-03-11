import { createClient } from 'next-sanity';

export function sanityConfigured(env: Record<string, string | undefined> = process.env) {
  return Boolean(env.NEXT_PUBLIC_SANITY_PROJECT_ID && env.NEXT_PUBLIC_SANITY_DATASET);
}

export function getSanityClient(env: Record<string, string | undefined> = process.env) {
  return createClient({
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'demo',
    dataset: env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2026-03-11',
    useCdn: true,
    token: env.SANITY_API_READ_TOKEN,
  });
}
