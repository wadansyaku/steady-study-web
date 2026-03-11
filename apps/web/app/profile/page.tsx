import { profileSummary } from '@aiyoume/content';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: '運営スタンス',
  description: 'AIYouMe の運営者が重視する役割、判断基準、対応スタンスを掲載しています。',
  path: '/profile',
});

export default function ProfilePage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'ホーム', path: '/' },
          { name: '運営スタンス', path: '/profile' },
        ])}
      />
      <section className="section">
        <div className="shell prose-shell">
          <p className="section-header__eyebrow">Profile</p>
          <h1>{profileSummary.title}</h1>
          <p>{profileSummary.body}</p>

          <article className="plain-card">
            <h2>運営者の役割</h2>
            <p>{profileSummary.role}</p>
          </article>

          <div className="card-grid">
            <article className="plain-card">
              <h2>得意としていること</h2>
              <ul>
                {profileSummary.specialties.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="plain-card">
              <h2>対応時のスタンス</h2>
              <ul>
                {profileSummary.workingStyle.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="plain-card">
              <h2>先に共有する線引き</h2>
              <ul>
                {profileSummary.boundaries.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
