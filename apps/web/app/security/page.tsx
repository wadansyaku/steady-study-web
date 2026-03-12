import { getGlobalSettings, getSecurityPage } from '@aiyoume/content';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const [settings, page] = await Promise.all([getGlobalSettings(), getSecurityPage()]);

  return buildMetadata({
    title: 'セキュリティ',
    description: page.seoDescription,
    path: '/security',
    siteName: settings.name,
  });
}

export default async function SecurityPage() {
  const page = await getSecurityPage();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'ホーム', path: '/' },
          { name: 'セキュリティ', path: '/security' },
        ])}
      />
      <section className="section">
        <div className="shell prose-shell">
          <p className="section-header__eyebrow">Security</p>
          <h1>{page.title}</h1>
          <div className="card-grid">
            {page.commitments.map((item) => (
              <article key={item} className="plain-card">
                <p>{item}</p>
              </article>
            ))}
          </div>

          <section className="section-block">
            <h2>問い合わせ時に扱う情報</h2>
            <div className="card-grid">
              {page.intake.map((item) => (
                <article key={item} className="plain-card">
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section-block">
            <h2>開始前に確認する前提</h2>
            <div className="card-grid">
              {page.boundaries.map((item) => (
                <article key={item} className="plain-card">
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section-block">
            <h2>使用する主なベンダー</h2>
            <ul>
              {page.vendors.map((vendor) => (
                <li key={vendor}>{vendor}</li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </>
  );
}
