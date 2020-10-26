import visit from 'unist-util-visit';

import type * as mdast from 'mdast';
import type * as  unified from 'unified';

import type { VFile } from './vfile';
import type { Codes, ShortCode } from './ast';

export const customSmartCodes = (codes: Codes[]): unified.Transformer => {
  // @ts-ignore
  return (tree: mdast.Root, file: VFile) => {
    file.data = file.data || {};
    return visit(tree, 'shortcode', (node: ShortCode, index: number, parent: mdast.Parent) => {
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
