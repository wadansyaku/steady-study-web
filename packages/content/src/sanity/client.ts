import { createClient } from 'next-sanity';
import { getRuntimeValue } from '../runtime';

export type SanityRuntimeEnv = {
  NEXT_PUBLIC_SANITY_PROJECT_ID?: string;
  NEXT_PUBLIC_SANITY_DATASET?: string;
  SANITY_API_READ_TOKEN?: string;
};

function resolveEnv(env: SanityRuntimeEnv = {}) {
  return {
    NEXT_PUBLIC_SANITY_PROJECT_ID:
      env.NEXT_PUBLIC_SANITY_PROJECT_ID || getRuntimeValue('NEXT_PUBLIC_SANITY_PROJECT_ID'),
    NEXT_PUBLIC_SANITY_DATASET:
      env.NEXT_PUBLIC_SANITY_DATASET || getRuntimeValue('NEXT_PUBLIC_SANITY_DATASET'),
    SANITY_API_READ_TOKEN:
      env.SANITY_API_READ_TOKEN || getRuntimeValue('SANITY_API_READ_TOKEN'),
  };
}

export function sanityConfigured(env: SanityRuntimeEnv = {}) {
  const resolved = resolveEnv(env);
  return Boolean(
    resolved.NEXT_PUBLIC_SANITY_PROJECT_ID && resolved.NEXT_PUBLIC_SANITY_DATASET
  );
}

export function getSanityClient(env: SanityRuntimeEnv = {}) {
  const resolved = resolveEnv(env);
  return createClient({
    projectId: resolved.NEXT_PUBLIC_SANITY_PROJECT_ID || 'demo',
    dataset: resolved.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2026-03-11',
    useCdn: true,
    token: resolved.SANITY_API_READ_TOKEN,
  });
}
