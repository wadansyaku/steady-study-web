export type ServiceKey = 'learning' | 'studio' | 'automation';

export type LinkItem = {
  href: string;
  label: string;
  external?: boolean;
};

export type ProofAsset = {
  title: string;
  body: string;
  meta?: string;
};

export type ProcessStep = {
  title: string;
  body: string;
};

export type ServicePage = {
  key: ServiceKey;
  title: string;
  heroTitle: string;
  heroDescription: string;
  audience: string[];
  deliverables: string[];
  proof: ProofAsset[];
  process: ProcessStep[];
  fit: string[];
  ctaTitle: string;
  ctaBody: string;
  seoDescription: string;
};

export type CaseStudy = {
  slug: string;
  service: ServiceKey;
  title: string;
  summary: string;
  challenge: string;
  response: string[];
  outcomes: string[];
  proofLabel: string;
};

export type FAQItem = {
  question: string;
  answer: string;
  service?: ServiceKey;
};

export type PricingModel = {
  title: string;
  summary: string;
  items: string[];
};

export type TrustProofType = 'policy' | 'process' | 'case-study' | 'boundary';

export type HomeHero = {
  eyebrow: string;
  title: string;
  description: string;
  facts: Array<{
    label: string;
    value: string;
  }>;
};

export type FitCase = {
  title: string;
  body: string;
  service?: ServiceKey;
};

export type ServiceHighlight = {
  slug: ServiceKey;
  label: string;
  audience: string;
  whatWeDo: string[];
  deliverables: string[];
  notFit: string;
  ctaHref: string;
};

export type TrustProof = {
  title: string;
  summary: string;
  proofType: TrustProofType;
  href: string;
  hrefLabel: string;
};

export type JourneyStep = {
  step: string;
  title: string;
  body: string;
};

export const siteSettings = {
  name: 'AIYouMe',
  tagline: '学習支援・制作支援・業務自動化を、状況整理から相談できる。',
  description:
    'AIYouMe は、親や教育関係者、個人・小規模事業者、法人チーム向けに、学習支援・制作支援・業務自動化を整理から実装まで支えるブランドです。',
  navigation: [
    { href: '/learning', label: '学習支援' },
    { href: '/studio', label: '制作支援' },
    { href: '/automation', label: '業務自動化' },
    { href: '/case-studies', label: '事例' },
    { href: '/about', label: '運営方針' },
    { href: '/contact', label: 'お問い合わせ' },
  ] satisfies LinkItem[],
  footerNav: [
    { href: '/learning', label: '学習支援' },
    { href: '/studio', label: '制作支援' },
    { href: '/automation', label: '業務自動化' },
  ] satisfies LinkItem[],
  footerUtility: [
    { href: '/about', label: '運営方針' },
    { href: '/profile', label: '運営スタンス' },
    { href: '/process', label: '進め方' },
    { href: '/pricing', label: '料金方針' },
    { href: '/security', label: 'セキュリティ' },
    { href: '/terms', label: '利用条件' },
    { href: '/privacy', label: 'プライバシー' },
  ] satisfies LinkItem[],
  contactChannels: {
    line: 'https://line.me/',
    booking: 'https://example.com/booking',
    email: 'hello@ai-yu-me.com',
    labs: 'https://labs.ai-yu-me.com/void-rush',
  },
  brandPillars: [
    {
      title: 'AI',
      body: '人の判断を消すためではなく、整理や自動化で現場の摩擦を減らすための軸。',
    },
    {
      title: 'You',
      body: '学ぶ人、依頼する人、使う人。現場で前に進む当事者を中心に置く。',
    },
    {
      title: 'Me',
      body: '設計・実装・改善を引き受ける側として、責任の範囲と非対応を先に明確にする。',
    },
  ],
} as const;

