import 'server-only';

import {
  ABOUT_PAGE_QUERY,
  CASE_STUDIES_QUERY,
  FAQ_QUERY,
  GLOBAL_SETTINGS_QUERY,
  HOME_PAGE_QUERY,
  POLICY_PAGE_QUERY,
  PRICING_PAGE_QUERY,
  PROCESS_PAGE_QUERY,
  PROFILE_PAGE_QUERY,
  SECURITY_PAGE_QUERY,
  SERVICE_PAGES_QUERY,
} from './queries';
import { getRuntimeValue } from './runtime';
import { getSanityClient, sanityConfigured } from './sanity/client';
import {
  aboutSummary,
  caseStudies,
  faqItems,
  homePageContent,
  pricingModels,
  pricingSummary,
  privacySummary,
  processSummary,
  profileSummary,
  securitySummary,
  servicePages,
  siteSettings,
  termsSummary,
  type AboutSummary,
  type BrandPillar,
  type CaseStudy,
  type FAQItem,
  type FitCase,
  type GlobalSettings,
  type HomePageContent,
  type JourneyStep,
  type LinkItem,
  type PolicyPageContent,
  type PolicyPageSlug,
  type PricingModel,
  type PricingPageContent,
  type ProcessStep,
  type ProcessSummary,
  type ProfileSummary,
  type ProofAsset,
  type SecuritySummary,
  type ServiceHighlight,
  type ServiceKey,
  type ServicePage,
  type TrustProof,
} from './site-data';

const serviceOrder: ServiceKey[] = ['learning', 'studio', 'automation'];

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null;
}

function isNonNullable<T>(value: T | null | undefined): value is T {
  return value != null;
}

function isServiceKey(value: unknown): value is ServiceKey {
  return value === 'learning' || value === 'studio' || value === 'automation';
}

function readString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const next = value
    .map((item) => (typeof item === 'string' && item.trim() ? item.trim() : null))
    .filter((item): item is string => Boolean(item));

  return next.length > 0 ? next : fallback;
}

function readLinkItems(value: unknown, fallback: LinkItem[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const next = value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const href = readOptionalString(item.href);
      const label = readOptionalString(item.label);
      if (!href || !label) {
        return null;
      }

      return {
        href,
        label,
        external: item.external === true,
      } satisfies LinkItem;
    })
    .filter(isNonNullable);

  return next.length > 0 ? next : fallback;
}

function readBrandPillars(value: unknown, fallback: BrandPillar[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const next = value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const title = readOptionalString(item.title);
      const body = readOptionalString(item.body);
      if (!title || !body) {
        return null;
      }

      return { title, body } satisfies BrandPillar;
    })
    .filter(isNonNullable);

  return next.length > 0 ? next : fallback;
}

function readProofAssets(value: unknown, fallback: ProofAsset[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const next = value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const title = readOptionalString(item.title);
      const body = readOptionalString(item.body);
      if (!title || !body) {
        return null;
      }

      return {
        title,
        body,
        meta: readOptionalString(item.meta),
      } satisfies ProofAsset;
    })
    .filter(isNonNullable);

  return next.length > 0 ? next : fallback;
}

function readProcessSteps(value: unknown, fallback: ProcessStep[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const next = value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const title = readOptionalString(item.title);
      const body = readOptionalString(item.body);
      if (!title || !body) {
        return null;
      }

      return { title, body } satisfies ProcessStep;
    })
    .filter(isNonNullable);

  return next.length > 0 ? next : fallback;
}

function readJourneySteps(value: unknown, fallback: JourneyStep[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const next = value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const step = readOptionalString(item.step);
      const title = readOptionalString(item.title);
      const body = readOptionalString(item.body);
      if (!step || !title || !body) {
        return null;
      }

      return { step, title, body } satisfies JourneyStep;
    })
    .filter(isNonNullable);

  return next.length > 0 ? next : fallback;
}

