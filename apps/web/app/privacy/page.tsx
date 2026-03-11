import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Privacy',
  description: 'AIYouMe の問い合わせ情報、外部ベンダー、labs コンテンツを含むプライバシーポリシーです。',
  path: '/privacy',
});

const sections = [
  {
    title: '取得する情報',
    body: '問い合わせフォームでは氏名、メール、相談内容、組織名、役割、送信経路に関する情報を受け取ります。',
  },
  {
    title: '利用目的',
    body: '相談対応、日程調整、案件提案、運用改善、bot 対策、不正送信検知のために使用します。',
  },
  {
    title: '保存先とベンダー',
    body: 'Cloudflare Workers / D1 を基盤にし、通知には Resend、CMS 管理には Sanity を利用する場合があります。',
  },
  {
    title: 'labs コンテンツ',
    body: 'VOID-RUSH は labs ドメインで分離運用し、本体問い合わせ用途とは別系統の実験コンテンツとして扱います。',
  },
];

export default function PrivacyPage() {
  return (
    <section className="section">
      <div className="shell prose-shell">
        <p className="section-header__eyebrow">Privacy</p>
        <h1>プライバシーポリシー</h1>
        <div className="card-grid">
          {sections.map((section) => (
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