export const sharedJourneySteps: JourneyStep[] = [
  {
    step: '01',
    title: 'お問い合わせ',
    body: '現状、困りごと、直近で止まりやすい場面を共有いただき、相談の入口をそろえます。',
  },
  {
    step: '02',
    title: '初回整理',
    body: '課題の輪郭、使っている体制や道具、優先順位を確認し、何から扱うべきかを切り分けます。',
  },
  {
    step: '03',
    title: '提案 / 見積もり',
    body: '支援範囲、成果物、頻度、レビュー方法、費用感を整理したうえで提案します。',
  },
  {
    step: '04',
    title: '実施',
    body: '設計、制作、実装、伴走のいずれでも、小さく始めて確認しながら進めます。',
  },
  {
    step: '05',
    title: '振り返り',
    body: '成果だけでなく、次も回せるか、負荷が減ったかを確認し、次の改善へつなげます。',
  },
];

export const servicePages: Record<ServiceKey, ServicePage> = {
  learning: {
    key: 'learning',
    title: 'AIYouMe Learning',
    heroTitle: '親と子の不安を、実行できる計画に変える。',
    heroDescription:
      '中学受験・高校受験・医学部再受験まで、現状整理と週次運用を一体で支える学習伴走です。',
    audience: [
      '何から手を付けるべきかが曖昧な受験家庭',
      '塾や教材はあるが、家庭内の運用が崩れているケース',
      '模試・過去問の結果を次週の行動に変えたいケース',
    ],
    deliverables: [
      '現状診断と優先順位の整理',
      '週次計画、振り返り、修正の運用設計',
      '教材・記録・相談導線の整理',
    ],
    proof: [
      {
        title: '初回相談で見る観点を公開',
        body: '志望校、残り期間、教材、家庭内の負荷、止まりやすい場面を最初に整理します。',
      },
      {
        title: '価格は頻度と範囲で提案',
        body: '公開面では煽らず、必要な支援の量に合わせて提案します。',
      },
    ],
    process: [
      {
        title: 'Diagnose',
        body: '志望校・教材・模試結果・家庭内の運用を見て、詰まりの原因を一緒に言語化します。',
      },
      {
        title: 'Design',
        body: '週単位で回る学習計画へ落とし込み、記録方法まで決めます。',
      },
      {
        title: 'Run',
        body: '実行が止まった日の立て直しまで含めて伴走します。',
      },
      {
        title: 'Review',
        body: '振り返りを次の行動に変え、計画と感情のズレを減らします。',
      },
    ],
    fit: [
      '塾や予備校と併用したい',
      '親が全部管理する形から抜け出したい',
      '今ある教材を捨てずに再設計したい',
    ],
    ctaTitle: 'まずは学習の現状整理から',
    ctaBody:
      '相談内容が未整理でも構いません。今ある教材、目標、残り期間の3点だけでも共有いただければ着手できます。',
    seoDescription:
      'AIYouMe Learning は、受験家庭向けに現状整理・週次設計・実行改善までを一体で支える学習伴走サービスです。',
  },
  studio: {
    key: 'studio',
    title: 'AIYouMe Studio',
    heroTitle: '制作を、思いつきではなく運用できる形にする。',
    heroDescription:
      '音楽制作、動画編集、クリエイティブ整理まで、用途と運用フローに合わせて設計する制作支援です。',
    audience: [
      '発注物はあるが、ゴール定義が曖昧なチーム',
      '制作物はできるが、毎回の手戻りが多いケース',
      '動画・音声・構成をまとめて相談したいケース',
    ],
    deliverables: [
      '要件整理とアウトプット定義',
      '制作フロー、レビュー観点、納品形の設計',
      '継続運用しやすいテンプレート整備',
    ],
    proof: [
      {
        title: '制作前にレビュー観点を固定',
        body: '完成後ではなく、途中確認の観点を先に決めて手戻りを減らします。',
      },
      {
        title: '実験系は labs に分離',
        body: 'VOID-RUSH は本体導線から切り離し、Studio の検証事例としてのみ扱います。',
      },
    ],
    process: [
      {
        title: 'Diagnose',
        body: '用途、公開場所、納期、レビュー体制を整理します。',
      },
      {
        title: 'Design',
        body: '尺、構成、音、見せ方、運用フローを定義します。',
      },
      {
        title: 'Run',
        body: '段階レビューとフィードバック整理を挟みながら制作します。',
      },
      {
        title: 'Review',
        body: '納品後も改善しやすいファイル構成やテンプレートに整えます。',
      },
    ],
    fit: [
      'YouTube / 配信 / ショート動画を継続したい',
      'BGM・効果音・MIX と動画をまとめて整えたい',
      '外注化しつつ、内部運用も崩したくない',
    ],
    ctaTitle: '制作相談を要件整理から始める',
    ctaBody:
      '何を依頼すべきか分からない段階でも対応できます。素材、公開先、納期の3点から話を始めます。',
    seoDescription:
      'AIYouMe Studio は、音楽制作・動画編集・クリエイティブ制作を要件整理から運用設計まで一体で支えるサービスです。',
  },
  automation: {
    key: 'automation',
    title: 'AIYouMe Automation',
    heroTitle: '法人向けAI自動化を、現場で回る運用に落とし込む。',
    heroDescription:
      'PoC 止まりで終わらせず、権限・監査・通知・保守まで含めて運用可能なワークフローへつなげます。',
    audience: [
      '問い合わせ、文書、定型連絡の運用が属人化しているチーム',
      'AI の導入余地はあるが、ガバナンスや責任分界が曖昧なケース',
      'まずは小さく始めたいが、後で拡張できる設計にしたいケース',
    ],
    deliverables: [
      '現行業務フローの可視化',
      'AI / API / SaaS 連携の設計と実装',
      'NDA、権限、通知、監査ログを含む運用設計',
    ],
    proof: [
      {
        title: 'Security ページを先に公開',
        body: '問い合わせ前に、権限、保存データ、通知方法、外部ベンダー利用を確認できます。',
      },
      {
        title: '問い合わせフォームで受付',
        body: '送信内容と対応状況を first-party で保持し、資料共有や初回ヒアリングの導線を明確にします。',
      },
    ],
    process: [
      {
        title: 'Diagnose',
        body: '現行フロー、責任者、権限、データの出入りを確認します。',
      },
      {
        title: 'Design',
        body: 'PoC ではなく運用前提で、例外処理と人の確認ポイントを設計します。',
      },
      {
        title: 'Run',
        body: '既存業務へ無理なく接続し、監視や通知まで含めて導入します。',
      },
      {
        title: 'Review',
        body: '稼働後のログを確認し、精度・速度・責任分界を改善します。',
      },
    ],
    fit: [
      '問い合わせ一次対応やナレッジ整理を小さく始めたい',
      '既存SaaSと API 連携しながら運用負荷を減らしたい',
      'NDA、権限、監査観点を相談前に確認したい',
    ],
    ctaTitle: '業務フローを可視化するところから始める',
    ctaBody:
      '現場のフロー図、使っているSaaS、困っている例外だけでも共有いただければ、最初の対象を切り分けられます。',
    seoDescription:
      'AIYouMe Automation は、法人向けに AI 自動化・業務設計・運用改善を一体で支援する実装サービスです。',
  },
};

