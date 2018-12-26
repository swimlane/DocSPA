import visit from 'unist-util-visit';
import VFile from 'vfile';
import MDAST from 'mdast';

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
        const type = isPlayground ? 'playgroundCustomBlock' : 'runtimeCustomBlock';

        hProperties.class = hProperties.class || [];
        hProperties.class.push('custom-block');
        hProperties.class.push(isPlayground ? 'playground' : 'runtime');
        if (lang === 'markdown') {
          const f = VFile({ ...file, contents: node.value });
          const v = await processor.process(f);
          value = v.contents;
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

        const newNode = {
          type,
          data: { hProperties },
          children: [
            {
              type: 'html',
              value
            }
          ]
        };

        if (isPlayground) {
          newNode.children = newNode.children.concat([
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
          ]);
        }

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
