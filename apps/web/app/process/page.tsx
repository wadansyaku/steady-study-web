import { getAllServicePages, sharedJourneySteps } from '@aiyoume/content';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: '進め方',
  description: 'AIYouMe の問い合わせから提案、実施、振り返りまでの流れを掲載しています。',
  path: '/process',
});

export default function ProcessPage() {
  const servicePages = getAllServicePages();

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
          <h1>問い合わせから実施後の振り返りまでを先に共有します。</h1>
          <p>
            何がいつ決まり、どの段階で提案や見積もりに進むかを公開し、相談前の不安を減らします。
          </p>

          <div className="card-grid journey-grid">
            {sharedJourneySteps.map((step) => (
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
              {servicePages.map((service) => (
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
