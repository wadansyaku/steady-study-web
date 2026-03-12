import { getAboutPage, getGlobalSettings } from '@aiyoume/content';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const [settings, page] = await Promise.all([getGlobalSettings(), getAboutPage()]);

  return buildMetadata({
    title: '運営方針',
    description: page.seoDescription,
    path: '/about',
    siteName: settings.name,
  });
}

export default async function AboutPage() {
  const [page, settings] = await Promise.all([getAboutPage(), getGlobalSettings()]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'ホーム', path: '/' },
          { name: '運営方針', path: '/about' },
        ])}
      />
      <section className="section">
        <div className="shell prose-shell">
          <p className="section-header__eyebrow">Operating Policy</p>
          <h1>{page.title}</h1>
          <p>{page.body}</p>

          <section className="section-block">
            <h2>先に公開すること</h2>
            <div className="card-grid">
              {page.principles.map((item) => (
                <article key={item.title} className="plain-card">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section-block">
            <h2>対応範囲と線引き</h2>
            <div className="card-grid">
              {page.boundaries.map((item) => (
                <article key={item.title} className="plain-card">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section-block">
            <h2>ブランド名に込めている約束</h2>
            <div className="pillar-grid">
              {settings.brandPillars.map((pillar) => (
                <article key={pillar.title} className="pillar-card">
                  <h3>{pillar.title}</h3>
                  <p>{pillar.body}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
