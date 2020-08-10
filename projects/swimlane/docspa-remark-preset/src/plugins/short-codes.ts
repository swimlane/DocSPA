import visit from 'unist-util-visit';
import * as MDAST from 'mdast';
import * as VFILE from 'vfile';
import * as UNIFIED from 'unified';

export function shortCodeProps(): UNIFIED.Transformer {
  return (tree: MDAST.Root, file: VFILE.VFile) => {
    file.data = file.data || {};
    return visit(tree, 'shortcode', (node: MDAST.Parent) => {
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties = { ...(node.data.hProperties as any), ...(node.attributes as any) };
      return true;
    });
  };
}
