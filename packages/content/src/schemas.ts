import { defineArrayMember, defineField, defineType } from 'sanity';

const serviceKeyOptions = [
  { title: 'Learning', value: 'learning' },
  { title: 'Studio', value: 'studio' },
  { title: 'Automation', value: 'automation' },
];

const navItemField = defineArrayMember({
  name: 'navItem',
  title: 'Navigation item',
  type: 'object',
  fields: [
    defineField({ name: 'href', title: 'Href', type: 'string' }),
    defineField({ name: 'label', title: 'Label', type: 'string' }),
    defineField({ name: 'external', title: 'External', type: 'boolean' }),
  ],
});

const pillarField = defineArrayMember({
  name: 'brandPillar',
  title: 'Brand pillar',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
  ],
});

const proofField = defineArrayMember({
  name: 'proofItem',
  title: 'Proof item',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
    defineField({ name: 'meta', title: 'Meta', type: 'string' }),
  ],
});

const processStepField = defineArrayMember({
  name: 'processStep',
  title: 'Process step',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
  ],
});

const journeyStepField = defineArrayMember({
  name: 'journeyStep',
  title: 'Journey step',
  type: 'object',
  fields: [
    defineField({ name: 'step', title: 'Step number', type: 'string' }),
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
  ],
});

const titledBodyField = defineArrayMember({
  name: 'titledBody',
  title: 'Titled body',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
  ],
});

const heroFactField = defineArrayMember({
  name: 'heroFact',
  title: 'Hero fact',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string' }),
    defineField({ name: 'value', title: 'Value', type: 'string' }),
  ],
});

const fitCaseField = defineArrayMember({
  name: 'fitCase',
  title: 'Fit case',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
    defineField({
      name: 'service',
      title: 'Service',
      type: 'string',
      options: { list: serviceKeyOptions },
    }),
  ],
});

const serviceHighlightField = defineArrayMember({
  name: 'serviceHighlight',
  title: 'Service highlight',
  type: 'object',
  fields: [
    defineField({
      name: 'slug',
      title: 'Service',
      type: 'string',
      options: { list: serviceKeyOptions },
    }),
    defineField({ name: 'label', title: 'Label', type: 'string' }),
    defineField({ name: 'audience', title: 'Audience', type: 'string' }),
    defineField({
      name: 'whatWeDo',
      title: 'What we do',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'deliverables',
      title: 'Deliverables',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({ name: 'notFit', title: 'Not fit', type: 'text', rows: 3 }),
    defineField({ name: 'ctaHref', title: 'CTA href', type: 'string' }),
  ],
});

const trustProofField = defineArrayMember({
  name: 'trustProof',
  title: 'Trust proof',
  type: 'object',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'summary', title: 'Summary', type: 'text', rows: 3 }),
    defineField({
      name: 'proofType',
      title: 'Proof type',
      type: 'string',
      options: {
        list: [
          { title: 'Policy', value: 'policy' },
          { title: 'Process', value: 'process' },
          { title: 'Case study', value: 'case-study' },
          { title: 'Boundary', value: 'boundary' },
        ],
      },
    }),
    defineField({ name: 'href', title: 'Href', type: 'string' }),
    defineField({ name: 'hrefLabel', title: 'Href label', type: 'string' }),
  ],
});