export const pricingModels: PricingModel[] = [
  {
    title: '伴走型',
    summary: '週次または隔週で相談・修正を回すモデルです。',
    items: [
      '現状診断と優先順位の整理',
      '定例ミーティングと次アクション設計',
      '必要に応じたチャット相談',
    ],
  },
  {
    title: '制作 / 実装型',
    summary: '成果物やワークフロー単位で設計・実装するモデルです。',
    items: [
      '要件定義とスコープ整理',
      '制作または実装',
      '引き継ぎ資料または運用手順書',
    ],
  },
  {
    title: 'ハイブリッド型',
    summary: '短期の制作・実装と、その後の伴走を組み合わせるモデルです。',
    items: [
      '初期設計',
      '実装または制作',
      '運用定着のフォローアップ',
    ],
  },
];

export const caseStudies: CaseStudy[] = [
  {
    slug: 'learning-weekly-reset',
    service: 'learning',
    title: '家庭内で止まりがちな受験学習を、週次リズムに戻したケース',
    summary:
      '教材は揃っているのに回らない状態から、親子の確認ポイントを整理し直して週次運用へ戻した支援です。',
    challenge:
      '計画は立つが続かず、模試後の振り返りも次週の行動につながらない状態でした。',
    response: [
      '初回で教材、志望校、家庭内の会話を棚卸しした',
      '日次ではなく週次で見る指標に絞った',
      '親の確認ポイントを「量」ではなく「詰まり」に変えた',
    ],
    outcomes: [
      '家庭内で何を確認するかが明確になった',
      '学習記録が翌週の修正材料として使えるようになった',
      '無理な詰め込みをやめ、継続可能なペースに戻せた',
    ],
    proofLabel: '学習運用の再設計',
  },
  {
    slug: 'studio-review-flow',
    service: 'studio',
    title: '動画と音のレビュー往復を減らし、納品までの流れを整えたケース',
    summary:
      '動画編集と音調整のレビュー軸を分離し、毎回の修正往復を減らした制作支援です。',
    challenge:
      '映像、音、構成の指摘が混線し、毎回どこから直すかが曖昧でした。',
    response: [
      '用途、尺、公開先ごとに確認観点を固定した',
      '映像レビューと音レビューを別タイミングに分けた',
      '納品データの命名とフォルダ構成を標準化した',
    ],
    outcomes: [
      'レビュー依頼の粒度が揃い、修正指示が短くなった',
      '納品後の差し替え作業が容易になった',
      '継続案件でも同じ流れを使い回せるようになった',
    ],
    proofLabel: '制作フローの標準化',
  },
  {
    slug: 'automation-intake-router',
    service: 'automation',
    title: '社内問い合わせの一次整理を自動化し、人手確認の位置を明確にしたケース',
    summary:
      '問い合わせ分類、通知、回答ドラフト生成を分離し、AI と人の担当範囲を整理した支援です。',
    challenge:
      '担当者ごとに判断基準がばらつき、問い合わせが個人チャットに流れていました。',
    response: [
      '問い合わせの入口を一つに集約した',
      '分類と通知だけを先に自動化した',
      '回答送信前の確認者を固定し、ログを残す形にした',
    ],
    outcomes: [
      '担当の振り分けが明確になった',
      '一次整理にかかる工数を減らしつつ、確認責任を残せた',
      '自動化範囲と手動確認範囲をドキュメント化できた',
    ],
    proofLabel: 'AI と人の責任分界',
  },
];

