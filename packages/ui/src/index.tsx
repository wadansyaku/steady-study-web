import type { CSSProperties, ReactNode } from 'react';
import {
  brandAssets,
  serviceThemes,
  type BrandAssetVariant,
  type ServiceTheme,
  type ServiceThemeKey,
} from './brand';

export { brandAssets, serviceThemes };
export type { BrandAssetVariant, ServiceTheme, ServiceThemeKey };

export type NavItem = {
  href: string;
  label: string;
  external?: boolean;
};

export type ActionLink = {
  href: string;
  label: string;
  external?: boolean;
  kind?: 'primary' | 'secondary' | 'ghost' | 'service';
};

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function isCurrentPath(currentPath: string, href: string) {
  if (href === '/') {
    return currentPath === href;
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function Logo({
  variant = 'logo-dark',
  className,
  alt,
}: {
  variant?: BrandAssetVariant;
  className?: string;
  alt?: string;
}) {
  const asset = brandAssets[variant];
  return (
    <img
      src={asset.src}
      alt={alt ?? asset.alt}
      width={asset.width}
      height={asset.height}
      className={cx('brand-logo', className)}
    />
  );
}

export function SiteHeader({
  currentPath,
  navItems,
  cta,
}: {
  currentPath: string;
  navItems: NavItem[];
  cta: ActionLink;
}) {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <a className="site-header__logo" href="/" aria-label="AIYouMe ホーム">
          <Logo variant="logo-dark" />
        </a>
        <nav className="site-nav site-nav--desktop" aria-label="メインナビゲーション">
          {navItems.map((item) => (
            <a
              key={item.href}
              className="site-nav__link"
              href={item.href}
              aria-current={isCurrentPath(currentPath, item.href) ? 'page' : undefined}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer noopener' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          className={cx('button', 'button--solid', 'site-header__cta')}
          href={cta.href}
          target={cta.external ? '_blank' : undefined}
          rel={cta.external ? 'noreferrer noopener' : undefined}
        >
          {cta.label}
        </a>
        <details className="site-nav site-nav--mobile">
          <summary className="site-nav__summary">メニュー</summary>
          <div className="site-nav__panel">
            {navItems.map((item) => (
              <a
                key={item.href}
                className="site-nav__mobile-link"
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer noopener' : undefined}
              >
                {item.label}
              </a>
            ))}
            <a
              className="button button--solid"
              href={cta.href}
              target={cta.external ? '_blank' : undefined}
              rel={cta.external ? 'noreferrer noopener' : undefined}
            >
              {cta.label}
            </a>
          </div>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter({
  navItems,
  utilityItems,
}: {
  navItems: NavItem[];
  utilityItems: NavItem[];
}) {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <div className="site-footer__brand">
          <Logo variant="logo-light" alt="AIYouMe" />
          <p className="site-footer__tag">
            学習支援・制作支援・業務自動化を、状況整理から相談できる公開サイトです。
          </p>
        </div>
        <div className="site-footer__links">
          <div>
            <p className="site-footer__eyebrow">Services</p>
            <nav className="site-footer__nav" aria-label="支援内容">
              {navItems.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div>
            <p className="site-footer__eyebrow">Trust</p>
            <nav className="site-footer__nav" aria-label="公開情報">
              {utilityItems.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
  theme,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ActionLink[];
  aside?: ReactNode;
  theme?: ServiceThemeKey;
}) {
  const tone = theme ? serviceThemes[theme] : null;
  return (
    <section className={cx('hero', tone && 'hero--service')}>
      <div className="shell hero__inner">
        <div className="hero__copy">
          <p
            className="hero__eyebrow"
            style={tone ? { color: tone.accentStrong } : undefined}
          >
            {eyebrow}
          </p>
          <h1 className="hero__title">{title}</h1>
          <p className="hero__description">{description}</p>
          {actions && actions.length > 0 ? (
            <div className="hero__actions">
              {actions.map((action) => (
                <a
                  key={action.href}
                  className={cx(
                    'button',
                    action.kind === 'ghost'
                      ? 'button--ghost'
                      : action.kind === 'secondary'
                        ? 'button--secondary'
                        : action.kind === 'service'
                          ? 'button--service'
                          : 'button--solid'
                  )}
                  href={action.href}
                  target={action.external ? '_blank' : undefined}
                  rel={action.external ? 'noreferrer noopener' : undefined}
                  style={tone && action.kind === 'service'
                    ? {
                        backgroundColor: tone.accentInk,
                        color: '#ffffff',
                        boxShadow: `inset 0 0 0 1px ${tone.ring}`,
                    }
                    : undefined}
                >
                  {action.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
        {aside ? <div className="hero__aside">{aside}</div> : null}
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="section-header">
      <p className="section-header__eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </header>
  );
}

export function ServiceBadge({ theme }: { theme: ServiceThemeKey }) {
  const item = serviceThemes[theme];
  return (
    <span
      className="service-badge"
      style={{
        backgroundColor: item.accentSoft,
        color: item.accentInk,
        borderColor: item.ring,
      }}
    >
      <img src={brandAssets.mark.src} alt="" width="20" height="20" />
      {item.label}
    </span>
  );
}

export function ServiceCard({
  theme,
  title,
  audience,
  whatWeDo,
  deliverables,
  notFit,
  href,
}: {
  theme: ServiceThemeKey;
  title: string;
  audience: string;
  whatWeDo: string[];
  deliverables: string[];
  notFit: string;
  href: string;
}) {
  const tone = serviceThemes[theme];
  return (
    <article
      className="service-card"
      style={{
        '--card-accent': tone.accent,
        '--card-surface': tone.surface,
        '--card-ring': tone.ring,
      } as CSSProperties}
    >
      <ServiceBadge theme={theme} />
      <h3>{title}</h3>
      <div className="service-card__block">
        <p className="service-card__label">対象者</p>
        <p>{audience}</p>
      </div>
      <div className="service-card__block">
        <p className="service-card__label">依頼できること</p>
        <ul>
          {whatWeDo.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
      <div className="service-card__block">
        <p className="service-card__label">成果物 / 支援内容</p>
        <ul>
          {deliverables.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
      <div className="service-card__block">
        <p className="service-card__label">向かないケース</p>
        <p>{notFit}</p>
      </div>
      <a className="service-card__link" href={href}>
        詳細を見る
      </a>
    </article>
  );
}

export function ProofCard({
  title,
  body,
  meta,
  href,
  hrefLabel,
}: {
  title: string;
  body: string;
  meta?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <article className="proof-card">
      {meta ? <span>{meta}</span> : null}
      <h3>{title}</h3>
      <p>{body}</p>
      {href && hrefLabel ? (
        <a className="proof-card__link" href={href}>
          {hrefLabel}
        </a>
      ) : null}
    </article>
  );
}

export function CaseStudyCard({
  theme,
  title,
  summary,
  href,
  proof,
}: {
  theme: ServiceThemeKey;
  title: string;
  summary: string;
  href: string;
  proof: string;
}) {
  const tone = serviceThemes[theme];
  return (
    <article className="case-card">
      <div className="case-card__head">
        <ServiceBadge theme={theme} />
        <span style={{ color: tone.accentInk }}>{proof}</span>
      </div>
      <h3>{title}</h3>
      <p>{summary}</p>
      <a className="case-card__link" href={href}>
        事例を読む
      </a>
    </article>
  );
}

export function ContactStrip({
  title,
  body,
  actions,
  eyebrow = 'お問い合わせ',
}: {
  title: string;
  body: string;
  actions: ActionLink[];
  eyebrow?: string;
}) {
  return (
    <section className="contact-strip">
      <div className="shell contact-strip__inner">
        <div>
          <p className="section-header__eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{body}</p>
        </div>
        <div className="contact-strip__actions">
          {actions.map((action) => (
            <a
              key={action.href}
              className={cx(
                'button',
                action.kind === 'secondary'
                  ? 'button--secondary'
                  : action.kind === 'ghost'
                    ? 'button--ghost'
                    : 'button--solid'
              )}
              href={action.href}
              target={action.external ? '_blank' : undefined}
              rel={action.external ? 'noreferrer noopener' : undefined}
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
