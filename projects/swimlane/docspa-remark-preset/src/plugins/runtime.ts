import visit from 'unist-util-visit';
import VFile from 'vfile';
import { MDAST } from 'mdast';

interface VNode {
  node: MDAST.Code;
  index: number | undefined;
  parent: any;
}

export function runtime(this: any) {
  const processor = this;

  return function(tree, file, next) {
    const items: VNode[] = [];

    visit(tree, 'code', (node: MDAST.Code, index, parent) => {
      items.push({node, index, parent});
      return true;
    });

    const res = items.map(({node, index, parent}) => {
      return visitor(node, index, parent);
    });

    Promise.all(res).then(() => next());

    async function visitor(node, index, parent) {
      const { lang, data } = node;

      if (!data || !data.hProperties) {
        return;
      }

      let { value } = node;
      const { hProperties } = data;

      const isPlayground = 'playground' in hProperties;
      const isRun = 'run' in hProperties;

      if (isRun || isPlayground) {
        const cls = hProperties.class = hProperties.class || (isPlayground ? 'custom-block playground' : '');
        if (lang === 'markdown') {
          const f = new VFile({ ...file, contents: node.value });
          const vfile = await processor.process(f);
          value = vfile.contents;
        } else {
          const context = {
            $page: file.data || {}
          };
          try {
            Object.assign(context, JSON.parse(hProperties.context));
          } catch (e) {
          }
          value = escape(value, true);
          value = `<runtime-content
            template="${value}"
            context="${escape(JSON.stringify(context), true)}">
          </runtime-content>`;
        }

        const newNode = isPlayground ?
          {
          type: 'playgroundCustomBlock',
          data: { hProperties },
          children: [
            {
              type: 'html',
              value
            },
            {
              type: 'html',
              value: '<p></p>'
            },
            {
              type: 'html',
              value: '<details>'
            },
            {
              type: 'html',
              value: '<summary>'
            },
            {
              type: 'text',
              value: `Show ${lang}...`
            },
            {
              type: 'html',
              value: '</summary>'
            },
            node,
            {
              type: 'html',
              value: '</details>'
            }
          ]
        } : {
          type: 'html',
          value,
          data: { hProperties }
        };

        parent.children.splice(index, 1, newNode);
        return node;
      }
    }
  };
}

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
