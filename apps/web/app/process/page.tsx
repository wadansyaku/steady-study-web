import { getAllServicePages, getGlobalSettings, getProcessPage } from '@aiyoume/content';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const [settings, page] = await Promise.all([getGlobalSettings(), getProcessPage()]);

  return buildMetadata({
    title: '進め方',
    description: page.seoDescription,
    path: '/process',
    siteName: settings.name,
  });
}

export default async function ProcessPage() {
  const [page, services] = await Promise.all([getProcessPage(), getAllServicePages()]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'ホーム', path: '/' },
          { name: '進め方', path: '/process' },
        ])}
      />
      <section className="section">
        <div className="shell prose-shell">
          <p className="section-header__eyebrow">Process</p>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>

          <div className="card-grid journey-grid">
            {page.steps.map((step) => (
              <article key={step.step} className="plain-card journey-card">
                <p className="journey-card__step">{step.step}</p>
                <h2>{step.title}</h2>
                <p>{step.body}</p>
              </article>
            ))}
          </div>

          <section className="section-block">
            <h2>各事業での進め方</h2>
            <div className="card-grid">
              {services.map((service) => (
                <article key={service.key} className="plain-card">
                  <h3>{service.title}</h3>
                  <ul>
                    {service.process.map((step) => (
                      <li key={step.title}>
                        <strong>{step.title}:</strong> {step.body}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