function readFitCases(value: unknown, fallback: FitCase[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const next = value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const title = readOptionalString(item.title);
      const body = readOptionalString(item.body);
      if (!title || !body) {
        return null;
      }

      return {
        title,
        body,
        service: isServiceKey(item.service) ? item.service : undefined,
      } satisfies FitCase;
    })
    .filter(isNonNullable);

  return next.length > 0 ? next : fallback;
}

function readFacts(
  value: unknown,
  fallback: HomePageContent['hero']['facts']
): HomePageContent['hero']['facts'] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const next = value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const label = readOptionalString(item.label);
      const factValue = readOptionalString(item.value);
      if (!label || !factValue) {
        return null;
      }

      return { label, value: factValue };
    })
    .filter(isNonNullable);

  return next.length > 0 ? next : fallback;
}

function readServiceHighlights(value: unknown, fallback: ServiceHighlight[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const next = value
    .map((item) => {
      if (!isRecord(item) || !isServiceKey(item.slug)) {
        return null;
      }

      const label = readOptionalString(item.label);
      const audience = readOptionalString(item.audience);
      const notFit = readOptionalString(item.notFit);
      const ctaHref = readOptionalString(item.ctaHref);
      if (!label || !audience || !notFit || !ctaHref) {
        return null;
      }

      return {
        slug: item.slug,
        label,
        audience,
        whatWeDo: readStringArray(item.whatWeDo, []),
        deliverables: readStringArray(item.deliverables, []),
        notFit,
        ctaHref,
      } satisfies ServiceHighlight;
    })
    .filter(isNonNullable);

  return next.length > 0 ? next : fallback;
}

function readTrustProofs(value: unknown, fallback: TrustProof[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const next = value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const title = readOptionalString(item.title);
      const summary = readOptionalString(item.summary);
      const href = readOptionalString(item.href);
      const hrefLabel = readOptionalString(item.hrefLabel);
      const proofType =
        item.proofType === 'policy' ||
        item.proofType === 'process' ||
        item.proofType === 'case-study' ||
        item.proofType === 'boundary'
          ? item.proofType
          : null;

      if (!title || !summary || !href || !hrefLabel || !proofType) {
        return null;
      }

      return {
        title,
        summary,
        proofType,
        href,
        hrefLabel,
      } satisfies TrustProof;
    })
    .filter(isNonNullable);

  return next.length > 0 ? next : fallback;
}

function readPricingModels(value: unknown, fallback: PricingModel[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const next = value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const title = readOptionalString(item.title);
      const summary = readOptionalString(item.summary);
      if (!title || !summary) {
        return null;
      }

      return {
        title,
        summary,
        items: readStringArray(item.items, []),
      } satisfies PricingModel;
    })
    .filter(isNonNullable);

  return next.length > 0 ? next : fallback;
}

function readCaseStudies(value: unknown, fallback: CaseStudy[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const next = value
    .map((item) => {
      if (!isRecord(item) || !isServiceKey(item.service)) {
        return null;
      }

      const slug = readOptionalString(item.slug);
      const title = readOptionalString(item.title);
      const summary = readOptionalString(item.summary);
      const challenge = readOptionalString(item.challenge);
      const proofLabel = readOptionalString(item.proofLabel);
      if (!slug || !title || !summary || !challenge || !proofLabel) {
        return null;
      }

      return {
        slug,
        sortOrder:
          typeof item.sortOrder === 'number' && Number.isFinite(item.sortOrder)
            ? item.sortOrder
            : 9999,
        service: item.service,
        title,
        summary,
        challenge,
        response: readStringArray(item.response, []),
        outcomes: readStringArray(item.outcomes, []),
        proofLabel,
      } satisfies CaseStudy;
    })
    .filter(isNonNullable);

  return next.length > 0 ? next : fallback;
}

function readFaqItems(value: unknown, fallback: FAQItem[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const next = value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const slug = readOptionalString(item.slug);
      const question = readOptionalString(item.question);
      const answer = readOptionalString(item.answer);
      if (!slug || !question || !answer) {
        return null;
      }

      return {
        slug,
        sortOrder:
          typeof item.sortOrder === 'number' && Number.isFinite(item.sortOrder)
            ? item.sortOrder
            : 9999,
        question,
        answer,
        service: isServiceKey(item.service) ? item.service : undefined,
      } satisfies FAQItem;
    })
    .filter(isNonNullable);

  return next.length > 0 ? next : fallback;
}

