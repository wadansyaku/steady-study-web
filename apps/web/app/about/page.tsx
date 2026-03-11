import { aboutSummary, siteSettings } from '@aiyoume/content';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: '運営方針',
  description: 'AIYouMe が誰向けで、どのような進め方や線引きを重視しているかを公開しています。',
  path: '/about',
});

export default function AboutPage() {
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
          <h1>{aboutSummary.title}</h1>
          <p>{aboutSummary.body}</p>

          <section className="section-block">
            <h2>先に公開すること</h2>
            <div className="card-grid">
              {aboutSummary.principles.map((item) => (
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
              {aboutSummary.boundaries.map((item) => (
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
              {siteSettings.brandPillars.map((pillar) => (
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
