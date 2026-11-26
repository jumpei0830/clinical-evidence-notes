# Clinical Evidence Notes

一次文献・診療ガイドラインに基づく「病態・エビデンス公開リファレンスサイト」です。
Astro による軽量な静的サイト構成で、**1テーマ ＝ 1 Markdown ファイル** を追加するだけで一覧・全文検索・2軸絞り込み・左サイド目次・著者-年方式の参考文献欄が自動生成されます。

## 主な機能
- **トップページ**：キーワード全文検索（記事本文・参考文献まで対象）＋ 2軸絞り込み（領域カテゴリ × 記事タイプタグ）
- **記事詳細ページ**：PC・タブレット左サイド追従目次／スマホ折りたたみ目次、横スクロール対応の比較表、本文中の `(名前, 年)` 引用リンクと `[要一次文献確認]` バッジの自動装飾
- **参考文献セクション**：著者-年方式（アルファベット順リスト）、PubMed / DOI 直接リンク、ワンクリック引用コピー機能（個別・一括）
- **方針ページ**：編集方針・著作権配慮方針・医療免責事項（`/policy`）

## ドキュメント
- **記事作成ルール・テンプレート・AIプロンプト**：[`docs/ARTICLE_RULES.md`](./docs/ARTICLE_RULES.md)
- **Cloudflare Pages 公開・更新マニュアル（初心者向け）**：[`docs/DEPLOY_AND_UPDATE.md`](./docs/DEPLOY_AND_UPDATE.md)

## 主要ファイル構成
- `src/config/site.ts` — サイト名・説明文・標準カテゴリ／タグ設定（1か所で変更可能）
- `src/content/articles/*.md` — 記事 Markdown ファイル（第1号モデル：`hf-cognitive-impairment.md`）
- `src/content.config.ts` — 記事フロントマターのバリデーションスキーマ
- `src/pages/index.astro` — トップページ（検索・絞り込み・一覧）
- `src/pages/articles/[id].astro` — 記事詳細ページ
- `src/pages/policy.astro` — 編集方針・著作権配慮・医療免責事項ページ

## ローカルコマンド
```bash
npm install      # 依存パッケージの導入
npm run dev      # 開発サーバーの起動
npm run build    # 型チェック + 本番静的ファイル生成（出力先: dist/）
npm run preview  # 本番ビルド結果の確認
```
