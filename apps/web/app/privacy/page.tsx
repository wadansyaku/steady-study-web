import { getGlobalSettings, getPolicyPage } from '@aiyoume/content';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const [settings, page] = await Promise.all([
    getGlobalSettings(),
    getPolicyPage('privacy'),
  ]);

  return buildMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: '/privacy',
    siteName: settings.name,
  });
}

export default async function PrivacyPage() {
  const page = await getPolicyPage('privacy');

  return (
    <section className="section">
      <div className="shell prose-shell">
        <p className="section-header__eyebrow">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <div className="card-grid">
          {page.sections.map((section) => (
            <article key={section.title} className="plain-card">
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
