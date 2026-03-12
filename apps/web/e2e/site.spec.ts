import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function expectNoSeriousAxeViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((item) =>
    item.impact === 'serious' || item.impact === 'critical'
  );
  expect(serious).toEqual([]);
}

const routeExpectations = [
  { path: '/', heading: '学習支援・制作支援・業務自動化を、状況整理から相談できます。', canonical: 'https://ai-yu-me.com' },
  { path: '/learning', heading: '親と子の不安を、実行できる計画に変える。', canonical: 'https://ai-yu-me.com/learning' },
  { path: '/studio', heading: '制作を、思いつきではなく運用できる形にする。', canonical: 'https://ai-yu-me.com/studio' },
  { path: '/automation', heading: '法人向けAI自動化を、現場で回る運用に落とし込む。', canonical: 'https://ai-yu-me.com/automation' },
  { path: '/about', heading: '相談前に判断できる情報を先に出すための運営方針です。', canonical: 'https://ai-yu-me.com/about' },
  { path: '/case-studies', heading: '事例で、何を変える支援なのかを示します。', canonical: 'https://ai-yu-me.com/case-studies' },
  { path: '/contact?service=automation', heading: '相談前に必要な情報', canonical: 'https://ai-yu-me.com/contact' },
  { path: '/faq', heading: '相談前によくある質問', canonical: 'https://ai-yu-me.com/faq' },
  { path: '/profile', heading: '運営者の役割と判断基準を公開しています。', canonical: 'https://ai-yu-me.com/profile' },
  { path: '/process', heading: '問い合わせから実施後の振り返りまでを先に共有します。', canonical: 'https://ai-yu-me.com/process' },
  { path: '/pricing', heading: '費用感は「支援の量」と「持つ責任」で決まります。', canonical: 'https://ai-yu-me.com/pricing' },
  { path: '/privacy', heading: 'プライバシーポリシー', canonical: 'https://ai-yu-me.com/privacy' },
  { path: '/terms', heading: '利用条件の要約', canonical: 'https://ai-yu-me.com/terms' },
  { path: '/security', heading: '問い合わせ前に確認できるセキュリティと契約の前提', canonical: 'https://ai-yu-me.com/security' },
] as const;

for (const route of routeExpectations) {
  test(`${route.path} exposes metadata and passes axe`, async ({ page }) => {
    await page.goto(route.path);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(route.heading);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', route.canonical);
    await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
    await expectNoSeriousAxeViolations(page);
  });
}

test('home page exposes trust-first structure and core CTAs', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 2, name: 'こんな状況なら相談対象です' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: '3つの入口を並列で用意しています' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: '依頼先として判断できる情報を先に公開しています' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: '問い合わせから実施後の振り返りまでを先に共有します' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: '匿名事例でも、支援の変化は確認できます' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: '相談前によくある質問' })).toBeVisible();

  await expect(page.locator('.hero__actions a[href="/contact"]').first()).toContainText('お問い合わせ');
  await expect(page.locator('.hero__actions a[href="/case-studies"]').first()).toContainText('事例を見る');
  await expect(page.locator('a[href="/learning"]').filter({ hasText: '詳細を見る' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: '料金方針を見る' }).first()).toBeVisible();
});

test('contact page renders and submits first-party lead form', async ({ page }) => {
  test.slow();
  await page.goto('/contact?service=automation');
  await expect(page.getByLabel('相談先')).toHaveValue('automation');
  await page.getByLabel('お名前').fill('Playwright Test');
  await page.getByLabel('メールアドレス').fill('playwright@example.com');
  await page.getByLabel('組織名 / 学年など').fill('AIYouMe QA');
  await page.getByLabel('役割 / 立場').fill('QA');
  await page
    .getByLabel('相談内容')
    .fill('Automation 導入前の整理を相談したいです。現状フローの棚卸しから支援をお願いします。');
  await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/contact/submit/automation') &&
      response.request().method() === 'POST'
    ),
    page.getByRole('button', { name: '問い合わせを送信' }).click(),
  ]);
  await expect(page.getByText('送信を受け付けました。通常 1 営業日以内に返信します。')).toBeVisible();
});

test('lead API rejects incomplete submissions', async ({ request }) => {
  const response = await request.post('/contact/submit/learning', {
    data: {
      service: 'learning',
      name: '',
      email: 'invalid',
      message: 'short',
      consent: false,
    },
  });

  expect(response.status()).toBe(422);
  const payload = await response.json();
  expect(payload).toMatchObject({
    ok: false,
    message: '入力内容を確認してください。',
  });
  expect(payload.issues).toBeTruthy();
});

test('lead API rejects unknown services with controlled 404', async ({ request }) => {
  const response = await request.post('/contact/submit/unknown-service', {
    data: {
      service: 'unknown-service',
      name: 'Playwright Test',
      email: 'playwright@example.com',
      message:
        'This payload should never reach persistence because the service key is invalid.',
      consent: true,
    },
  });

  expect(response.status()).toBe(404);
  const payload = await response.json();
  expect(payload).toMatchObject({
    ok: false,
    message: 'Unknown service.',
  });
});

test('legacy redirects stay intact', async ({ page, request }) => {
  await page.goto('/education');
  await expect(page).toHaveURL(/\/learning$/);

  await page.goto('/creator');
  await expect(page).toHaveURL(/\/studio$/);

  const response = await request.fetch('/creator/void-rush/demo', {
    maxRedirects: 0,
  });

  expect(response.status()).toBeGreaterThanOrEqual(300);
  expect(response.status()).toBeLessThan(400);
  expect(response.headers().location).toBe('https://labs.ai-yu-me.com/void-rush/demo');
});

test('core site stays free of legacy void-rush assets', async ({ page }) => {
  await page.goto('/');
  const html = await page.content();
  expect(html).not.toContain('/creator/void-rush/');
  expect(html).not.toContain('/api/voidrush');
});

test('desktop visual regression keeps logo-driven hero', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium');
  await page.goto('/');
  await expect(page.locator('.hero')).toHaveScreenshot('home-hero.png', {
    maxDiffPixelRatio: 0.05,
  });
  await expect(page.locator('.site-header')).toHaveScreenshot('desktop-header.png', {
    maxDiffPixelRatio: 0.05,
  });
  await expect(page.locator('.site-footer')).toHaveScreenshot('site-footer.png', {
    maxDiffPixelRatio: 0.05,
  });
  await expect(page.locator('.service-badge').first()).toHaveScreenshot('service-badge-learning.png', {
    maxDiffPixelRatio: 0.05,
  });
});

test('mobile visual regression keeps navigation compact', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/');
  await expect(page.locator('.site-header')).toHaveScreenshot('mobile-header.png', {
    maxDiffPixelRatio: 0.05,
  });
});