export const faqItems: FAQItem[] = [
  {
    question: '何を相談できますか？',
    answer:
      '学習計画の整理、制作要件の整理、業務フローの可視化と自動化の初期設計まで、課題の切り分け段階から相談できます。',
  },
  {
    question: '費用感はどのように決まりますか？',
    answer:
      '支援頻度、扱う範囲、必要な成果物、レビュー量、運用上の責任範囲で決まります。初回整理後に、必要な支援量に合わせて提案します。',
  },
  {
    question: 'オンラインで相談や進行はできますか？',
    answer:
      'はい。初回整理、定例、レビューの多くはオンラインで対応できます。対面が必要な場合も、まずはオンラインで前提をそろえます。',
  },
  {
    question: 'まだ課題が曖昧でも相談してよいですか？',
    answer:
      '構いません。最初から正確な依頼書は不要です。現状、困りごと、止まりやすい場面の3点があれば、最初の切り分けを始められます。',
  },
  {
    question: 'NDA や権限管理の相談はできますか？',
    answer:
      'Automation を中心に対応しています。資料共有前に必要な条件がある場合も、問い合わせ時点で前提を確認できます。',
    service: 'automation',
  },
  {
    question: '塾や既存の制作チーム、既存ベンダーと併用できますか？',
    answer:
      '可能です。AIYouMe はすべてを置き換える前提ではなく、既存の体制が回りやすくなるように設計します。',
  },
  {
    question: 'VOID-RUSH は本サービスですか？',
    answer:
      'いいえ。VOID-RUSH は labs ドメインで運用する実験コンテンツで、Studio の検証事例としてのみ扱います。',
    service: 'studio',
  },
];

