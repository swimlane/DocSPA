import stripIndent from 'common-tags/lib/stripIndent';

import remark2rehype from 'remark-rehype';
import raw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

import fetchMock from 'jest-fetch-mock';

const remark = require('remark');

const preset = require('../src/');

window['fetch'] = fetchMock as any;

const processor = remark()
  .use(preset)
  .use(remark2rehype, { allowDangerousHTML: true })
  .use(raw)
  .use(rehypeStringify);

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
      .toContain(`<img src="https://github.com/images/icons/emoji/smile.png"`);
    expect(out)
      .toContain(`<img src="https://github.com/images/icons/emoji/+1.png"`);
  });

  it('remark-custom-blocks', async () => {
    const contents = stripIndent`
    [[note]]
    | Note
    `;
    const vfile = await processor.process(contents);
    expect(String(vfile)).toEqual(`<div class="custom-block notice note"><div class="custom-block-body"><p>Note</p></div></div>`);
  });

  it('remark-custom-blockquotes', async () => {
    const contents = `!> Note`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).toContain(`class="tip"`);
    expect(String(vfile)).toContain(`Note`);
  });

  it('remark-attr', async () => {
    const contents = `*bold*{ .bold }`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).toEqual(`<p><em class="bold">bold</em></p>`);
  });

  it('remark-shortcodes', async () => {
    const contents = `[[ shortcode ]]`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).toEqual(`<div></div>`);
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
    expect(String(vfile)).toContain(`<pre`);
    expect(String(vfile)).toContain(`class="language-js"`);
    expect(String(vfile)).toContain(`id="test"`);
    expect(String(vfile)).toContain(`data-lang="js"`);
    expect(String(vfile)).toContain(`v-pre`);
  });

  /* it('includeSmartCode', async () => {
    fetchMock.mockResponseOnce('**Test**');
    const contents = `[[ include path="testBasePath" ]]`;
    const file = { contents, cwd: 'tbd', path: 'test', data: { base: 'testBasePath' } };
    const vfile = await processor.process(file);
    expect(String(vfile)).toEqual(`<div path="testBasePath"><p><strong>Test</strong></p></div>`);
  }); */

  /* it('includeSmartCode, codeblock', async () => {
    fetchMock.mockResponseOnce('**Test**\n');
    const contents = `[[ include path="testBasePath" codeblock="md"]]`;
    const file = { contents, cwd: 'tbd', path: 'test', data: { base: 'testBasePath' } };
    const vfile = await processor.process(file);
    expect(String(vfile)).toContain(`<pre path="testBasePath" codeblock="md" class="language-md" data-lang="md" v-pre>`);
    expect(String(vfile)).toContain(`<span data-line="1">**Test**</span>`);
  }); */

  /* it('tocSmartCode', async () => {
    const contents = `[[toc class="collapsable"]]`;
    const file = { contents, data: { base: 'testBasePath' } };
    const vfile = await processor.process(file);
    expect(String(vfile)).toEqual(`<div><md-toc class="collapsable" path="testBasePath"></md-toc></div>`);
  }); */

  it('smartCodeProps', async () => {
    const contents = `[[ shortcode class="test-shortcode-class" ]]`;
    const vfile = await processor.process(contents);
    expect(String(vfile)).toEqual(`<div class="test-shortcode-class"></div>`);
  });

  /* it('runtime, html', async () => {
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
    expect(out).toEqual(`<div class="custom-block runtime"><p><strong>Hello</strong></p></div>`);
  });

  it('runtime, markdown, playground', async () => {
    const contents = stripIndent`
    ~~~markdown { playground }
    **Hello**
    ~~~`;
    const vfile = await processor.process(contents);
    const out = String(vfile);
    expect(out).toContain(`<div class="custom-block playground language-markdown" data-lang="markdown" v-pre`);
    expect(out).toContain(`<p><strong>Hello</strong></p>`);
  }); */

  it('mermaid', async () => { // Can't really test mermaid in node env
    const contents = stripIndent`
    ~~~mermaid
    **Hello**
    ~~~`;
    const vfile = await processor.process(contents);
    const out = String(vfile);
    expect(out).toEqual(`<div class="mermaid">**Hello**</div>`);
  });
});
