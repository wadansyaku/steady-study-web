import { getFaqItems, getGlobalSettings } from '@aiyoume/content';
import { JsonLd } from '@/components/JsonLd';
import { faqJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const settings = await getGlobalSettings();

  return buildMetadata({
    title: 'よくある質問',
    description: 'AIYouMe の相談前によくある質問をまとめています。',
    path: '/faq',
    siteName: settings.name,
  });
}

export default async function FAQPage() {
  const items = await getFaqItems();

  return (
    <>
      <JsonLd data={faqJsonLd(items)} />
      <section className="section">
        <div className="shell prose-shell">
          <p className="section-header__eyebrow">FAQ</p>
          <h1>相談前によくある質問</h1>
          <div className="faq-list">
            {items.map((item) => (
              <details key={item.question} className="faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
