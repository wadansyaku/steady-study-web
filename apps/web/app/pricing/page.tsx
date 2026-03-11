import { pricingModels, pricingSummary } from '@aiyoume/content';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: '料金方針',
  description: 'AIYouMe の費用感が何で決まるか、提案時に何を整理するかを掲載しています。',
  path: '/pricing',
});

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'ホーム', path: '/' },
          { name: '料金方針', path: '/pricing' },
        ])}
      />
      <section className="section">
        <div className="shell prose-shell">
          <p className="section-header__eyebrow">Pricing</p>
          <h1>費用感は「支援の量」と「持つ責任」で決まります。</h1>
          <p>{pricingSummary.intro}</p>

          <section className="section-block">
            <h2>費用が変わる主な要素</h2>
            <div className="card-grid">
              {pricingSummary.factors.map((item) => (
                <article key={item} className="plain-card">
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section-block">
            <h2>支援モデルの考え方</h2>
            <div className="card-grid">
              {pricingModels.map((model) => (
                <article key={model.title} className="plain-card">
                  <h3>{model.title}</h3>
                  <p>{model.summary}</p>
                  <ul>
                    {model.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="section-block">
            <h2>提案時に整理すること</h2>
            <ul>
              {pricingSummary.proposalItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </>
  );
}
