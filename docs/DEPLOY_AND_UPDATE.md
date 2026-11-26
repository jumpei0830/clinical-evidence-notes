# はじめての公開・更新マニュアル（Cloudflare Pages 編）

このマニュアルは、**プログラミング経験がほとんどない方でも迷わずサイトを公開し、これから記事を増やしていけるように**、手順をかみ砕いてまとめたガイドです。

---

## 1. サイト公開のしくみ（ざっくり全体像）

このサイトは、次の3つのステップで自動的にインターネットへ公開されます。

```text
[1] 記事（Markdownファイル）を準備する（AIに作ってもらう）
        ↓
[2] GitHub（ファイルを置いておくクラウド上の保管庫）に保存する
        ↓
[3] Cloudflare Pages が自動で変更を検知し、数分でWebサイトに反映！
```

- **GitHub（ギットハブ）**：サイトの設計図と記事ファイルを保管しておく無料のクラウドフォルダのようなものです。
- **Cloudflare Pages（クラウドフレア ページズ）**：GitHub に置いたファイルをもとに、自動でホームページを組み立てて世界中に公開してくれる無料サービスです。
- **一度つないでおけば**、次回からは GitHub に新しい記事ファイルを1つ置くだけで、自動的にサイトが更新されます。

---

## 2. 初回公開の手順（最初だけ行います）

所要時間の目安：**15〜20分ほど**です（すべて無料プランで完結します）。

