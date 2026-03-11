import { getCloudflareContext } from '@opennextjs/cloudflare';

export type RuntimeBindings = {
  LEADS_DB?: D1Database;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  LEAD_NOTIFICATION_EMAIL?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_LINE_URL?: string;
  NEXT_PUBLIC_BOOKING_URL?: string;
  NEXT_PUBLIC_CONTACT_EMAIL?: string;
  NEXT_PUBLIC_LABS_URL?: string;
  NEXT_PUBLIC_SANITY_PROJECT_ID?: string;
  NEXT_PUBLIC_SANITY_DATASET?: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
  SANITY_API_READ_TOKEN?: string;
  SANITY_API_WRITE_TOKEN?: string;
};

export function getBindings(): RuntimeBindings {
  try {
    return getCloudflareContext().env as RuntimeBindings;
  } catch {
    return {};
  }
}

export function getRuntimeValue(key: keyof RuntimeBindings): string | undefined {
  const bindings = getBindings();
  const value = bindings[key];
  if (typeof value === 'string') {
    return value;
  }

  const processValue = process.env[key];
  return typeof processValue === 'string' ? processValue : undefined;
}
