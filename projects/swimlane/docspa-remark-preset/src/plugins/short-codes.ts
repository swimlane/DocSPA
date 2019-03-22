import visit from 'unist-util-visit';
import MDAST from 'mdast';
import VFILE from 'vfile';
import UNIFIED from 'unified';

export function shortCodeProps(): UNIFIED.Transformer {
  return (tree: MDAST.Root, file: VFILE.VFile) => {
    file.data = file.data || {};
    return visit(tree, 'shortcode', (node: MDAST.Parent) => {
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};
      node.data.hProperties = { ...node.data.hProperties, ...node.attributes };
      return true;
    });
  };
}
