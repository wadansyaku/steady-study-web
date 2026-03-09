/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_LINE_URL?: string;
  readonly PUBLIC_BOOKING_URL?: string;
  readonly PUBLIC_CONTACT_EMAIL?: string;
  readonly PUBLIC_ANALYTICS_ENABLED?: string;
  readonly PUBLIC_ANALYTICS_SNIPPET?: string;
  readonly PUBLIC_VOIDRUSH_API_BASE_URL?: string;
  readonly PUBLIC_AMAZON_ASSOCIATE_TAG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
