import { getPublicEnv } from '@/lib/env';
import { buildMetadata } from '@/lib/seo';
import { ContactForm } from '@/components/ContactForm';

export const metadata = buildMetadata({
  title: 'お問い合わせ',
  description: 'AIYouMe への問い合わせフォーム、LINE、予約導線と、最初にあると相談しやすい情報を掲載しています。',
  path: '/contact',
});

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const params = await searchParams;
  const env = getPublicEnv();
  const service =
    params.service === 'learning' || params.service === 'studio' || params.service === 'automation'
      ? params.service
      : 'learning';

  return (
    <section className="section">
      <div className="shell contact-layout">
        <div className="contact-copy">
          <p className="section-header__eyebrow">Contact</p>
          <h1>相談前に必要な情報だけ、先に集めます。</h1>
          <p>
            学習支援、制作支援、業務自動化のどれであっても、最初に必要なのは全情報ではありません。
            現状、困りごと、直近で止まりやすい場面が分かれば十分です。
          </p>
          <div className="card-grid">
            <article className="plain-card">
              <h2>学習支援</h2>
              <p>目標、残り期間、使っている教材が分かると初回の切り分けが速くなります。</p>
            </article>
            <article className="plain-card">
              <h2>制作支援</h2>
              <p>公開先、素材、納期が分かると要件整理に入りやすくなります。</p>
            </article>
            <article className="plain-card">
              <h2>業務自動化</h2>
              <p>現行フロー、担当者、使っているSaaS が分かると最初の対象を絞れます。</p>
            </article>
          </div>
        </div>
        <ContactForm
          initialService={service}
          email={env.contactEmail}
          lineUrl={env.lineUrl}
          bookingUrl={env.bookingUrl}
          turnstileSiteKey={env.turnstileSiteKey}
        />
      </div>
    </section>
  );
}
