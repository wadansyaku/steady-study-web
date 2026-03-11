import { securitySummary } from '@aiyoume/content';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'セキュリティ',
  description: 'AIYouMe の問い合わせ導線、取り扱う情報、利用ベンダー、開始前に確認する前提を公開しています。',
  path: '/security',
});

export default function SecurityPage() {
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
          <h1>{securitySummary.title}</h1>
          <div className="card-grid">
            {securitySummary.commitments.map((item) => (
              <article key={item} className="plain-card">
                <p>{item}</p>
              </article>
            ))}
          </div>

          <section className="section-block">
            <h2>問い合わせ時に扱う情報</h2>
            <div className="card-grid">
              {securitySummary.intake.map((item) => (
                <article key={item} className="plain-card">
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section-block">
            <h2>開始前に確認する前提</h2>
            <div className="card-grid">
              {securitySummary.boundaries.map((item) => (
                <article key={item} className="plain-card">
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section-block">
            <h2>使用する主なベンダー</h2>
            <ul>
              {securitySummary.vendors.map((vendor) => (
                <li key={vendor}>{vendor}</li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </>
  );
}
