import visit from 'unist-util-visit';

/**
 * Convert [[toc]] smart-code to a TOC
 * Must be included after remark-shortcodes
 */
export const tocSmartCode = () => {
  return (tree, file) => {
    file.data = file.data || {};
    visit(tree, 'shortcode', (node, index, parent) => {
      if (node.identifier === 'toc') {
        const newNode = {
          type: 'html',
          value: `<md-toc path="${file.data.base}"></md-toc>`
        };
        parent.children.splice(index, 1, newNode);
      }
    });
  };
};
