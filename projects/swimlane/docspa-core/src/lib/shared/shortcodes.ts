import visit from 'unist-util-visit';

import * as MDAST from 'mdast';
import * as VFILE from 'vfile';
import * as  UNIFIED from 'unified';

interface Codes {
  [key: string]: {
    tagName: string;
  };
}

interface ShortCode extends MDAST.Parent {
  type: 'shortcode';
  identifier: string;
  attributes: { [key: string]: any };
}

interface VFile extends VFILE.VFile {
  data: {
    base?: string;
  };
}

export const customSmartCodes = (codes: Codes[]): UNIFIED.Transformer => {
  // @ts-ignore
  return (tree: MDAST.Root, file: VFILE.VFile) => {
    file.data = file.data || {};
    return visit(tree, 'shortcode', (node: ShortCode, index: number, parent: MDAST.Parent) => {
      if (node && parent && index !== undefined && node.identifier in codes) {
        const child = {
          type: 'element',
          ...codes[node.identifier]
        };
        child.properties = {...(child.properties || {}), ...(node.data ? node.data.hProperties : {} as any) };
        const newNode = {
          type: node.identifier,
          data: { hChildren: [child] }
        };
        parent.children.splice(index, 1, newNode as any);
      }
      return true;
    });
  };
};
