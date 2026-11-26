import { visit } from 'unist-util-visit';

const SKIP_PARENTS = new Set(['code', 'pre', 'a', 'script', 'style']);

// Matches [要一次文献確認] or legacy numeric citations like [1], [1, 2]
const BASE_TOKEN_PATTERN = '\\[要一次文献確認\\]|\\[\\d+(?:\\s*[,，]\\s*\\d+)*\\]';

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildAuthorKeyMap(file) {
  const refs = file?.data?.astro?.frontmatter?.references;
  const map = new Map();
  if (!Array.isArray(refs)) return map;

  for (const ref of refs) {
    if (ref && typeof ref.citeKey === 'string' && ref.citeKey.trim()) {
      map.set(ref.citeKey.trim(), String(ref.id));
    }
  }
  return map;
}

function buildCombinedRegex(authorKeyMap) {
  const keys = Array.from(authorKeyMap.keys()).sort((a, b) => b.length - a.length);
  if (keys.length === 0) {
    return new RegExp(`(${BASE_TOKEN_PATTERN})`, 'g');
  }
  const keyPattern = keys.map(escapeRegExp).join('|');
  return new RegExp(`(${BASE_TOKEN_PATTERN}|${keyPattern})`, 'g');
}

function createNumericCitationNodes(rawToken) {
  const inner = rawToken.slice(1, -1);
  const nums = inner
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const children = [{ type: 'text', value: '[' }];

  nums.forEach((num, idx) => {
    if (idx > 0) {
      children.push({ type: 'text', value: ', ' });
    }
    children.push({
      type: 'element',
      tagName: 'a',
      properties: {
        href: `#ref-${num}`,
        className: ['cite-link'],
        'data-ref-id': num,
        ariaLabel: `参考文献 ${num} へ移動`,
      },
      children: [{ type: 'text', value: num }],
    });
  });

  children.push({ type: 'text', value: ']' });

  return {
    type: 'element',
    tagName: 'sup',
    properties: { className: ['cite-sup'] },
    children,
  };
}

function createAuthorCitationNode(citeKey, refId) {
  return {
    type: 'element',
    tagName: 'a',
    properties: {
      href: `#ref-${refId}`,
      className: ['cite-link', 'cite-author-link'],
      'data-ref-id': refId,
      ariaLabel: `参考文献 ${citeKey} へ移動`,
    },
    children: [{ type: 'text', value: citeKey }],
  };
}

function createVerifyBadgeNode() {
  return {
    type: 'element',
    tagName: 'span',
    properties: {
      className: ['verify-badge'],
      title: '一次文献の確認・追記が必要な箇所です',
    },
    children: [{ type: 'text', value: '要一次文献確認' }],
  };
}

export default function rehypeClinicalEnhance() {
  return (tree, file) => {
    const authorKeyMap = buildAuthorKeyMap(file);
    const tokenRegex = buildCombinedRegex(authorKeyMap);

    // 1. Wrap <table> elements for horizontal scrolling on narrow screens
    visit(tree, 'element', (node, index, parent) => {
      if (
        node.tagName === 'table' &&
        parent &&
        typeof index === 'number' &&
        !(
          parent.type === 'element' &&
          parent.tagName === 'div' &&
          Array.isArray(parent.properties?.className) &&
          parent.properties.className.includes('table-scroll')
        )
      ) {
        parent.children[index] = {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['table-scroll'],
            tabIndex: 0,
            role: 'region',
            ariaLabel: '横スクロール可能な表',
          },
          children: [node],
        };
      }
    });

    // 2. Transform [要一次文献確認] badges, Author-Year citations, and legacy [1] citations in text nodes
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      if (parent.type === 'element' && SKIP_PARENTS.has(parent.tagName)) return;
      if (!node.value) return;

      tokenRegex.lastIndex = 0;
      if (!tokenRegex.test(node.value)) return;
      tokenRegex.lastIndex = 0;

      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = tokenRegex.exec(node.value)) !== null) {
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            value: node.value.slice(lastIndex, match.index),
          });
        }

        const token = match[0];
        if (token === '[要一次文献確認]') {
          parts.push(createVerifyBadgeNode());
        } else if (authorKeyMap.has(token)) {
          parts.push(createAuthorCitationNode(token, authorKeyMap.get(token)));
        } else {
          parts.push(createNumericCitationNodes(token));
        }

        lastIndex = match.index + token.length;
      }

      if (lastIndex < node.value.length) {
        parts.push({
          type: 'text',
          value: node.value.slice(lastIndex),
        });
      }

      if (parts.length > 0) {
        parent.children.splice(index, 1, ...parts);
        return index + parts.length;
      }
    });

    // 3. Also transform tokens inside raw HTML blocks (e.g., .summary-box, .flow-diagram, .clinical-split)
    visit(tree, 'raw', (node) => {
      if (!node.value) return;
      tokenRegex.lastIndex = 0;
      if (!tokenRegex.test(node.value)) return;
      tokenRegex.lastIndex = 0;

      node.value = node.value
        .split(/(<[^>]+>)/g)
        .map((segment) => {
          if (segment.startsWith('<')) return segment;
          tokenRegex.lastIndex = 0;
          return segment.replace(tokenRegex, (token) => {
            if (token === '[要一次文献確認]') {
              return '<span class="verify-badge" title="一次文献の確認・追記が必要な箇所です">要一次文献確認</span>';
            }
            if (authorKeyMap.has(token)) {
              const refId = authorKeyMap.get(token);
              return `<a href="#ref-${refId}" class="cite-link cite-author-link" data-ref-id="${refId}" aria-label="参考文献 ${token} へ移動">${token}</a>`;
            }
            const nums = token
              .slice(1, -1)
              .split(/[,，]/)
              .map((s) => s.trim())
              .filter(Boolean);
            const links = nums
              .map(
                (num) =>
                  `<a href="#ref-${num}" class="cite-link" data-ref-id="${num}" aria-label="参考文献 ${num} へ移動">${num}</a>`
              )
              .join(', ');
            return `<sup class="cite-sup">[${links}]</sup>`;
          });
        })
        .join('');
    });
  };
}
