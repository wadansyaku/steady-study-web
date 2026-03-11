export default function NotFoundPage() {
  return (
    <section className="section">
      <div className="shell prose-shell">
        <p className="section-header__eyebrow">404</p>
        <h1>ページが見つかりません。</h1>
        <p>旧導線から来た場合は、学習支援 / 制作支援 / 業務自動化 へ移行している可能性があります。</p>
        <div className="inline-actions">
          <a className="button button--solid" href="/">
            ホームへ戻る
          </a>
          <a className="button button--secondary" href="/contact">
            問い合わせる
          </a>
        </div>
      </div>
    </section>
  );
}
