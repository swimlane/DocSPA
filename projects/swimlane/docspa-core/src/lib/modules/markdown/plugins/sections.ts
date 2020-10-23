import visit from 'unist-util-visit';

import type { VFile } from '../../../vendor';

export function sectionPlugin() {
  return (tree: any, vfile: VFile) => {
    vfile.data = vfile.data || {};
    vfile.data.sections = [];

    return visit(tree, 'section', (node: any, index: number, parent: any) => {
      const hnode = node.children.shift();
      const id = hnode.data.id;
      const heading = toString(hnode);

      // Get chilt text, removing subsections
      const text = node.children.filter(c => c.type !== 'section').map(toString).join(' ');
      const source = vfile.history[0];

      vfile.data.sections.push({
        id,
        text,
        heading,
        source
      });

      return true;
    });
  };
}

// Basicly mdast-util-to-string' with a space
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
