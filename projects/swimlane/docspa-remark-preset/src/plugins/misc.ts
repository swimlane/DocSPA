import visit from 'unist-util-visit';
import mdAttrParser from 'md-attr-parser';
import { Root, Code } from 'mdast';
import { Transformer } from 'unified';

// The list of DOM Event handler
const DOMEventHandler = [
  'onabort', 'onautocomplete', 'onautocompleteerror',
  'onblur', 'oncancel', 'oncanplay',
  'oncanplaythrough', 'onchange', 'onclick',
  'onclose', 'oncontextmenu', 'oncuechange',
  'ondblclick', 'ondrag', 'ondragend',
  'ondragenter', 'ondragexit', 'ondragleave',
  'ondragover', 'ondragstart', 'ondrop',
  'ondurationchange', 'onemptied', 'onended',
  'onerror', 'onfocus', 'oninput',
  'oninvalid', 'onkeydown', 'onkeypress',
  'onkeyup', 'onload', 'onloadeddata',
  'onloadedmetadata', 'onloadstart', 'onmousedown',
  'onmouseenter', 'onmouseleave', 'onmousemove',
  'onmouseout', 'onmouseover', 'onmouseup',
  'onmousewheel', 'onpause', 'onplay',
  'onplaying', 'onprogress', 'onratechange',
  'onreset', 'onresize', 'onscroll',
  'onseeked', 'onseeking', 'onselect',
  'onshow', 'onsort', 'onstalled',
  'onsubmit', 'onsuspend', 'ontimeupdate',
  'ontoggle', 'onvolumechange', 'onwaiting',
];

const isDangerous = (p: string) => DOMEventHandler.indexOf(p) >= 0;

export function infoString(): Transformer {
  return function(tree: Root) {
    return visit(tree, 'code', (node: Code) => {
      const idx = node.lang ? node.lang.search(/\s/) : -1;
      if (idx > -1) {
        // @ts-ignore
        node.infoString = node.lang.slice(idx);
        node.lang = (node.lang || '').slice(0, idx);
      }
      return true;
    });
  };
}

export function infoStringToAttr() {
  return function(tree: Root) {
    visit(tree, 'code', (node: Code) => {
      // @ts-ignore
      if (node.infoString) {
        // @ts-ignore
        const info = encode(node.infoString);
        const hProperties = mdAttrParser(info).prop;

        // Delete dangerous, decode
        Object.getOwnPropertyNames(hProperties).forEach(p => {
          if (isDangerous(p)) {
            delete hProperties[p];
          } else if (typeof hProperties[p] === 'string') {
            hProperties[p] = decode(hProperties[p]);
          }
        });
        node.data = { ...node.data, hProperties };
      }
      return true;
    });
  };
}

const SALT = '%RUNTIME-ENCODE%';

function encode(text: string) {
  const start = text.indexOf('{') + 1;
  const end = text.lastIndexOf('}');
  text = text.slice(start, end);
  return text
    .replace('{', `${SALT}-%7B`)
    .replace('}', `${SALT}-%7D`);
}

function decode(text: string) {
  return text
    .replace(`${SALT}-%7B`, '{')
    .replace(`${SALT}-%7D`, '}');
}
