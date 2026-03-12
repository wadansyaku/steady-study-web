import { getCaseStudies, getGlobalSettings } from '@aiyoume/content';
import { CaseStudyCard } from '@aiyoume/ui';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const settings = await getGlobalSettings();

  return buildMetadata({
    title: '事例',
    description: 'AIYouMe の学習支援・制作支援・業務自動化の事例を掲載しています。',
    path: '/case-studies',
    siteName: settings.name,
  });
}

export default async function CaseStudiesPage() {
  const studies = await getCaseStudies();

  return (
    <section className="section">
      <div className="shell prose-shell">
        <p className="section-header__eyebrow">Case Studies</p>
        <h1>事例で、何を変える支援なのかを示します。</h1>
        <div className="card-grid">
          {studies.map((study) => (
            <CaseStudyCard
              key={study.slug}
              theme={study.service}
              title={study.title}
              summary={study.summary}
              href={`/case-studies/${study.slug}`}
              proof={study.proofLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
