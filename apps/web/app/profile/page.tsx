import { getGlobalSettings, getProfilePage } from '@aiyoume/content';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const [settings, page] = await Promise.all([getGlobalSettings(), getProfilePage()]);

  return buildMetadata({
    title: '運営スタンス',
    description: page.seoDescription,
    path: '/profile',
    siteName: settings.name,
  });
}

export default async function ProfilePage() {
  const page = await getProfilePage();

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
          <h1>{page.title}</h1>
          <p>{page.body}</p>

          <article className="plain-card">
            <h2>運営者の役割</h2>
            <p>{page.role}</p>
          </article>

          <div className="card-grid">
            <article className="plain-card">
              <h2>得意としていること</h2>
              <ul>
                {page.specialties.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="plain-card">
              <h2>対応時のスタンス</h2>
              <ul>
                {page.workingStyle.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="plain-card">
              <h2>先に共有する線引き</h2>
              <ul>
                {page.boundaries.map((item) => (
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
