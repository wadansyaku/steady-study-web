import { getCaseStudies, getCaseStudy, getGlobalSettings } from '@aiyoume/content';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export async function generateStaticParams() {
  const studies = await getCaseStudies();
  return studies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [settings, study] = await Promise.all([getGlobalSettings(), getCaseStudy(slug)]);
  if (!study) {
    return buildMetadata({
      title: 'Case Study',
      description: 'Case study not found.',
      path: '/case-studies',
      siteName: settings.name,
    });
  }

  return buildMetadata({
    title: study.title,
    description: study.summary,
    path: `/case-studies/${study.slug}`,
    siteName: settings.name,
  });
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'ホーム', path: '/' },
          { name: '事例', path: '/case-studies' },
          { name: study.title, path: `/case-studies/${study.slug}` },
        ])}
      />
      <section className="section">
        <div className="shell prose-shell">
          <p className="section-header__eyebrow">{study.service}</p>
          <h1>{study.title}</h1>
          <p>{study.summary}</p>
          <div className="plain-card section-block">
            <h2>相談前の状態</h2>
            <p>{study.challenge}</p>
          </div>
          <div className="card-grid">
            <article className="plain-card">
              <h2>対応内容</h2>
              <ul>
                {study.response.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="plain-card">
              <h2>変化</h2>
              <ul>
                {study.outcomes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
