import { getGlobalSettings, getPricingPage } from '@aiyoume/content';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const [settings, page] = await Promise.all([getGlobalSettings(), getPricingPage()]);

  return buildMetadata({
    title: '料金方針',
    description: page.seoDescription,
    path: '/pricing',
    siteName: settings.name,
  });
}

export default async function PricingPage() {
  const page = await getPricingPage();

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
          <h1>{page.title}</h1>
          <p>{page.intro}</p>

          <section className="section-block">
            <h2>費用が変わる主な要素</h2>
            <div className="card-grid">
              {page.factors.map((item) => (
                <article key={item} className="plain-card">
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section-block">
            <h2>支援モデルの考え方</h2>
            <div className="card-grid">
              {page.models.map((model) => (
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
              {page.proposalItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </>
  );
}
