import visit from 'unist-util-visit';

import type { VFile } from '../../../shared/vfile';

export function sectionPlugin() {
  return (tree: any, vfile: VFile) => {
    vfile.data = vfile.data || {};
    vfile.data.sections = [];

    return visit(tree, 'section', (node: any, _index: number, _parent: any) => {
      const hnode = node.children.shift();

      const id = hnode.data.id;
      const heading = toString(hnode);
      const name = (vfile.data.matter ? vfile.data.matter.title : false) || vfile.data.title || vfile.path;

      // Get child text, removing subsections
      // TODO: improve this to reduce noise in matches
      const text = node.children.filter(c => c.type !== 'section').map(toString).join(' ');
      const source = vfile.history[0];

      vfile.data.sections.push({
        id,
        text,
        heading,
        source,
        name,
        depth: node.depth
      });

      return true;
    });
  };
}

// Basicly mdast-util-to-string with a space
function toString(node: any) {
  return (
    (node &&
      (node.value ||
        node.alt ||
        node.title ||
        ('children' in node && all(node.children)) ||
        ('length' in node && all(node)))) ||
    ''
  );
}

function all(values: any) {
  const result = [];
  const length = values.length;
  let index = -1;

  while (++index < length) {
    result[index] = toString(values[index]);
  }

  return result.join(' ');
}
