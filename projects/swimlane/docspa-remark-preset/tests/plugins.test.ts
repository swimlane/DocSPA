import stripIndent from 'common-tags/lib/stripIndent';
import { runtime } from '../src/plugins/runtime';
import { prism } from '../src/plugins/prism';

const { mermaid } = require('../src/plugins/mermaid');

const remark = require('remark');
const html = require('remark-html');
const { docspaRemarkPreset } = require('../src/');

const processor = remark()
  .use(docspaRemarkPreset)
  .use(runtime)
  .use(mermaid)
  .use(prism)
  .use(html);

describe('3rd party', () => {
  it('remark-slug', async () => {
    const contents = '## Hello World!';
    const vfile = await processor.process(contents);
    expect(String(vfile)).toContain(`<a href="#hello-world" aria-hidden`);
    expect(String(vfile)).toContain(`<span class="icon icon-link"></span>`);
  });

  it('remark-autolink-headings', async () => {
    const contents = '## Hello World!';
    const vfile = await processor.process(contents);
    expect(String(vfile)).toContain(`id="hello-world`);
  });

  it('remark-math', async () => {
    const contents = stripIndent`
      $$
      L = \\frac{1}{2} \\rho v^2 S C_L
      $$`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).toContain(`<div class="math">`);
  });

  it('remark-html-katex', async () => {
    const contents = stripIndent`
      $$
      L = \\frac{1}{2} \\rho v^2 S C_L
      $$`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).toContain(`<span class="katex-display">`);
    expect(String(vfile)).toContain(`<math>`);
  });

  it('remark-gemoji-to-emoji, remark-html-emoji-image', async () => {
    const contents = `:smile: :+1:`;
    const vfile = await processor.process(contents);
    const out = String(vfile);
    expect(out)
      .toContain(`<img src="https://assets-cdn.github.com/images/icons/emoji/smile.png"`);
    expect(out)
      .toContain(`<img src="https://assets-cdn.github.com/images/icons/emoji/+1.png"`);
  });

  it('remark-custom-blocks', async () => {
    const contents = stripIndent`
    [[note]]
    | Note
    `;
    const vfile = await processor.process(contents);
    expect(String(vfile)).toEqual(`<div class="custom-block notice note"><div class="custom-block-body"><p>Note</p></div></div>\n`);
  });

  it('remark-custom-blockquotes', async () => {
    const contents = `!> Note`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).toEqual(`<blockquote class="tip">\n Note\n</blockquote>\n`);
  });

  it('remark-attr', async () => {
    const contents = `*bold*{ .bold }`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).toEqual(`<p><em class="bold">bold</em></p>\n`);
  });

  it('remark-shortcodes', async () => {
    const contents = `[[ shortcode ]]`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).toEqual(`<div></div>\n`);
  });
});

describe('internal', () => {
  it('remark-frontmatter, remark-parse-yaml, readMatter', async () => {
    const contents = stripIndent`
      ---
      title: Hello
      ---`;
    const vfile = await processor.process(contents);
    expect(vfile.data.matter).toEqual({title: 'Hello'});
  });

  it('infoStringToAttr', async () => {
    const contents = stripIndent`
      ~~~js { #test }
      function() {};
      ~~~`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).toContain(`<pre class="language-js" id="test" data-lang="js" v-pre`);
  });

  it('includeSmartCode', async () => {
    const contents = `[[ include path="testBasePath" ]]`;
    const file = { contents, data: { base: 'testBasePath' } };
    const vfile = await processor.process(file);
    expect(String(vfile)).toEqual(`<div><md-embed path="testBasePath"></md-embed></div>\n`);
  });

  it('tocSmartCode', async () => {
    const contents = `[[toc class="collapsable"]]`;
    const file = { contents, data: { base: 'testBasePath' } };
    const vfile = await processor.process(file);
    expect(String(vfile)).toEqual(`<div><md-toc class="collapsable" path="testBasePath"></md-toc></div>\n`);
  });

  it('smartCodeProps', async () => {
    const contents = `[[ shortcode class="test-shortcode-class" ]]`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).toEqual(`<div class="test-shortcode-class"></div>\n`);
  });

  it('runtime, html', async () => {
    const contents = stripIndent`
    ~~~html { run }
    function() {};
    ~~~`;
    const vfile = await processor.process(contents);
    const out = String(vfile);
    expect(out).not.toContain(`data-lang="html"`);
    expect(out).toContain(`<runtime-content`);
    expect(out).toContain(`template="function() {};"`);
  });

  it('runtime, html, playground', async () => {
    const contents = stripIndent`
    ~~~html { playground }
    function() {};
    ~~~`;
    const vfile = await processor.process(contents);
    const out = String(vfile);
    expect(out).toContain(`<div class="custom-block playground language-html" data-lang="html" v-pre`);
    expect(out).toContain(`<runtime-content`);
    expect(out).toContain(`template="function() {};"`);
  });

  it('runtime, markdown', async () => {
    const contents = stripIndent`
    ~~~markdown { run }
    **Hello**
    ~~~`;
    const vfile = await processor.process(contents);
    const out = String(vfile);
    expect(out).toEqual(`<p><strong>Hello</strong></p>\n`);
  });

  it('runtime, markdown, playground', async () => {
    const contents = stripIndent`
    ~~~markdown { playground }
    **Hello**
    ~~~`;
    const vfile = await processor.process(contents);
    const out = String(vfile);
    expect(out).toContain(`<div class="custom-block playground language-markdown" data-lang="markdown" v-pre`);
    expect(out).toContain(`<p><strong>Hello</strong></p>\n`);
  });

  it('mermaid', async () => { // Can't really test mermaid in node env
    const contents = stripIndent`
    ~~~mermaid
    **Hello**
    ~~~`;
    const vfile = await processor.process(contents);
    const out = String(vfile);
    expect(out).toEqual(`<div class="mermaid">**Hello**</div>\n`);
  });
});
