// copy of https://github.com/montogeek/remark-custom-blockquotes with
// https://github.com/montogeek/remark-custom-blockquotes/pull/2 pending merge

import visit from 'unist-util-visit';
import * as MDAST from 'mdast';
import * as UNIFIED from 'unified';

export function customBlockquotes({ mapping }): UNIFIED.Transformer {
  return function transformer(tree: MDAST.Root) {
    return visit(tree, 'paragraph', visitor);

    function visitor(node: MDAST.Paragraph) {
      const { children } = node;
      const textNode = children[0].value as string;

      if (!textNode) {
        return true;
      }

      const idx = textNode.indexOf('>');

      if (idx < 0 || idx > 5) {
        return;
      }

      const substr = textNode.substr(0, idx + 1);
      const className = mapping[substr];

      if (className) {
        node.type = 'paragraph';
        node.data = {
          hName: 'p',
          hProperties: {
            className
          }
        };

        const r = new RegExp(`^\\${substr}\\s`, 'gm');

        visit(node, 'text', (cld: MDAST.Text) => {
          cld.value = cld.value.replace(r, ' ');
          return true;
        });
      }
      return true;
    }
  };
}

export const customBlockquotesOptions = { mapping: {
  '+>': 'note',
  'i>': 'info',
  '!>': 'tip',
  '!!>': 'warn'
}};
