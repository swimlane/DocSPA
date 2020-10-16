import visit from 'unist-util-visit';
import rangeParser from 'parse-numeric-range';
import Prism from 'prismjs';

import { Parent } from 'unist';
import { Transformer } from 'unified';
import { Code, Root } from 'mdast';

import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-c';

const ctx =
  typeof window === 'undefined'
    ? typeof self === 'undefined'
      ? {}
      : self
    : window;

if (ctx['Prism']) {
  document.removeEventListener('DOMContentLoaded', ctx['Prism'].highlightAll);
}

export function prism({classPrefix = 'language'} = {}): Transformer {
  return (tree: Root) => visit(tree, 'code', visitor);

  function visitor(node: Code, index: number, parent: Parent) {
    let { lang, value } = node;
    const hl = Prism.highlight;
    if (hl) {
      const data = {
        hProperties: {} as { [key: string]: any},
        ...node.data,
        hName: 'pre'
      };

      let prismLang = Prism.languages[lang] || Prism.languages['markup'];

      // If attr of diff is added, combine languages
      if ('diff' in data.hProperties) {
        lang = 'diff' + (lang || 'markup');
        prismLang = Prism.languages[lang] = Prism.languages[lang] || Prism.languages.extend('diff', prismLang);
      }

      let escaped = false;
      const out = hl(value, prismLang, lang);
      if (out != null && out !== value) {
        escaped = true;
        value = out;
      }

      value = (escaped ? value : escape(value, true));

      const lines = rangeParser(data.hProperties.mark || '');

      value = value.split('\n').map((line, i) => {
        // todo: line start
        const c = lines.includes(i + 1) ? 'class="line-highlight"' : '';
        return `<span data-line="${i + 1}" ${c}>${line}</span>`;
      }).join('\n');

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
    }
    return true;
  }
}

function escape(html: string, encode: boolean) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
