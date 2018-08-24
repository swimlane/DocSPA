import { expect } from 'chai';
import stripIndent from 'common-tags/lib/stripIndent';

const remark = require('remark');
const html = require('remark-html');
const { docspaRemarkPreset } = require('./');

const processor = remark()
  .use(docspaRemarkPreset)
  .use(html);

describe('3rd party', () => {
  it('remark-slug', async () => {
    const contents = '## Hello World!';
    const vfile = await processor.process(contents);
    expect(String(vfile)).to
      .contain(`<a href="#hello-world" aria-hidden="true"><span class="icon icon-link"></span></a>`);
  });

  it('remark-autolink-headings', async () => {
    const contents = '## Hello World!';
    const vfile = await processor.process(contents);
    expect(String(vfile)).to
      .contain(`id="hello-world`);
  });

  it('remark-math', async () => {
    const contents = stripIndent`
      $$
      L = \\frac{1}{2} \\rho v^2 S C_L
      $$`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).to.contain(`<div class="math">`);
  });

  it('remark-html-katex', async () => {
    const contents = stripIndent`
      $$
      L = \\frac{1}{2} \\rho v^2 S C_L
      $$`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).to.contain(`<span class="katex-display">`);
  });

  it('remark-gemoji-to-emoji, remark-html-emoji-image', async () => {
    const contents = `:smile: :+1:`;
    const vfile = await processor.process(contents);
    const out = String(vfile);
    expect(out)
      .to.contain(`<img src="https://assets-cdn.github.com/images/icons/emoji/smile.png"`);
    expect(out)
      .to.contain(`<img src="https://assets-cdn.github.com/images/icons/emoji/+1.png"`);
  });

  it('remark-custom-blocks', async () => {
    const contents = stripIndent`
    [[note]]
    | Note
    `;
    const vfile = await processor.process(contents);
    expect(String(vfile)).to.contain(`<div class="custom-block notice note"><div class="custom-block-body"><p>Note</p></div></div>`);
  });

  it('remark-custom-blockquotes', async () => {
    const contents = `!> Note`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).to.contain(`<blockquote class="tip">\n Note\n</blockquote>`);
  });

  it('remark-attr', async () => {
    const contents = `*bold*{ .bold }`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).to.contain(`<p><em class="bold">bold</em></p>`);
  });

  it('remark-shortcodes', async () => {
    const contents = `[[ shortcode ]]`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).to.contain(`<div></div>`);
  });
});

describe('internal', () => {
  it('remark-frontmatter, remark-parse-yaml, readMatter', async () => {
    const contents = stripIndent`
      ---
      title: Hello
      ---`;
    const vfile = await processor.process(contents);
    expect(vfile.data.matter).to.deep.equal({title: 'Hello'});
  });

  it('infoStringToAttr', async () => {
    const contents = stripIndent`
      ~~~js { #test }
      function() {};
      ~~~`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).to.contain(`<code class="language-js" id="test">function() {};`);
  });

  it('tocSmartCode', async () => {
    const contents = `[[toc class="collapsable"]]`;
    const file = { contents, data: { base: 'testBasePath' } };
    const vfile = await processor.process(file);
    expect(String(vfile)).to.contain(`<md-toc path="testBasePath" class="collapsable"></md-toc>`);
  });

  it('smartCodeProps', async () => {
    const contents = `[[ shortcode class="test-shortcode-class" ]]`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).to.contain(`<div class="test-shortcode-class"></div>`);
  });

  /* it('runtime, html', async () => {
    const contents = stripIndent`
    ~~~html { run }
    function() {};
    ~~~`;
    const vfile = await processor.process(contents);
    const out = String(vfile);
    expect(out).to.not.contain(`<div class="custom-block playground">`);
    expect(out).to.contain(`<runtime-content`);
    expect(out).to.contain(`template="function() {};"`);
  });

  it('runtime, html, playground', async () => {
    const contents = stripIndent`
    ~~~html { playground }
    function() {};
    ~~~`;
    const vfile = await processor.process(contents);
    const out = String(vfile);
    expect(out).to.contain(`<div class="custom-block playground">`);
    expect(out).to.contain(`<runtime-content`);
    expect(out).to.contain(`template="function() {};"`);
  });

  it('runtime, markdown', async () => {
    const contents = stripIndent`
    ~~~markdown { run }
    **Hello**
    ~~~`;
    const vfile = await processor.process(contents);
    const out = String(vfile);
    expect(out).to.not.contain(`<div class="custom-block playground">`);
    expect(out).to.contain(`<p><strong>Hello</strong></p>\n`);
  });

  it('runtime, markdown, playground', async () => {
    const contents = stripIndent`
    ~~~markdown { playground }
    **Hello**
    ~~~`;
    const vfile = await processor.process(contents);
    const out = String(vfile);
    expect(out).to.contain(`<div class="custom-block playground">`);
    expect(out).to.contain(`<p><strong>Hello</strong></p>\n`);
  }); */

  it('mermaid', async () => {
    const contents = stripIndent`
    ~~~mermaid
    **Hello**
    ~~~`;
    const vfile = await processor.process(contents);
    const out = String(vfile);
    expect(out).to.contain(`<div class="mermaid">**Hello**</div>`);
  });
});
