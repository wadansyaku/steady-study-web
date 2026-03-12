import { z } from 'zod';
import { siteSettings } from '@aiyoume/content';
import { getBindings, getRuntimeValue, type RuntimeBindings } from './runtime';

const publicEnvSchema = z.object({
  siteUrl: z.url(),
  lineUrl: z.url(),
  bookingUrl: z.url(),
  contactEmail: z.email(),
  labsUrl: z.url(),
  sanityProjectId: z.string().optional(),
  sanityDataset: z.string().default('production'),
  turnstileSiteKey: z.string().optional(),
});

const serverEnvSchema = publicEnvSchema.extend({
  turnstileSecretKey: z.string().optional(),
  resendApiKey: z.string().optional(),
  resendFromEmail: z.string().optional(),
  leadNotificationEmail: z.string().optional(),
  sanityReadToken: z.string().optional(),
  sanityWriteToken: z.string().optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function fallbackPublicEnv() {
  return {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || siteSettings.contactChannels.labs.replace('/void-rush', '').replace('labs.', ''),
    lineUrl: process.env.NEXT_PUBLIC_LINE_URL || siteSettings.contactChannels.line,
    bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || siteSettings.contactChannels.booking,
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || siteSettings.contactChannels.email,
    labsUrl: process.env.NEXT_PUBLIC_LABS_URL || siteSettings.contactChannels.labs,
    sanityProjectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || undefined,
    sanityDataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined,
  };
}

export function getPublicEnv(): PublicEnv {
  return publicEnvSchema.parse({
    siteUrl: getRuntimeValue('NEXT_PUBLIC_SITE_URL') || 'https://ai-yu-me.com',
    lineUrl: getRuntimeValue('NEXT_PUBLIC_LINE_URL') || siteSettings.contactChannels.line,
    bookingUrl: getRuntimeValue('NEXT_PUBLIC_BOOKING_URL') || siteSettings.contactChannels.booking,
    contactEmail: getRuntimeValue('NEXT_PUBLIC_CONTACT_EMAIL') || siteSettings.contactChannels.email,
    labsUrl: getRuntimeValue('NEXT_PUBLIC_LABS_URL') || siteSettings.contactChannels.labs,
    sanityProjectId: getRuntimeValue('NEXT_PUBLIC_SANITY_PROJECT_ID'),
    sanityDataset: getRuntimeValue('NEXT_PUBLIC_SANITY_DATASET') || fallbackPublicEnv().sanityDataset,
    turnstileSiteKey: getRuntimeValue('NEXT_PUBLIC_TURNSTILE_SITE_KEY'),
  });
}

export function getServerEnv(): ServerEnv {
  const publicEnv = getPublicEnv();
  return serverEnvSchema.parse({
    ...publicEnv,
    turnstileSecretKey: getRuntimeValue('TURNSTILE_SECRET_KEY'),
    resendApiKey: getRuntimeValue('RESEND_API_KEY'),
    resendFromEmail: getRuntimeValue('RESEND_FROM_EMAIL'),
    leadNotificationEmail: getRuntimeValue('LEAD_NOTIFICATION_EMAIL'),
    sanityReadToken: getRuntimeValue('SANITY_API_READ_TOKEN'),
    sanityWriteToken: getRuntimeValue('SANITY_API_WRITE_TOKEN'),
  });
}

export function getLeadDatabase() {
  const bindings = getBindings();
  return bindings.LEADS_DB;
}

export function hasLeadDatabase(bindings: RuntimeBindings = getBindings()) {
  return typeof bindings.LEADS_DB?.prepare === 'function';
}
