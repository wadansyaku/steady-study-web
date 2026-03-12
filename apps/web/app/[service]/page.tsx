import { getCaseStudies, getGlobalSettings, getServicePage } from '@aiyoume/content';
import { ContactStrip, PageHero, ProofCard, SectionHeader, ServiceBadge } from '@aiyoume/ui';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

const services = ['learning', 'studio', 'automation'] as const;

export async function generateStaticParams() {
  return services.map((service) => ({ service }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  if (!services.includes(service as (typeof services)[number])) {
    const settings = await getGlobalSettings();
    return buildMetadata({
      title: settings.name,
      description: 'AIYouMe service page',
      path: '/',
      siteName: settings.name,
    });
  }

  const [settings, page] = await Promise.all([
    getGlobalSettings(),
    getServicePage(service as (typeof services)[number]),
  ]);
  return buildMetadata({
    title: page.title,
    description: page.seoDescription,
    path: `/${service}`,
    siteName: settings.name,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  if (!services.includes(service as (typeof services)[number])) {
    notFound();
  }

  const [page, allStudies] = await Promise.all([
    getServicePage(service as (typeof services)[number]),
    getCaseStudies(),
  ]);
  const studies = allStudies.filter((study) => study.service === page.key);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'ホーム', path: '/' },
          { name: page.title, path: `/${page.key}` },
        ])}
      />
      <PageHero
        theme={page.key}
        eyebrow={page.title}
        title={page.heroTitle}
        description={page.heroDescription}
        actions={[
          { href: `/contact?service=${page.key}`, label: 'フォームから相談', kind: 'service' },
          {
            href: page.key === 'learning' ? '/pricing' : '/case-studies',
            label: page.key === 'learning' ? '料金方針を見る' : '事例を見る',
            kind: 'secondary',
          },
        ]}
        aside={
          <div className="hero-card">
            <ServiceBadge theme={page.key} />
            <h2>このサービスが向くケース</h2>
            <ul className="hero-card__list">
              {page.fit.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        }
      />

      <section className="section">
        <div className="shell">
          <SectionHeader
            eyebrow="対象と支援内容"
            title="誰に、何を渡す支援なのかを明確にする"
          />
          <div className="card-grid">
            <article className="plain-card">
              <h3>向いているケース</h3>
              <ul>
                {page.audience.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="plain-card">
              <h3>主な成果物</h3>
              <ul>
                {page.deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--tinted">
        <div className="shell">
          <SectionHeader eyebrow="判断材料" title="問い合わせ前に見える根拠" />
          <div className="card-grid">
            {page.proof.map((item) => (
              <ProofCard key={item.title} title={item.title} body={item.body} meta={item.meta} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHeader eyebrow="進め方" title="相談から実施までの流れ" />
          <div className="card-grid">
            {page.process.map((step) => (
              <article key={step.title} className="plain-card">
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {studies.length > 0 ? (
        <section className="section section--tinted">
          <div className="shell">
            <SectionHeader eyebrow="事例" title="このサービスの支援事例" />
            <div className="card-grid">
              {studies.map((study) => (
                <article key={study.slug} className="case-card">
                  <div className="case-card__head">
                    <span className="case-card__service">{study.proofLabel}</span>
                  </div>
                  <h3>{study.title}</h3>
                  <p>{study.summary}</p>
                  <a className="case-card__link" href={`/case-studies/${study.slug}`}>
                    事例を読む
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ContactStrip
        eyebrow="お問い合わせ"
        title={page.ctaTitle}
        body={page.ctaBody}
        actions={[
          { href: `/contact?service=${page.key}`, label: '相談する' },
          { href: '/security', label: 'セキュリティを確認', kind: 'secondary' },
        ]}
      />
    </>
  );
}
