import { defineConfig } from 'astro/config';
import rehypeClinicalEnhance from './src/utils/rehype-clinical-enhance.mjs';

export default defineConfig({
  output: 'static',
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
    rehypePlugins: [rehypeClinicalEnhance],
  },
  build: {
    assets: '_astro',
  },
});
