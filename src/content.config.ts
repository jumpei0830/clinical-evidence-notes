import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const referenceSchema = z.object({
  /** アンカー用の参照ID（1からの連番） */
  id: z.number().int().positive(),
  /** 本文中引用キー（著者-年方式。例: "Cannon et al., 2017" / "Davis & Allen, 2013"） */
  citeKey: z.string().optional().default(''),
  /** 書誌情報テキスト */
  citation: z.string().min(1),
  /** DOI（例: "10.1093/eurheartj/ehab368"）。未設定・未確認時は空文字または省略 */
  doi: z.string().optional().default(''),
  /** PubMed ID（例: "34447992"）。未設定・未確認時は空文字または省略 */
  pmid: z.string().optional().default(''),
  /** 公式ガイドライン等の直接URL（DOI/PMIDがない場合に使用） */
  url: z.string().optional().default(''),
  /** 補足メモ（例: "要一次文献確認" など） */
  note: z.string().optional().default(''),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    /** 記事タイトル（日本語） */
    title: z.string().min(1),
    /** 英語タイトル（任意） */
    titleEn: z.string().optional().default(''),
    /** 記事一覧・検索結果に表示する簡潔な要約（80〜180文字目安） */
    summary: z.string().min(1),
    /** 領域カテゴリ（1つ以上） */
    categories: z.array(z.string().min(1)).min(1),
    /** 記事タイプタグ（# なしで記載。画面表示時に # が付きます） */
    tags: z.array(z.string().min(1)).min(1),
    /** 対象フェーズ（任意。例: 急性非代償性（ADHF）、慢性安定期など） */
    phase: z.array(z.string().min(1)).optional().default([]),
    /** 最終更新日（YYYY-MM-DD 形式） */
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 形式で入力してください'),
    /** 参照ガイドライン年（任意） */
    guidelineYear: z.string().optional().default(''),
    /** 参照エビデンス種別（例: ガイドライン、システマティックレビュー等） */
    evidenceTypes: z.array(z.string().min(1)).optional().default([]),
    /** 記事ステータス（published: 通常公開、template: レイアウト確認用・一次文献追記前） */
    status: z.enum(['published', 'template']).optional().default('published'),
    /** 参考文献リスト（バンクーバー方式） */
    references: z.array(referenceSchema).optional().default([]),
  }),
});

export const collections = { articles };