export const profileSummary = {
  title: '運営者の役割と判断基準を公開しています。',
  body:
    'AIYouMe は、課題が固まり切っていない段階から状況を整理し、学習支援・制作支援・業務自動化を「次の行動」と「責任の境界」が見える形に変える運営スタンスを取ります。',
  role:
    '学習支援・制作支援・業務自動化の相談を、整理と実装の両面から支える運営者です。',
  specialties: [
    '課題が曖昧な段階で論点を切り分け、相談対象を明確にする',
    '既存の塾、制作チーム、SaaS を前提に運用を組み直す',
    'AI と人の担当範囲を言語化し、確認ポイントを残す',
  ],
  workingStyle: [
    '最初に必要な情報を絞り、相談の負荷を上げない',
    'できることとできないことを先に言い、期待値のズレを減らす',
    '小さく始めてから改善し、運用が続く形に整える',
  ],
  boundaries: [
    '判断基準なしの丸投げや、短納期だけを優先する依頼には向きません。',
    '機密情報や認証情報の共有は、必要性と条件が決まるまで求めません。',
    '実験系コンテンツは本体ブランドと分け、依頼導線と混同させません。',
  ],
};

export const aboutSummary = {
  title: '相談前に判断できる情報を先に出すための運営方針です。',
  body:
    'AIYouMe は 3 事業を並列に扱いますが、どの相談でも「誰向けか」「何をどこまで持つか」「どこから先は持たないか」を最初に公開することを運営方針にしています。',
  principles: [
    {
      title: '適合条件を先に示す',
      body: '対象者、依頼できること、向いていないケースを先に公開し、問い合わせ前の判断材料を増やします。',
    },
    {
      title: '進め方を隠さない',
      body: '初回整理、提案、実施、振り返りの流れを見せ、何がいつ決まるのかを曖昧にしません。',
    },
    {
      title: 'ブランドと実験を分ける',
      body: 'VOID-RUSH のような実験系は labs に分離し、本体サイトの信頼導線と混同させません。',
    },
  ],
  boundaries: [
    {
      title: '受ける相談',
      body: '学習、制作、業務自動化のいずれでも、課題整理から相談できます。',
    },
    {
      title: '受けない進め方',
      body: '仕様整理なしの即納、責任者不在の本番導入、確認なしの丸投げは前提にしません。',
    },
    {
      title: '既存体制との関わり方',
      body: '塾、制作チーム、既存ベンダーを置き換えるのではなく、併用しながら回る設計を優先します。',
    },
  ],
};

export const termsSummary = {
  sections: [
    {
      title: '提供形態',
      body: 'AIYouMe は相談、伴走、制作、実装支援を案件ごとに合意した範囲で提供します。',
    },
    {
      title: '成果物とレビュー',
      body: '制作物、設計書、運用手順書の有無は契約ごとに定義し、レビュー回数も事前に整理します。',
    },
    {
      title: '守秘と権限',
      body: '案件ごとに NDA、アカウント権限、共有資料の扱いを確認し、必要な範囲のみアクセスします。',
    },
    {
      title: '問い合わせ情報',
      body: '問い合わせフォームから送信された内容は、相談対応と運用改善のために保存されます。',
    },
  ],
};

