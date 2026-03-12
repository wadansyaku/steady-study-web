import { groq } from 'next-sanity';

export const GLOBAL_SETTINGS_QUERY = groq`
  *[_id == "globalSettings.main"][0]{
    siteName,
    tagline,
    description,
    contactEmail,
    lineUrl,
    bookingUrl,
    labsUrl,
    navigation[]{
      href,
      label,
      external
    },
    footerNav[]{
      href,
      label,
      external
    },
    footerUtility[]{
      href,
      label,
      external
    },
    brandPillars[]{
      title,
      body
    }
  }
`;

export const HOME_PAGE_QUERY = groq`
  *[_id == "homePage.main"][0]{
    seo,
    hero{
      eyebrow,
      title,
      description,
      facts[]{
        label,
        value
      }
    },
    fitCases[]{
      title,
      body,
      service
    },
    notFitNote,
    serviceHighlights[]{
      slug,
      label,
      audience,
      whatWeDo,
      deliverables,
      notFit,
      ctaHref
    },
    trustProofs[]{
      title,
      summary,
      proofType,
      href,
      hrefLabel
    },
    processSteps[]{
      step,
      title,
      body
    },
    brandSummary{
      eyebrow,
      title,
      description,
      pillars[]{
        title,
        body
      }
    }
  }
`;

export const SERVICE_PAGES_QUERY = groq`
  *[_type == "servicePage"] | order(serviceKey asc) {
    serviceKey,
    title,
    heroTitle,
    heroDescription,
    audience,
    deliverables,
    proof[]{
      title,
      body,
      meta
    },
    process[]{
      title,
      body
    },
    fit,
    ctaTitle,
    ctaBody,
    seoDescription
  }
`;

export const CASE_STUDIES_QUERY = groq`
  *[_type == "caseStudy"] | order(coalesce(sortOrder, 9999) asc, title asc) {
    sortOrder,
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
  *[_type == "faqItem"] | order(coalesce(sortOrder, 9999) asc, question asc) {
    sortOrder,
    question,
    answer,
    service,
    "slug": slug.current
  }
`;

export const ABOUT_PAGE_QUERY = groq`
  *[_id == "aboutPage.main"][0]{
    title,
    body,
    seoDescription,
    principles[]{
      title,
      body
    },
    boundaries[]{
      title,
      body
    }
  }
`;

export const PROFILE_PAGE_QUERY = groq`
  *[_id == "profilePage.main"][0]{
    title,
    body,
    seoDescription,
    role,
    specialties,
    workingStyle,
    boundaries
  }
`;

export const PROCESS_PAGE_QUERY = groq`
  *[_id == "processPage.main"][0]{
    title,
    intro,
    seoDescription,
    steps[]{
      step,
      title,
      body
    }
  }
`;

export const PRICING_PAGE_QUERY = groq`
  *[_id == "pricingPage.main"][0]{
    title,
    seoDescription,
    intro,
    factors,
    proposalItems,
    models[]{
      title,
      summary,
      items
    }
  }
`;

export const SECURITY_PAGE_QUERY = groq`
  *[_id == "securityPage.main"][0]{
    title,
    seoDescription,
    commitments,
    intake,
    boundaries,
    vendors
  }
`;

export const POLICY_PAGE_QUERY = groq`
  *[_type == "policyPage" && slug.current == $slug][0]{
    "slug": slug.current,
    eyebrow,
    title,
    seoTitle,
    seoDescription,
    sections[]{
      title,
      body
    }
  }
`;
