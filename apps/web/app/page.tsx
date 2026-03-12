import { getCaseStudies, getGlobalSettings, getHomePage } from '@aiyoume/content';
import {
  ContactStrip,
  PageHero,
  ProofCard,
  SectionHeader,
  ServiceBadge,
  ServiceCard,
} from '@aiyoume/ui';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/json-ld';
import { buildMetadata } from '@/lib/seo';

const proofTypeLabels = {
  policy: '公開方針',
  process: '進め方',
  'case-study': '匿名事例',
  boundary: '対応範囲',
} as const;

export async function generateMetadata() {
  const [settings, page] = await Promise.all([getGlobalSettings(), getHomePage()]);

  return buildMetadata({
    title: page.seo.title,
    description: page.seo.description,
    ogTitle: page.seo.ogTitle,
    ogDescription: page.seo.ogDescription,
    path: '/',
    siteName: settings.name,
  });
}

export default async function HomePage() {
  const [page, studies] = await Promise.all([getHomePage(), getCaseStudies()]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'ホーム', path: '/' },
        ])}
      />
      <JsonLd data={faqJsonLd(page.faqPreview)} />

      <PageHero
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        description={page.hero.description}
        actions={[
          { href: '/contact', label: 'お問い合わせ' },
          { href: '/case-studies', label: '事例を見る', kind: 'secondary' },
          { href: '/process', label: '進め方を見る', kind: 'ghost' },
        ]}
        aside={
          <div className="hero-card">
            <img src="/brand/aiyoume-lockup.svg" alt="AIYouMe" width="280" height="76" />
            <div className="hero-card__badges" aria-label="3つの支援">
              <ServiceBadge theme="learning" />
              <ServiceBadge theme="studio" />
              <ServiceBadge theme="automation" />
            </div>
            <dl className="hero-card__facts">
              {page.hero.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        }
      />

      <section className="section section--tinted">
        <div className="shell">
          <SectionHeader
            eyebrow="Fit"
            title="こんな状況なら相談対象です"
            description="最初から依頼内容が固まっていなくても構いません。いま止まっている場面が見えていれば、最初の切り分けを始められます。"
          />
          <div className="card-grid">
            {page.fitCases.map((item) => (
              <article key={item.title} className="plain-card fit-card">
                {item.service ? (
                  <ServiceBadge theme={item.service} />
                ) : (
                  <span className="fit-card__tag">横断相談</span>
                )}
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          <p className="section-note">
            <strong>向いていない相談:</strong> {page.notFitNote}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHeader
            eyebrow="Three Services"
            title="3つの入口を並列で用意しています"
            description="学習支援、制作支援、業務自動化のどこからでも入れます。迷う場合は、まず状況整理の相談としてお問い合わせください。"
          />
          <div className="card-grid card-grid--services">
            {page.serviceHighlights.map((service) => (
              <ServiceCard
                key={service.slug}
                theme={service.slug}
                title={service.label}
                audience={service.audience}
                whatWeDo={service.whatWeDo}
                deliverables={service.deliverables}
                notFit={service.notFit}
                href={service.ctaHref}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tinted">
        <div className="shell">
          <SectionHeader
            eyebrow="Trust"
            title="依頼先として判断できる情報を先に公開しています"
            description="顔や強い自己演出ではなく、進め方、料金方針、対応範囲、セキュリティ、事例で信頼を作る設計です。"
          />
          <div className="card-grid">
            {page.trustProofs.map((item) => (
              <ProofCard
                key={item.title}
                title={item.title}
                body={item.summary}
                meta={proofTypeLabels[item.proofType]}
                href={item.href}
                hrefLabel={item.hrefLabel}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHeader
            eyebrow="Process"
            title="問い合わせから実施後の振り返りまでを先に共有します"
            description="何がいつ決まり、どの段階で提案や見積もりに進むかを公開して、相談前の不安を減らします。"
          />
          <div className="card-grid journey-grid">
            {page.processSteps.map((step) => (
              <article key={step.step} className="plain-card journey-card">
                <p className="journey-card__step">{step.step}</p>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tinted">
        <div className="shell">
          <SectionHeader
            eyebrow="Case Studies"
            title="匿名事例でも、支援の変化は確認できます"
            description="抽象論ではなく、相談前の状態、対応内容、変化を並べて、支援の実態が分かる形で示します。"
          />
          <div className="card-grid">
            {studies.map((study) => (
              <article key={study.slug} className="case-card case-card--detailed">
                <div className="case-card__head">
                  <ServiceBadge theme={study.service} />
                  <span>{study.proofLabel}</span>
                </div>
                <h3>{study.title}</h3>
                <div className="case-card__detail">
                  <p className="case-card__label">相談前の状態</p>
                  <p>{study.challenge}</p>
                </div>
                <div className="case-card__detail">
                  <p className="case-card__label">対応内容</p>
                  <ul>
                    {study.response.slice(0, 2).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="case-card__detail">
                  <p className="case-card__label">変化</p>
                  <ul>
                    {study.outcomes.slice(0, 2).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <a className="case-card__link" href={`/case-studies/${study.slug}`}>
                  事例を読む
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <SectionHeader
            eyebrow="FAQ"
            title="相談前によくある質問"
            description="課題が曖昧でも相談できるか、費用感はどう決まるか、オンライン対応できるかなど、最初に気になりやすい点を先にまとめています。"
          />
          <div className="faq-list">
            {page.faqPreview.map((item) => (
              <details key={item.question} className="faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
          <div className="inline-actions">
            <a className="button button--secondary" href="/faq">
              すべての質問を見る
            </a>
          </div>
        </div>
      </section>

      <section className="section section--tinted">
        <div className="shell">
          <SectionHeader
            eyebrow={page.brandSummary.eyebrow}
            title={page.brandSummary.title}
            description={page.brandSummary.description}
          />
          <div className="pillar-grid">
            {page.brandSummary.pillars.map((pillar) => (
              <article key={pillar.title} className="pillar-card">
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ContactStrip
        eyebrow="お問い合わせ"
        title="相談内容が整理できていなくても構いません"
        body="現状、困りごと、直近で止まる場面の3点だけでも共有いただければ、どの支援が近いか、どこから着手すべきかを一緒に切り分けます。"
        actions={[
          { href: '/contact', label: 'お問い合わせ' },
          { href: '/pricing', label: '料金方針を見る', kind: 'secondary' },
        ]}
      />
    </>
  );
}
