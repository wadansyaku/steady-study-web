import { groq } from 'next-sanity';

export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSetting"][0]{
    siteName,
    tagline,
    description,
    contactEmail,
    lineUrl,
    bookingUrl,
    labsUrl
  }
`;

export const SERVICE_PAGES_QUERY = groq`
  *[_type == "servicePage"] | order(title asc) {
    serviceKey,
    title,
    heroTitle,
    heroDescription,
    audience,
    deliverables,
    proof,
    process,
    fit,
    ctaTitle,
    ctaBody,
    seoDescription
  }
`;

export const CASE_STUDIES_QUERY = groq`
  *[_type == "caseStudy"] | order(title asc) {
    title,
    "slug": slug.current,
    service,
    summary,
    challenge,
    response,
    outcomes,
    proofLabel
  }
`;

export const FAQ_QUERY = groq`
  *[_type == "faqItem"] | order(question asc) {
    question,
    answer,
    service
  }
`;
