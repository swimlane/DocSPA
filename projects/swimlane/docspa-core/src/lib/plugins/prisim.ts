import visit from 'unist-util-visit';
import rangeParser from 'parse-numeric-range';

const Prism = window['Prism'];

export function prism({classPrefix = 'language'} = {}) {
  return function(tree) {
    visit(tree, 'code', visitor);
  };

  function visitor(node, index, parent) {
    let { lang, value } = node;
    const hl = Prism.highlight;
    if (hl) {
      const out = hl(value, Prism.languages[lang] || Prism.languages.markup);
      let escaped = false;
      if (out != null && out !== value) {
        escaped = true;
        value = out;
      }

      value = (escaped ? value : escape(value, true));

      const mark = (node.data && node.data.hProperties && node.data.hProperties.mark) ?
        node.data.hProperties.mark :
        '';
      const lines = rangeParser.parse(mark);

      value = value.split('\n').map((line, i) => {
        // todo: line start
        const c = lines.includes(i + 1) ? 'class="line-highlight"' : '';
        return `<span data-line="${i + 1}" ${c}">${line}</span>`;
      }).join('\n');

      const data = {
        hProperties: {},
        ...node.data,
        hName: 'pre'
      };

      if (!lang) {
        value = `<code>${value}</code>`;
      } else {
        lang = escape(lang, true);
        data.hProperties.class = data.hProperties.class || [];
        if (!Array.isArray(data.hProperties.class)) {
          data.hProperties.class = [data.hProperties.class];
        }
        data.hProperties['data-lang'] = lang;
        data.hProperties.class.push(`${classPrefix}-${lang}`);
        value = `<code>${value}</code>`;
      }

      data.hProperties['v-pre'] = true;  // required for click to copy plugin

      const n = {
        type: 'pre',
        data,
        children: [{
          type: 'html',
          value
        }]
      };

      parent.children.splice(index, 1, n);
      return n;
    }
  }
}

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