export const schemaTypes = [
  defineType({
    name: 'globalSettings',
    title: 'Global Settings',
    type: 'document',
    fields: [
      defineField({ name: 'siteName', title: 'Site name', type: 'string' }),
      defineField({ name: 'tagline', title: 'Tagline', type: 'string' }),
      defineField({ name: 'description', title: 'Description', type: 'text' }),
      defineField({ name: 'contactEmail', title: 'Contact email', type: 'string' }),
      defineField({ name: 'lineUrl', title: 'LINE URL', type: 'url' }),
      defineField({ name: 'bookingUrl', title: 'Booking URL', type: 'url' }),
      defineField({ name: 'labsUrl', title: 'Labs URL', type: 'url' }),
      defineField({
        name: 'navigation',
        title: 'Header navigation',
        type: 'array',
        of: [navItemField],
      }),
      defineField({
        name: 'footerNav',
        title: 'Footer nav',
        type: 'array',
        of: [navItemField],
      }),
      defineField({
        name: 'footerUtility',
        title: 'Footer utility',
        type: 'array',
        of: [navItemField],
      }),
      defineField({
        name: 'brandPillars',
        title: 'Brand pillars',
        type: 'array',
        of: [pillarField],
      }),
    ],
  }),
  defineType({
    name: 'homePage',
    title: 'Home Page',
    type: 'document',
    fields: [
      defineField({
        name: 'seo',
        title: 'SEO',
        type: 'object',
        fields: [
          defineField({ name: 'title', title: 'Title', type: 'string' }),
          defineField({ name: 'description', title: 'Description', type: 'text' }),
          defineField({ name: 'ogTitle', title: 'OG title', type: 'string' }),
          defineField({ name: 'ogDescription', title: 'OG description', type: 'text' }),
        ],
      }),
      defineField({
        name: 'hero',
        title: 'Hero',
        type: 'object',
        fields: [
          defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
          defineField({ name: 'title', title: 'Title', type: 'string' }),
          defineField({ name: 'description', title: 'Description', type: 'text' }),
          defineField({
            name: 'facts',
            title: 'Facts',
            type: 'array',
            of: [heroFactField],
          }),
        ],
      }),
      defineField({
        name: 'fitCases',
        title: 'Fit cases',
        type: 'array',
        of: [fitCaseField],
      }),
      defineField({ name: 'notFitNote', title: 'Not fit note', type: 'text', rows: 3 }),
      defineField({
        name: 'serviceHighlights',
        title: 'Service highlights',
        type: 'array',
        of: [serviceHighlightField],
      }),
      defineField({
        name: 'trustProofs',
        title: 'Trust proofs',
        type: 'array',
        of: [trustProofField],
      }),
      defineField({
        name: 'processSteps',
        title: 'Process steps',
        type: 'array',
        of: [journeyStepField],
      }),
      defineField({
        name: 'brandSummary',
        title: 'Brand summary',
        type: 'object',
        fields: [
          defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
          defineField({ name: 'title', title: 'Title', type: 'string' }),
          defineField({ name: 'description', title: 'Description', type: 'text' }),
          defineField({
            name: 'pillars',
            title: 'Pillars',
            type: 'array',
            of: [pillarField],
          }),
        ],
      }),
    ],
  }),
  defineType({
    name: 'servicePage',
    title: 'Service Page',
    type: 'document',
    fields: [
      defineField({
        name: 'serviceKey',
        title: 'Service key',
        type: 'string',
        options: { list: serviceKeyOptions },
      }),
      defineField({ name: 'title', title: 'Title', type: 'string' }),
      defineField({ name: 'heroTitle', title: 'Hero title', type: 'string' }),
      defineField({ name: 'heroDescription', title: 'Hero description', type: 'text' }),
      defineField({
        name: 'audience',
        title: 'Audience',
        type: 'array',
        of: [defineArrayMember({ type: 'string' })],
      }),
      defineField({
        name: 'deliverables',
        title: 'Deliverables',
        type: 'array',
        of: [defineArrayMember({ type: 'string' })],
      }),
      defineField({ name: 'proof', title: 'Proof', type: 'array', of: [proofField] }),
      defineField({
        name: 'process',
        title: 'Process',
        type: 'array',
        of: [processStepField],
      }),
      defineField({
        name: 'fit',
        title: 'Fit',
        type: 'array',
        of: [defineArrayMember({ type: 'string' })],
      }),
      defineField({ name: 'ctaTitle', title: 'CTA title', type: 'string' }),
      defineField({ name: 'ctaBody', title: 'CTA body', type: 'text' }),
      defineField({ name: 'seoDescription', title: 'SEO description', type: 'text' }),
    ],
  }),
  defineType({
    name: 'caseStudy',
    title: 'Case Study',
    type: 'document',
    fields: [
      defineField({ name: 'sortOrder', title: 'Sort order', type: 'number' }),
      defineField({ name: 'title', title: 'Title', type: 'string' }),
      defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } }),
      defineField({
        name: 'service',
        title: 'Service',
        type: 'string',
        options: { list: serviceKeyOptions },
      }),
      defineField({ name: 'summary', title: 'Summary', type: 'text' }),
      defineField({ name: 'challenge', title: 'Challenge', type: 'text' }),
      defineField({
        name: 'response',
        title: 'Response',
        type: 'array',
        of: [defineArrayMember({ type: 'string' })],
      }),
      defineField({
        name: 'outcomes',
        title: 'Outcomes',
        type: 'array',
        of: [defineArrayMember({ type: 'string' })],
      }),
      defineField({ name: 'proofLabel', title: 'Proof label', type: 'string' }),
    ],
  }),
  defineType({
    name: 'faqItem',
    title: 'FAQ Item',
    type: 'document',
    fields: [
      defineField({ name: 'sortOrder', title: 'Sort order', type: 'number' }),
      defineField({ name: 'question', title: 'Question', type: 'string' }),
      defineField({ name: 'answer', title: 'Answer', type: 'text' }),
      defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'question' } }),
      defineField({
        name: 'service',
        title: 'Service',
        type: 'string',
        options: { list: serviceKeyOptions },
      }),
    ],
  }),
  defineType({
    name: 'aboutPage',
    title: 'About Page',
    type: 'document',
    fields: [
      defineField({ name: 'title', title: 'Title', type: 'string' }),
      defineField({ name: 'body', title: 'Body', type: 'text' }),
      defineField({ name: 'seoDescription', title: 'SEO description', type: 'text' }),
      defineField({
        name: 'principles',
        title: 'Principles',
        type: 'array',
        of: [titledBodyField],
      }),
      defineField({
        name: 'boundaries',
        title: 'Boundaries',
        type: 'array',
        of: [titledBodyField],
      }),
    ],
  }),
  defineType({
    name: 'profilePage',
    title: 'Profile Page',
    type: 'document',
    fields: [
      defineField({ name: 'title', title: 'Title', type: 'string' }),
      defineField({ name: 'body', title: 'Body', type: 'text' }),
      defineField({ name: 'seoDescription', title: 'SEO description', type: 'text' }),
      defineField({ name: 'role', title: 'Role', type: 'text' }),
      defineField({
        name: 'specialties',
        title: 'Specialties',
        type: 'array',
        of: [defineArrayMember({ type: 'string' })],
      }),
      defineField({
        name: 'workingStyle',
        title: 'Working style',
        type: 'array',
        of: [defineArrayMember({ type: 'string' })],
      }),
      defineField({
        name: 'boundaries',
        title: 'Boundaries',
        type: 'array',
        of: [defineArrayMember({ type: 'string' })],
      }),
    ],
  }),
  defineType({
    name: 'processPage',
    title: 'Process Page',
    type: 'document',
    fields: [
      defineField({ name: 'title', title: 'Title', type: 'string' }),
      defineField({ name: 'intro', title: 'Intro', type: 'text' }),
      defineField({ name: 'seoDescription', title: 'SEO description', type: 'text' }),
      defineField({
        name: 'steps',
        title: 'Steps',
        type: 'array',
        of: [journeyStepField],
      }),
    ],
  }),
  defineType({
    name: 'pricingPage',
    title: 'Pricing Page',
    type: 'document',
    fields: [
      defineField({ name: 'title', title: 'Title', type: 'string' }),
      defineField({ name: 'seoDescription', title: 'SEO description', type: 'text' }),
      defineField({ name: 'intro', title: 'Intro', type: 'text' }),
      defineField({
        name: 'factors',
        title: 'Factors',
        type: 'array',
        of: [defineArrayMember({ type: 'string' })],
      }),
      defineField({
        name: 'proposalItems',
        title: 'Proposal items',
        type: 'array',
        of: [defineArrayMember({ type: 'string' })],
      }),
      defineField({
        name: 'models',
        title: 'Models',
        type: 'array',
        of: [
          defineArrayMember({
            name: 'pricingModel',
            title: 'Pricing model',
            type: 'object',
            fields: [
              defineField({ name: 'title', title: 'Title', type: 'string' }),
              defineField({ name: 'summary', title: 'Summary', type: 'text' }),
              defineField({
                name: 'items',
                title: 'Items',
                type: 'array',
                of: [defineArrayMember({ type: 'string' })],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
  defineType({
    name: 'securityPage',
    title: 'Security Page',
    type: 'document',
    fields: [
      defineField({ name: 'title', title: 'Title', type: 'string' }),
      defineField({ name: 'seoDescription', title: 'SEO description', type: 'text' }),
      defineField({
        name: 'commitments',
        title: 'Commitments',
        type: 'array',
        of: [defineArrayMember({ type: 'string' })],
      }),
      defineField({
        name: 'intake',
        title: 'Intake',
        type: 'array',
        of: [defineArrayMember({ type: 'string' })],
      }),
      defineField({
        name: 'boundaries',
        title: 'Boundaries',
        type: 'array',
        of: [defineArrayMember({ type: 'string' })],
      }),
      defineField({
        name: 'vendors',
        title: 'Vendors',
        type: 'array',
        of: [defineArrayMember({ type: 'string' })],
      }),
    ],
  }),
  defineType({
    name: 'policyPage',
    title: 'Policy Page',
    type: 'document',
    fields: [
      defineField({ name: 'title', title: 'Title', type: 'string' }),
      defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
      defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } }),
      defineField({ name: 'seoTitle', title: 'SEO title', type: 'string' }),
      defineField({ name: 'seoDescription', title: 'SEO description', type: 'text' }),
      defineField({
        name: 'sections',
        title: 'Sections',
        type: 'array',
        of: [titledBodyField],
      }),
    ],
  }),
  defineType({
    name: 'article',
    title: 'Article',
    type: 'document',
    fields: [
      defineField({ name: 'title', title: 'Title', type: 'string' }),
      defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } }),
      defineField({ name: 'summary', title: 'Summary', type: 'text' }),
      defineField({
        name: 'service',
        title: 'Service',
        type: 'string',
        options: { list: serviceKeyOptions },
      }),
      defineField({ name: 'body', title: 'Body', type: 'array', of: [defineArrayMember({ type: 'block' })] }),
    ],
  }),
  defineType({
    name: 'proofAsset',
    title: 'Proof Asset',
    type: 'document',
    fields: [
      defineField({ name: 'title', title: 'Title', type: 'string' }),
      defineField({ name: 'body', title: 'Body', type: 'text' }),
      defineField({ name: 'meta', title: 'Meta', type: 'string' }),
    ],
  }),
];
