import visit from 'unist-util-visit';
import { MDAST } from 'mdast';
import { UNIST } from 'unist';

interface ShortCode extends UNIST.Parent {
  type: 'shortcode';
  identifier: string;
  attributes: { [key: string]: any };
}

/**
 * Convert [[toc]] smart-code to a TOC
 * Must be included after remark-shortcodes but before customSmartCodes
 */
export const tocSmartCode = () => {
  return (tree, file) => {
    file.data = file.data || {};
    visit(tree, 'shortcode', (node: ShortCode) => {
      if (node.identifier === 'toc') {
        node.attributes.path = node.attributes.path || file.data.base;
      }
      return true;
    });
  };
};

export const customSmartCodes = (codes) => {
  return (tree, file) => {
    file.data = file.data || {};
    visit(tree, 'shortcode', (node: ShortCode, index, parent) => {
      if (node && parent && index !== undefined && node.identifier in codes) {
        const child = {
          type: 'element',
          ...codes[node.identifier]
        };
        child.properties = {...(child.properties || {}), ...(node.data ? node.data.hProperties : {}) };
        const newNode = {
          type: node.identifier,
          data: { hChildren: [child] }
        };
        parent.children.splice(index, 1, newNode);
      }
      return true;
    });
  };
};

export const shortCodeProps = () => {
  return (tree, file) => {
    file.data = file.data || {};
    visit(tree, 'shortcode', (node: ShortCode) => {
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties = { ...node.data.hProperties, ...node.attributes };
      return true;
    });
  };
};

export const customSmartCodesOptions = {
  toc: {
    tagName: 'md-toc'
  },
  include: {
    tagName: 'md-embed'
  },
  var: {
    tagName: 'env-var'
  },
  stackblitz: {
    tagName: 'embed-stackblitz'
  }
};