export const pricingSummary = {
  intro:
    '価格表で煽る代わりに、費用が何で変わるかを先に公開します。AIYouMe の費用感は、支援の量と持つ責任の大きさで決まります。',
  factors: [
    '相談や定例の頻度',
    '整理メモ、設計書、制作物、運用手順書など成果物の有無',
    'レビュー回数とフィードバック整理の量',
    '既存体制との調整や引き継ぎの範囲',
    'セキュリティ、NDA、権限設計に必要な対応',
  ],
  proposalItems: [
    '何を支援対象にするか',
    'いつまでにどこまで進めるか',
    '誰がどの判断を持つか',
    'レビューや連絡をどう回すか',
  ],
};

export const securitySummary = {
  title: '問い合わせ前に確認できるセキュリティと契約の前提',
  commitments: [
    'Cloudflare Workers / D1 を前提に、問い合わせ経路と保存先を明確化します。',
    'Turnstile による bot 対策を実装し、送信経路を first-party 化します。',
    '案件開始時に権限、通知先、保持期間、外部サービス利用を確認します。',
    'labs 系コンテンツは本体ドメインと切り離して運用します。',
  ],
  intake: [
    '問い合わせ時点では、現状、困りごと、連絡先など最小限の情報だけを受け取ります。',
    '機密資料や認証情報の共有は、必要性と手順が決まるまで求めません。',
    '資料共有前に NDA や利用条件の前提が必要な場合は、その段階から確認します。',
  ],
  boundaries: [
    '責任者や権限が未定のまま本番導入だけを急ぐ案件は、そのまま開始しません。',
    '外部サービスを使う場合は、用途と保存先を先に共有したうえで進めます。',
    '相談段階では、本番データ全量の提供を前提にしません。',
  ],
  vendors: [
    'Cloudflare: 配信、Worker 実行、D1 保存',
    'Sanity: CMS 管理',
    'Resend: 問い合わせ通知',
  ],
};

