import { getCloudflareContext } from '@opennextjs/cloudflare';

export type ContentRuntimeBindings = {
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_LINE_URL?: string;
  NEXT_PUBLIC_BOOKING_URL?: string;
  NEXT_PUBLIC_CONTACT_EMAIL?: string;
  NEXT_PUBLIC_LABS_URL?: string;
  NEXT_PUBLIC_SANITY_PROJECT_ID?: string;
  NEXT_PUBLIC_SANITY_DATASET?: string;
  SANITY_API_READ_TOKEN?: string;
  SANITY_API_WRITE_TOKEN?: string;
};

export function getBindings(): ContentRuntimeBindings {
  try {
    return getCloudflareContext().env as ContentRuntimeBindings;
  } catch {
    return {};
  }
}

export function getRuntimeValue(key: keyof ContentRuntimeBindings): string | undefined {
  const bindings = getBindings();
  const runtimeValue = bindings[key];
  if (typeof runtimeValue === 'string') {
    return runtimeValue;
  }

  const processValue = process.env[key];
  return typeof processValue === 'string' ? processValue : undefined;
}
