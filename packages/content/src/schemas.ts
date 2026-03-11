import { defineField, defineType } from 'sanity';

const serviceKeyOptions = [
  { title: 'Learning', value: 'learning' },
  { title: 'Studio', value: 'studio' },
  { title: 'Automation', value: 'automation' },
];

export const schemaTypes = [
  defineType({
    name: 'siteSetting',
    title: 'Site Setting',
    type: 'document',
    fields: [
      defineField({ name: 'siteName', title: 'Site name', type: 'string' }),
      defineField({ name: 'tagline', title: 'Tagline', type: 'string' }),
      defineField({ name: 'description', title: 'Description', type: 'text' }),
      defineField({ name: 'contactEmail', title: 'Contact email', type: 'string' }),
      defineField({ name: 'lineUrl', title: 'LINE URL', type: 'url' }),
      defineField({ name: 'bookingUrl', title: 'Booking URL', type: 'url' }),
      defineField({ name: 'labsUrl', title: 'Labs URL', type: 'url' }),
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
      defineField({ name: 'audience', title: 'Audience', type: 'array', of: [{ type: 'string' }] }),
      defineField({ name: 'deliverables', title: 'Deliverables', type: 'array', of: [{ type: 'string' }] }),
      defineField({
        name: 'proof',
        title: 'Proof',
        type: 'array',
        of: [
          defineField({
            name: 'proofItem',
            title: 'Proof item',
            type: 'object',
            fields: [
              defineField({ name: 'title', title: 'Title', type: 'string' }),
              defineField({ name: 'body', title: 'Body', type: 'text' }),
              defineField({ name: 'meta', title: 'Meta', type: 'string' }),
            ],
          }),
        ],
      }),
      defineField({
        name: 'process',
        title: 'Process',
        type: 'array',
        of: [
          defineField({
            name: 'processStep',
            title: 'Process step',
            type: 'object',
            fields: [
              defineField({ name: 'title', title: 'Title', type: 'string' }),
              defineField({ name: 'body', title: 'Body', type: 'text' }),
            ],
          }),
        ],
      }),
      defineField({ name: 'fit', title: 'Fit', type: 'array', of: [{ type: 'string' }] }),
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
      defineField({ name: 'response', title: 'Response', type: 'array', of: [{ type: 'string' }] }),
      defineField({ name: 'outcomes', title: 'Outcomes', type: 'array', of: [{ type: 'string' }] }),
      defineField({ name: 'proofLabel', title: 'Proof label', type: 'string' }),
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
      defineField({ name: 'service', title: 'Service', type: 'string', options: { list: serviceKeyOptions } }),
      defineField({ name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }] }),
    ],
  }),
  defineType({
    name: 'faqItem',
    title: 'FAQ Item',
    type: 'document',
    fields: [
      defineField({ name: 'question', title: 'Question', type: 'string' }),
      defineField({ name: 'answer', title: 'Answer', type: 'text' }),
      defineField({ name: 'service', title: 'Service', type: 'string', options: { list: serviceKeyOptions } }),
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
  defineType({
    name: 'personProfile',
    title: 'Person Profile',
    type: 'document',
    fields: [
      defineField({ name: 'name', title: 'Name', type: 'string' }),
      defineField({ name: 'role', title: 'Role', type: 'string' }),
      defineField({ name: 'bio', title: 'Bio', type: 'text' }),
      defineField({ name: 'principles', title: 'Principles', type: 'array', of: [{ type: 'string' }] }),
    ],
  }),
  defineType({
    name: 'policyPage',
    title: 'Policy Page',
    type: 'document',
    fields: [
      defineField({ name: 'title', title: 'Title', type: 'string' }),
      defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } }),
      defineField({ name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }] }),
    ],
  }),
];