function readPolicySections(
  value: unknown,
  fallback: PolicyPageContent['sections']
) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const next = value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const title = readOptionalString(item.title);
      const body = readOptionalString(item.body);
      if (!title || !body) {
        return null;
      }

      return { title, body };
    })
    .filter(isNonNullable);

  return next.length > 0 ? next : fallback;
}

function readAboutBlocks(
  value: unknown,
  fallback: AboutSummary['principles']
) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const next = value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const title = readOptionalString(item.title);
      const body = readOptionalString(item.body);
      if (!title || !body) {
        return null;
      }

      return { title, body };
    })
    .filter(isNonNullable);

  return next.length > 0 ? next : fallback;
}

function getEnvContactFallback() {
  return {
    line: getRuntimeValue('NEXT_PUBLIC_LINE_URL') || siteSettings.contactChannels.line,
    booking:
      getRuntimeValue('NEXT_PUBLIC_BOOKING_URL') || siteSettings.contactChannels.booking,
    email:
      getRuntimeValue('NEXT_PUBLIC_CONTACT_EMAIL') || siteSettings.contactChannels.email,
    labs: getRuntimeValue('NEXT_PUBLIC_LABS_URL') || siteSettings.contactChannels.labs,
  };
}

async function fetchFromSanity<T>(
  query: string,
  params?: Record<string, string | number | boolean>
) {
  if (!sanityConfigured()) {
    return null;
  }

  try {
    return (await getSanityClient().fetch(query, params)) as T;
  } catch {
    return null;
  }
}

export async function getGlobalSettings(): Promise<GlobalSettings> {
  const fallback = {
    ...siteSettings,
    contactChannels: getEnvContactFallback(),
  };
  const doc = await fetchFromSanity<RecordValue | null>(GLOBAL_SETTINGS_QUERY);

  if (!isRecord(doc)) {
    return fallback;
  }

  return {
    name: readString(doc.siteName, fallback.name),
    tagline: readString(doc.tagline, fallback.tagline),
    description: readString(doc.description, fallback.description),
    navigation: readLinkItems(doc.navigation, fallback.navigation),
    footerNav: readLinkItems(doc.footerNav, fallback.footerNav),
    footerUtility: readLinkItems(doc.footerUtility, fallback.footerUtility),
    contactChannels: {
      line: readString(doc.lineUrl, fallback.contactChannels.line),
      booking: readString(doc.bookingUrl, fallback.contactChannels.booking),
      email: readString(doc.contactEmail, fallback.contactChannels.email),
      labs: readString(doc.labsUrl, fallback.contactChannels.labs),
    },
    brandPillars: readBrandPillars(doc.brandPillars, fallback.brandPillars),
  };
}

