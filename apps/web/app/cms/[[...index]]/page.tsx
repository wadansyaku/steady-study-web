import type { Metadata, Viewport } from 'next';
import { CmsStudioClient } from './CmsStudioClient';
import { getPublicEnv } from '@/lib/env';

const schemaNames = [
  'siteSetting',
  'servicePage',
  'caseStudy',
  'article',
  'faqItem',
  'proofAsset',
  'personProfile',
  'policyPage',
];

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AIYouMe CMS',
  description: 'AIYouMe の Sanity Studio 入口です。',
  robots: {
    index: false,
    follow: false,
  },
  referrer: 'same-origin',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function CmsPage() {
  const env = getPublicEnv();

  if (env.sanityProjectId) {
    return <CmsStudioClient projectId={env.sanityProjectId} dataset={env.sanityDataset} />;
  }

  return (
    <section className="section">
      <div className="shell prose-shell">
        <p className="section-header__eyebrow">CMS</p>
        <h1>Sanity Studio の土台は組み込み済みです。</h1>
        <p>
          `NEXT_PUBLIC_SANITY_PROJECT_ID` と `NEXT_PUBLIC_SANITY_DATASET` を設定すると、
          この route はそのまま Sanity Studio として動作します。schema と config は
          `packages/content` に集約しています。
        </p>
        <div className="card-grid">
          {schemaNames.map((schema) => (
            <article key={schema} className="plain-card">
              <h2>{schema}</h2>
            </article>
          ))}
        </div>
        <article className="plain-card">
          <h2>Environment</h2>
          <p>projectId: {env.sanityProjectId || 'not configured'}</p>
          <p>dataset: {env.sanityDataset}</p>
        </article>
      </div>
    </section>
  );
}