export const homePageContent = {
  seo: {
    title: '学習支援・制作支援・業務自動化の相談窓口',
    description:
      '親や教育関係者、個人・小規模事業者、法人チーム向けに、学習支援・制作支援・業務自動化を状況整理から相談できる AIYouMe のホームページです。',
    ogTitle: 'AIYouMe | 学習支援・制作支援・業務自動化の相談窓口',
    ogDescription:
      '誰向けか、何を頼めるか、進め方、料金方針、セキュリティ、匿名事例を先に公開する AIYouMe のホームページです。',
  },
  hero: {
    eyebrow: 'AIYouMe',
    title: '学習支援・制作支援・業務自動化を、状況整理から相談できます。',
    description:
      '親や教育関係者、個人・小規模事業者、法人チーム向けに、AIYouMe は 3 つの支援を用意しています。課題が言語化できていなくても、現状・困りごと・止まりやすい場面から整理し、次に取る行動を切り分けます。',
    facts: [
      {
        label: '相談できる人',
        value: '受験家庭 / 制作を抱える個人・小規模事業者 / 業務改善を進めたい法人チーム',
      },
      {
        label: '最初に見ること',
        value: '現状、困りごと、直近で止まりやすい場面',
      },
      {
        label: '先に読める情報',
        value: '進め方、料金方針、セキュリティ、匿名事例',
      },
    ],
  } satisfies HomeHero,
  fitCases: [
    {
      title: '学習の計画はあるのに、家庭で回らない',
      body: '志望校や教材はあるが、親子の確認ポイントや週次のペースが崩れているときに向いています。',
      service: 'learning',
    },
    {
      title: '制作の依頼内容が毎回あいまいになる',
      body: '動画、音、構成、公開先の条件が混線し、手戻りが増えているときに有効です。',
      service: 'studio',
    },
    {
      title: '問い合わせや定型業務が人によって変わる',
      body: '誰が判断しているか曖昧で、属人化や手戻りが増えている業務整理に向いています。',
      service: 'automation',
    },
    {
      title: 'どのサービスに当てはまるか分からない',
      body: 'まず状況を整理して、学習支援・制作支援・業務自動化のどこから着手すべきか切り分けたい場合も相談対象です。',
    },
  ] satisfies FitCase[],
  notFitNote:
    '指示や確認なしの丸投げ、短納期だけを優先する依頼、既存体制との調整を一切行わない前提の相談には向きません。',
  serviceHighlights: [
    {
      slug: 'learning',
      label: '学習支援',
      audience: '親・受験生・教育関係者',
      whatWeDo: [
        '目標、残り期間、教材、家庭内の詰まりを整理します。',
        '週次で回る計画と振り返りの方法を設計します。',
      ],
      deliverables: [
        '現状診断メモ',
        '週次計画と振り返りの型',
        '教材・相談導線の整理',
      ],
      notFit: '日々の監視だけを求める場合や、今のやり方を一切見直さない前提には向きません。',
      ctaHref: '/learning',
    },
    {
      slug: 'studio',
      label: '制作支援',
      audience: '個人クリエイター・小規模事業者・発信チーム',
      whatWeDo: [
        '用途、公開先、納期、素材を整理します。',
        '制作フローとレビュー観点を先に決め、手戻りを減らします。',
      ],
      deliverables: [
        '要件整理メモ',
        '構成とレビューの型',
        '納品後も回せるデータ整理',
      ],
      notFit: '要件未確認の即納や、レビューなしで一発納品だけを求める場合には向きません。',
      ctaHref: '/studio',
    },
    {
      slug: 'automation',
      label: '業務自動化',
      audience: '法人チーム・事務局・小規模組織',
      whatWeDo: [
        '属人化した業務フローと判断ポイントを可視化します。',
        'AI、自動化、通知、監査の設計を小さく始めます。',
      ],
      deliverables: [
        '対象業務の整理',
        '自動化フロー案',
        '運用ルールと確認ポイント',
      ],
      notFit: '責任者や権限が未定のまま、本番導入だけを急ぐ案件には向きません。',
      ctaHref: '/automation',
    },
  ] satisfies ServiceHighlight[],
  trustProofs: [
    {
      title: '進め方を公開しています',
      summary: '問い合わせから実施後の振り返りまで、何を確認し、いつ提案するかを先に読めます。',
      proofType: 'process',
      href: '/process',
      hrefLabel: '進め方を見る',
    },
    {
      title: '費用の決まり方を隠しません',
      summary: '価格表で煽る代わりに、費用が何で変わるかを公開しています。',
      proofType: 'policy',
      href: '/pricing',
      hrefLabel: '料金方針を見る',
    },
    {
      title: '対応範囲と向かない依頼を示します',
      summary: '受ける相談、受けない進め方、実験系との線引きを公開し、期待値のズレを減らします。',
      proofType: 'boundary',
      href: '/about',
      hrefLabel: '運営方針を見る',
    },
    {
      title: 'セキュリティと契約の前提を確認できます',
      summary: '問い合わせ時に扱う情報、利用ベンダー、権限や保存の考え方を先に示します。',
      proofType: 'policy',
      href: '/security',
      hrefLabel: 'セキュリティを見る',
    },
    {
      title: '匿名化した事例があります',
      summary: '相談前の状態、対応内容、変化を匿名事例として公開し、支援の実態を判断しやすくします。',
      proofType: 'case-study',
      href: '/case-studies',
      hrefLabel: '事例を見る',
    },
  ] satisfies TrustProof[],
  processSteps: sharedJourneySteps,
  faqPreview: faqItems.slice(0, 4),
  brandSummary: {
    eyebrow: 'Brand Promise',
    title: 'AI / You / Me は、役割分担の約束です。',
    description:
      'ブランド名はロゴの意味を説明するためではなく、AI と人の役割を曖昧にしないための約束として使っています。',
    pillars: siteSettings.brandPillars,
  },
};

export function getServicePage(service: ServiceKey) {
  return servicePages[service];
}

export function getAllServicePages() {
  return Object.values(servicePages);
}

export function getCaseStudy(slug: string) {
  return caseStudies.find((item) => item.slug === slug) ?? null;
}

export function getCaseStudiesByService(service: ServiceKey) {
  return caseStudies.filter((item) => item.service === service);
}