export async function getHomePage(): Promise<HomePageContent> {
  const settings = await getGlobalSettings();
  const fallback = homePageContent;
  const doc = await fetchFromSanity<RecordValue | null>(HOME_PAGE_QUERY);
  const faqPreview = (await getFaqItems()).slice(0, 4);

  if (!isRecord(doc)) {
    return {
      ...fallback,
      faqPreview,
      brandSummary: {
        ...fallback.brandSummary,
        pillars: settings.brandPillars,
      },
    };
  }

  const hero = isRecord(doc.hero) ? doc.hero : {};
  const brandSummary = isRecord(doc.brandSummary) ? doc.brandSummary : {};
  const seo = isRecord(doc.seo) ? doc.seo : {};

  return {
    seo: {
      title: readString(seo.title, fallback.seo.title),
      description: readString(seo.description, fallback.seo.description),
      ogTitle: readString(seo.ogTitle, fallback.seo.ogTitle),
      ogDescription: readString(
        seo.ogDescription,
        fallback.seo.ogDescription
      ),
    },
    hero: {
      eyebrow: readString(hero.eyebrow, fallback.hero.eyebrow),
      title: readString(hero.title, fallback.hero.title),
      description: readString(hero.description, fallback.hero.description),
      facts: readFacts(hero.facts, fallback.hero.facts),
    },
    fitCases: readFitCases(doc.fitCases, fallback.fitCases),
    notFitNote: readString(doc.notFitNote, fallback.notFitNote),
    serviceHighlights: readServiceHighlights(
      doc.serviceHighlights,
      fallback.serviceHighlights
    ),
    trustProofs: readTrustProofs(doc.trustProofs, fallback.trustProofs),
    processSteps: readJourneySteps(doc.processSteps, fallback.processSteps),
    faqPreview,
    brandSummary: {
      eyebrow: readString(brandSummary.eyebrow, fallback.brandSummary.eyebrow),
      title: readString(brandSummary.title, fallback.brandSummary.title),
      description: readString(
        brandSummary.description,
        fallback.brandSummary.description
      ),
      pillars: readBrandPillars(
        brandSummary.pillars,
        settings.brandPillars
      ),
    },
  };
}

async function getServicePageMap() {
  const docs = await fetchFromSanity<Array<RecordValue> | null>(SERVICE_PAGES_QUERY);
  const map = new Map<ServiceKey, ServicePage>();

  if (Array.isArray(docs)) {
    for (const doc of docs) {
      if (!isRecord(doc) || !isServiceKey(doc.serviceKey)) {
        continue;
      }

      const fallback = servicePages[doc.serviceKey];
      map.set(doc.serviceKey, {
        key: doc.serviceKey,
        title: readString(doc.title, fallback.title),
        heroTitle: readString(doc.heroTitle, fallback.heroTitle),
        heroDescription: readString(
          doc.heroDescription,
          fallback.heroDescription
        ),
        audience: readStringArray(doc.audience, fallback.audience),
        deliverables: readStringArray(doc.deliverables, fallback.deliverables),
        proof: readProofAssets(doc.proof, fallback.proof),
        process: readProcessSteps(doc.process, fallback.process),
        fit: readStringArray(doc.fit, fallback.fit),
        ctaTitle: readString(doc.ctaTitle, fallback.ctaTitle),
        ctaBody: readString(doc.ctaBody, fallback.ctaBody),
        seoDescription: readString(
          doc.seoDescription,
          fallback.seoDescription
        ),
      });
    }
  }

  return map;
}

export async function getServicePage(service: ServiceKey): Promise<ServicePage> {
  const map = await getServicePageMap();
  return map.get(service) || servicePages[service];
}

export async function getAllServicePages(): Promise<ServicePage[]> {
  const map = await getServicePageMap();
  return serviceOrder.map((service) => map.get(service) || servicePages[service]);
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  const docs = await fetchFromSanity<Array<RecordValue> | null>(CASE_STUDIES_QUERY);
  const next = readCaseStudies(docs, caseStudies);

  return [...next].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.title.localeCompare(right.title, 'ja');
  });
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  const studies = await getCaseStudies();
  return studies.find((item) => item.slug === slug) ?? null;
}

export async function getFaqItems(): Promise<FAQItem[]> {
  const docs = await fetchFromSanity<Array<RecordValue> | null>(FAQ_QUERY);
  const next = readFaqItems(docs, faqItems);

  return [...next].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.question.localeCompare(right.question, 'ja');
  });
}

