import { expect } from 'chai';
import stripIndent from 'common-tags/lib/stripIndent';
import { runtime } from '../src/plugins/runtime';
import { prism } from '../src/plugins/prism';

const remark = require('remark');
const html = require('remark-html');
const { docspaRemarkPreset } = require('../src/');

const processor = remark()
  .use(docspaRemarkPreset)
  .use(runtime)
  .use(prism)
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
    expect(String(vfile)).to.contain(`<math>`);
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
    expect(String(vfile)).to.equal(`<div class="custom-block notice note"><div class="custom-block-body"><p>Note</p></div></div>\n`);
  });

  it('remark-custom-blockquotes', async () => {
    const contents = `!> Note`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).to.equal(`<blockquote class="tip">\n Note\n</blockquote>\n`);
  });

  it('remark-attr', async () => {
    const contents = `*bold*{ .bold }`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).to.equal(`<p><em class="bold">bold</em></p>\n`);
  });

  it('remark-shortcodes', async () => {
    const contents = `[[ shortcode ]]`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).to.equal(`<div></div>\n`);
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
    expect(String(vfile)).to.contain(`<pre class="language-js" id="test" data-lang="js" v-pre="true">`);
  });

  it('includeSmartCode', async () => {
    const contents = `[[ include path="testBasePath" ]]`;
    const file = { contents, data: { base: 'testBasePath' } };
    const vfile = await processor.process(file);
    expect(String(vfile)).to.equal(`<div><md-embed path="testBasePath"></md-embed></div>\n`);
  });

  it('tocSmartCode', async () => {
    const contents = `[[toc class="collapsable"]]`;
    const file = { contents, data: { base: 'testBasePath' } };
    const vfile = await processor.process(file);
    expect(String(vfile)).to.equal(`<div><md-toc class="collapsable" path="testBasePath"></md-toc></div>\n`);
  });

  it('smartCodeProps', async () => {
    const contents = `[[ shortcode class="test-shortcode-class" ]]`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).to.equal(`<div class="test-shortcode-class"></div>\n`);
  });

  it('runtime, html', async () => {
    const contents = stripIndent`
    ~~~html { run }
    function() {};
    ~~~`;
    const vfile = await processor.process(contents);
    const out = String(vfile);
    expect(out).to.not.contain(`data-lang="html"`);
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
    expect(out).to.contain(`<div class="custom-block playground language-html" data-lang="html" v-pre="true">`);
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
    expect(out).to.equal(`<p><strong>Hello</strong></p>\n`);
  });

  it('runtime, markdown, playground', async () => {
    const contents = stripIndent`
    ~~~markdown { playground }
    **Hello**
    ~~~`;
    const vfile = await processor.process(contents);
    const out = String(vfile);
    expect(out).to.contain(`<div class="custom-block playground language-markdown" data-lang="markdown" v-pre="true">`);
    expect(out).to.contain(`<p><strong>Hello</strong></p>\n`);
  });

  it('mermaid', async () => {
    const contents = stripIndent`
    ~~~mermaid
    **Hello**
    ~~~`;
    const vfile = await processor.process(contents);
    const out = String(vfile);
    expect(out).to.equal(`<div class="mermaid">**Hello**</div>\n`);
  });
});
