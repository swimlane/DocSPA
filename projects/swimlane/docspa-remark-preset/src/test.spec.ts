const remark = require('remark');
const html = require('remark-html');
const { docspaRemarkPreset } = require('./');

const processor = remark()
  .use(docspaRemarkPreset)
  .use(html);

const contents = `
---
title: Hello
---

## Hello World!

$$
L = \\frac{1}{2} \\rho v^2 S C_L
$$

:smile: :+1:

~~~js { #test }
function() {};
~~~

[[info]]
| Info block

!> Note

[[ shortcode class="test" ]]

[[toc]]
`;

describe('remark-presets', () => {
  let err = '';
  let vfile: any;
  let out = '';

  beforeEach((done) => {
    const file = { contents, data: { base: 'testBasePath' } };
    processor.process(file, (_err: any, _vfile: any) => {
      err = err;
      vfile = _vfile;
      out = String(_vfile);
      done();
    });
  });

  it('headings should have slug and link', () => {
    expect(out)
    .toContain(
      `<h2 id="hello-world">Hello World!<a href="#hello-world" aria-hidden="true"><span class="icon icon-link"></span></a></h2>`
    );
  });

  it('get front matter', () => {
    expect(vfile.data.matter).toEqual({title: 'Hello'});
  });

  it('process math', () => {
    expect(out).toContain(`<span class="katex-display">`);
  });

  it('process emoji', () => {
    expect(out)
      .toContain(`<img src="https://assets-cdn.github.com/images/icons/emoji/smile.png"`);
    expect(out)
      .toContain(`<img src="https://assets-cdn.github.com/images/icons/emoji/+1.png"`);
  });

  it('process info string as attr', () => {
    expect(out).toContain(`<code class="language-js" id="test">function() {};`);
  });

  it('process custom block quotes', () => {
    expect(out).toContain(`<blockquote class="tip">\n Note\n</blockquote>`);
  });

  it('process custom block quotes', () => {
    expect(out).toContain(`<md-toc path="testBasePath"></md-toc>`);
  });
});