### ステップ 1：GitHub のアカウントと保管庫（リポジトリ）を作る
1. [GitHub（https://github.com）](https://github.com) にアクセスし、無料アカウントを作成します（すでにお持ちならログイン）。
2. 画面右上の **`+`** ボタン → **`New repository`**（新しい保管庫を作成）をクリックします。
3. 次のように入力します：
   - **Repository name**（保管庫の名前）：`clinical-evidence-notes` など分かりやすい半角英数字
   - **Public / Private**（公開設定）：どちらでも Cloudflare Pages と連携できます（コードを見せたくない場合は **Private** でもOKです）
   - 他のチェックボックスはそのまま空欄で大丈夫です。
4. 緑色の **`Create repository`** ボタンを押します。

### ステップ 2：サイト一式のファイルを GitHub にアップロードする
作成した保管庫に、このプロジェクトのファイル一式を入れます。方法は2つあります。

#### 方法 A：パソコンの画面（GitHub ブラウザまたは GitHub Desktop）からアップロードする（初心者におすすめ）
- **GitHub Desktop**（無料アプリ）を使うと、ドラッグ＆ドロップ感覚で一括アップロードと今後の更新ができて便利です。
  1. [GitHub Desktop](https://desktop.github.com/) をインストールして GitHub アカウントでログイン。
  2. このプロジェクトフォルダ（`clinical-evidence-notes`）をリポジトリとして追加し、**`Publish repository`** をクリックします。
- ※ブラウザの `uploading an existing file` を使う場合は、`node_modules` フォルダと `dist` フォルダは**アップロード不要**です（Cloudflare 側で自動生成されるため）。

#### 方法 B：コマンドで送る場合（ターミナルが使える場合）
プロジェクトのフォルダ内で次のコマンドを実行します（`あなたのID` はご自身の GitHub ユーザー名に置き換えてください）。

```bash
git remote add origin https://github.com/あなたのID/clinical-evidence-notes.git
git branch -M main
git push -u origin main
```

### ステップ 3：Cloudflare Pages と連携して公開する
1. [Cloudflare（https://dash.cloudflare.com）](https://dash.cloudflare.com) にアクセスし、無料アカウントを作成・ログインします。
2. 左側メニューから **`Workers & Pages`**（または **`Compute (Workers)` → `Workers & Pages`**）を開き、**`Create`**（作成）→ **`Pages`** タブ → **`Connect to Git`**（Git に接続）をクリックします。
3. **GitHub** を選び、先ほど作成したリポジトリ（`clinical-evidence-notes`）を選択して **`Begin setup`** を押します。
4. **Build settings（ビルド設定）** を以下のように入力します（ここが一番大事な設定です）：

| 設定項目 | 入力する値 | 補足 |
| --- | --- | --- |
| **Project name** | `clinical-evidence-notes` など | 公開URL（`〇〇.pages.dev`）になります |
| **Production branch** | `main` | そのままでOK |
| **Framework preset** | `Astro` | 一覧から `Astro` を選ぶと自動入力されます |
| **Build command** | `npm run build` | 型チェック込みで安全に組み立てます |
| **Build output directory** | `dist` | 組み立てたHTMLが出力されるフォルダ |

5. 念のため **Environment variables（環境変数）** を開き、次を1行追加しておくと確実です（プロジェクト内の `.node-version` でも指定していますが、両方あるとより安全です）：
   - Variable name：`NODE_VERSION`
   - Value：`22`
6. 画面下の **`Save and Deploy`**（保存してデプロイ）ボタンをクリックします。
7. 1〜2分ほど待つと「Success!」と表示され、`https://clinical-evidence-notes.pages.dev` のような公開URLが発行されます！スマホやPCからアクセスして表示を確認してみてください。

---

## 3. 今後の記事追加・更新手順（日々の運用）

サイト公開後、調べたテーマの記事を追加したり、既存記事に一次文献を追記したりする手順です。**パソコンに開発環境を入れなくても、ブラウザだけで完結できます。**

### 流れ（3ステップ）
1. **AI に記事 Markdown を作ってもらう**
   - 新しい会話で `docs/ARTICLE_RULES.md` の「6. 記事追加用 AI プロンプト」を使い、手元の一次文献（論文の書誌情報・DOI・PMID・要旨・メモ）を渡します。
   - AI が出力した Markdown テキストの内容（数値・引用番号・`[要一次文献確認]` の有無）を目視で確認します。
2. **GitHub の画面から記事ファイルを保存する**
   - **新しい記事を追加する場合**：
     1. GitHub で自分のリポジトリを開き、`src` → `content` → `articles` フォルダへ移動します。
     2. 右上の **`Add file`** → **`Create new file`** をクリックします。
     3. ファイル名欄に `テーマ名.md`（例：`copd-cognitive-function.md` のように半角英小文字とハイフン）と入力します。
     4. 本文欄に AI が作った Markdown をまるごと貼り付けます。
     5. 右上の緑色ボタン **`Commit changes...`** を押し、確認画面でも **`Commit changes`** を押します。
   - **すでにある記事（例：第1号記事 `hf-cognitive-impairment.md`）に一次文献を追記・修正する場合**：
     1. `src/content/articles/hf-cognitive-impairment.md` を開きます。
     2. 右上の **鉛筆マーク（Edit this file）** をクリックします。
     3. 内容を書き換えます（一次文献を反映し終えたら、先頭付近の `status: "template"` を `status: "published"` に変更してください）。
     4. 右上の **`Commit changes...`** → **`Commit changes`** を押します。
3. **自動反映を待つ（1〜2分）**
   - GitHub に保存した瞬間、Cloudflare Pages が自動で新しい記事を読み込み、一覧・全文検索・目次・参考文献リンクまですべて自動で更新してくれます。

---

## 4. サイト名や説明文を変更したいとき

サイト名（仮称：`Clinical Evidence Notes`）や説明文・カテゴリ一覧を変更したい場合は、**1つのファイルだけ**編集すればサイト全体に反映されます。

1. GitHub で `src/config/site.ts` を開きます。
2. 右上の **鉛筆マーク（Edit this file）** をクリックします。
3. `name: 'Clinical Evidence Notes'` の `'...'` の中を好きなサイト名に書き換えます（説明文やカテゴリも日本語コメントに沿って編集できます）。
4. **`Commit changes`** を押すと、1〜2分で反映されます。

---

## 5. よくあるつまずきと対処法

### Q1. 記事を追加したのにサイトが更新されず、Cloudflare Pages でエラー（Failed）になった
ほとんどの場合、記事ファイルの先頭（`---` で囲まれたフロントマター部分）の書き方ミスが原因です。次を確認してください：
- `updatedAt` が `"2026-11-26"` のように **YYYY-MM-DD**（半角・ハイフン区切り）になっているか
- タイトルや引用文の中に `:`（コロン）が含まれる場合、文章全体を `"`（ダブルクォーテーション）で囲っているか
- `categories` や `tags` の前の半角スペース（インデント）がずれていないか
- `references` の `id` が数字（`1`, `2`, ...）になっているか

※エラーの詳細は Cloudflare Pages の管理画面 → 該当デプロイの **`View details`** に赤字で表示されます。そのエラー文をそのまま AI に貼り付ければ、どこを直せばよいかすぐに教えてもらえます。

### Q2. 独自ドメイン（例：`evidence.example.com`）を使いたい
Cloudflare Pages のプロジェクト画面 → **`Custom domains`** タブから、お持ちの独自ドメインを無料で設定できます。最初は無料の `〇〇.pages.dev` のまま始めて、あとから追加することも可能です。

### Q3. 公開前に自分のパソコンで見た目を確認したい（任意）
パソコンに Node.js が入っている場合は、プロジェクトのフォルダで次を実行すると手元でプレビューできます。

```bash
npm install
npm run dev
```