export async function getAboutPage(): Promise<AboutSummary> {
  const doc = await fetchFromSanity<RecordValue | null>(ABOUT_PAGE_QUERY);

  if (!isRecord(doc)) {
    return aboutSummary;
  }

  return {
    title: readString(doc.title, aboutSummary.title),
    body: readString(doc.body, aboutSummary.body),
    seoDescription: readString(
      doc.seoDescription,
      aboutSummary.seoDescription
    ),
    principles: readAboutBlocks(doc.principles, aboutSummary.principles),
    boundaries: readAboutBlocks(doc.boundaries, aboutSummary.boundaries),
  };
}

export async function getProfilePage(): Promise<ProfileSummary> {
  const doc = await fetchFromSanity<RecordValue | null>(PROFILE_PAGE_QUERY);

  if (!isRecord(doc)) {
    return profileSummary;
  }

  return {
    title: readString(doc.title, profileSummary.title),
    body: readString(doc.body, profileSummary.body),
    seoDescription: readString(
      doc.seoDescription,
      profileSummary.seoDescription
    ),
    role: readString(doc.role, profileSummary.role),
    specialties: readStringArray(doc.specialties, profileSummary.specialties),
    workingStyle: readStringArray(
      doc.workingStyle,
      profileSummary.workingStyle
    ),
    boundaries: readStringArray(doc.boundaries, profileSummary.boundaries),
  };
}

export async function getProcessPage(): Promise<ProcessSummary> {
  const doc = await fetchFromSanity<RecordValue | null>(PROCESS_PAGE_QUERY);

  if (!isRecord(doc)) {
    return processSummary;
  }

  return {
    title: readString(doc.title, processSummary.title),
    intro: readString(doc.intro, processSummary.intro),
    seoDescription: readString(
      doc.seoDescription,
      processSummary.seoDescription
    ),
    steps: readJourneySteps(doc.steps, processSummary.steps),
  };
}

export async function getPricingPage(): Promise<PricingPageContent> {
  const doc = await fetchFromSanity<RecordValue | null>(PRICING_PAGE_QUERY);
  const fallback: PricingPageContent = {
    ...pricingSummary,
    models: pricingModels,
  };

  if (!isRecord(doc)) {
    return fallback;
  }

  return {
    title: readString(doc.title, fallback.title),
    seoDescription: readString(doc.seoDescription, fallback.seoDescription),
    intro: readString(doc.intro, fallback.intro),
    factors: readStringArray(doc.factors, fallback.factors),
    proposalItems: readStringArray(doc.proposalItems, fallback.proposalItems),
    models: readPricingModels(doc.models, fallback.models),
  };
}

export async function getSecurityPage(): Promise<SecuritySummary> {
  const doc = await fetchFromSanity<RecordValue | null>(SECURITY_PAGE_QUERY);

  if (!isRecord(doc)) {
    return securitySummary;
  }

  return {
    title: readString(doc.title, securitySummary.title),
    seoDescription: readString(
      doc.seoDescription,
      securitySummary.seoDescription
    ),
    commitments: readStringArray(
      doc.commitments,
      securitySummary.commitments
    ),
    intake: readStringArray(doc.intake, securitySummary.intake),
    boundaries: readStringArray(doc.boundaries, securitySummary.boundaries),
    vendors: readStringArray(doc.vendors, securitySummary.vendors),
  };
}

export async function getPolicyPage(
  slug: PolicyPageSlug
): Promise<PolicyPageContent> {
  const fallback = slug === 'terms' ? termsSummary : privacySummary;
  const doc = await fetchFromSanity<RecordValue | null>(POLICY_PAGE_QUERY, {
    slug,
  });

  if (!isRecord(doc)) {
    return fallback;
  }

  return {
    slug,
    eyebrow: readString(doc.eyebrow, fallback.eyebrow),
    title: readString(doc.title, fallback.title),
    seoTitle: readString(doc.seoTitle, fallback.seoTitle),
    seoDescription: readString(
      doc.seoDescription,
      fallback.seoDescription
    ),
    sections: readPolicySections(doc.sections, fallback.sections),
  };
}
