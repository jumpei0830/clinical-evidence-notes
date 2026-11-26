import { visit } from 'unist-util-visit';

const SKIP_PARENTS = new Set(['code', 'pre', 'a', 'script', 'style']);

// Matches [要一次文献確認] or Vancouver-style numeric citations like [1], [1, 2], [1,2,3]
const TOKEN_REGEX = /(\[要一次文献確認\]|\[\d+(?:\s*[,，]\s*\d+)*\])/g;

function createCitationNodes(rawToken) {
  const inner = rawToken.slice(1, -1);
  const nums = inner.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
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
  return (tree) => {
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

    // 2. Transform [要一次文献確認] badges and numeric Vancouver citations [1]
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;
      if (parent.type === 'element' && SKIP_PARENTS.has(parent.tagName)) return;
      if (!node.value || !TOKEN_REGEX.test(node.value)) return;

      TOKEN_REGEX.lastIndex = 0;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = TOKEN_REGEX.exec(node.value)) !== null) {
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            value: node.value.slice(lastIndex, match.index),
          });
        }

        const token = match[0];
        if (token === '[要一次文献確認]') {
          parts.push(createVerifyBadgeNode());
        } else {
          parts.push(createCitationNodes(token));
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
      if (!node.value || !TOKEN_REGEX.test(node.value)) return;
      TOKEN_REGEX.lastIndex = 0;

      // Split into HTML tags vs text chunks so we never alter tag attributes
      node.value = node.value
        .split(/(<[^>]+>)/g)
        .map((segment) => {
          if (segment.startsWith('<')) return segment;
          return segment.replace(TOKEN_REGEX, (token) => {
            if (token === '[要一次文献確認]') {
              return '<span class="verify-badge" title="一次文献の確認・追記が必要な箇所です">要一次文献確認</span>';
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
