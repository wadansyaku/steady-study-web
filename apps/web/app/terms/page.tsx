import { termsSummary } from '@aiyoume/content';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Terms',
  description: 'AIYouMe の提供条件、レビュー、守秘、問い合わせ情報の取り扱いに関する要約です。',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <section className="section">
      <div className="shell prose-shell">
        <p className="section-header__eyebrow">Terms</p>
        <h1>利用条件の要約</h1>
        <div className="card-grid">
          {termsSummary.sections.map((section) => (
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
