import visit from 'unist-util-visit';
import mdAttrParser from 'md-attr-parser';
import remarkCustomBlocks from 'remark-custom-blocks';

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

const isDangerous = p => DOMEventHandler.indexOf(p) >= 0;

export function infoString() {
  return function(tree) {
    visit(tree, 'code', node => {
      const idx = node.lang ? node.lang.search(/\s/) : -1;
      if (idx > -1) {
        const [lang, _infoString] = node.lang.slice(idx);
        node.infoString = node.lang.slice(idx);
        node.lang = node.lang.slice(0, idx);
      }
    });
  };
}

export function infoStringToAttr() {
  return function(tree) {
    visit(tree, 'code', node => {
      if (node.infoString) {
        const hProperties = mdAttrParser(node.infoString).prop;

        // Delete dangerous
        Object.getOwnPropertyNames(hProperties).forEach(p => {
          if (isDangerous(p)) {
            delete hProperties[p];
          }
        });

        node.data = { ...node.data, hProperties };
      }
    });
  };
}

