// copy of https://github.com/montogeek/remark-custom-blockquotes with
// https://github.com/montogeek/remark-custom-blockquotes/pull/2 pending merge

import visit from 'unist-util-visit';
import { MDAST } from 'mdast';

export function customBlockquotes({ mapping }) {
  return function transformer(tree) {
    visit(tree, 'paragraph', visitor);

    function visitor(node: any) {
      const { children } = node;
      const textNode = children[0].value;

      if (!textNode) {
        return true;
      }

      const substr = textNode.substr(0, 2);
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

        visit(node, 'text', (cld: MDAST.TextNode) => {
          cld.value = cld.value.replace(r, ' ');
          return true;
        });
      }
      return true;
    }
  };
}

export const customBlockquotesOptions = { mapping: {
  'i>': 'info',
  '!>': 'tip',
  '?>': 'warn',
  '->': 'box',
  '<>': 'box-left'
}};
