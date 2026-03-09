# Antigravity用 UI/UX刷新プロンプト

以下をそのまま Antigravity に入力して使ってください。

```text
あなたはサービスサイトのCV最適化に強いシニアプロダクトデザイナー兼フロントエンドデザイナーです。
既存サイト（Astro静的）を、見た目と導線を整理しながら刷新してください。

## 目的
- 最重要CV: 初回相談への着手
- 対象:
  - Learning: 中高生本人 + 保護者
  - Studio: 制作相談をしたい個人 / 小規模チーム
  - Automation: 法人担当者
- 成果指標: `/learning` への遷移率、LINEクリック率、問い合わせ着手率

## ブランド体系（固定）
- ホーム: AIYouMe
- 学習: AIYouMe Learning
- 制作: AIYouMe Studio
- 法人AI: AIYouMe Automation
- ドメイン: https://ai-yu-me.com

## 必須要件
1. サイト構成は維持:
   - /
   - /learning
   - /studio
   - /automation
   - /privacy
   - /contact
2. `/learning` を最も分かりやすい導線にする
3. 誇大広告禁止
4. 問い合わせ導線は LINE / 予約ページ / メールを使い分ける
5. モバイルでの可読性・タップ導線を最優先
6. `/creator/void-rush/` は Studio 配下の実験コンテンツとして扱う

## 期待する情報設計
- ホーム: ブランド理解 → 3事業分岐 → 初回相談
- Learning: 不安の言語化 → 進め方 → プラン → FAQ → CTA
- Studio: 対応領域 → 進め方 → 実験/記事導線 → CTA
- Automation: 課題整理 → 支援領域 → 導入フロー → CTA

## 実装制約
- Astro + TypeScript + CSS（Tailwind不要）
- `src/config.ts` の値参照を維持
- SEO項目（title/description/OG/canonical）を壊さない
- legacy route の `/education` `/creator` は移行ページとして扱う

## 出力してほしいもの
1. 新UIのデザインコンセプト
2. 画面別の改善ポイント（/ /learning /studio /automation）
3. 実装差分（ファイル単位）
4. 主要CTA導線の改善理由
5. モバイル時の挙動説明

## コピーのトーン
- 煽りすぎない
- 不安を先に受け止める
- 「権威」ではなく「運用の再現性」で信頼を作る
```
