import { Page } from './page.model';

describe('Page', () => {
  it('works', () => {
    const page = new Page();
    expect(page).toBeTruthy();
    expect(page.history).toEqual([]);
    expect(page.data).toEqual({});
    expect(page.messages).toEqual([]);
    expect(page.contents).toEqual(undefined);
    expect(page.path).toEqual(undefined);
    expect(page.dirname).toEqual(undefined);
    expect(page.basename).toEqual(undefined);
    expect(page.stem).toEqual(undefined);
    expect(page.extname).toEqual(undefined);
  });

  it('works with content', () => {
    const page = new Page('this is content');
    expect(page).toBeTruthy();
    expect(page.contents).toEqual('this is content');
  });

  it('works with page', () => {
    const page = new Page('this is content');
    const page2 = new Page(page);
    expect(page2).toBeTruthy();
    expect(page2.contents).toEqual('this is content');
    // expect(page2).not.toBe(page);  should be a clone?
  });

  it('works with page clone', () => {
    const page = new Page('this is content');
    const page2 = new Page({...page});
    expect(page2).toBeTruthy();
    expect(page2.contents).toEqual('this is content');
    expect(page2).not.toBe(page);
  });

  it('works with an object', () => {
    const page = new Page({basename: 'example.md', cwd: '/docs'});
    expect(page.history).toEqual(['example.md']);
    expect(page.data).toEqual({});
    expect(page.messages).toEqual([]);
    expect(page.contents).toEqual(undefined);
    expect(page.path).toEqual('example.md');
    expect(page.dirname).toEqual('.');
    expect(page.basename).toEqual('example.md');
    expect(page.stem).toEqual('example');
    expect(page.extname).toEqual('.md');

    expect(page.fullpath).toEqual('/docs/example.md');
    expect(page.base).toEqual('example.md');
  });

  it('works with an object 2', () => {
    const page = new Page({stem: 'example', extname: '.md', dirname: 'feature', cwd: '/docs'});
    expect(page.history).toEqual(['example', 'example.md', 'feature/example.md']);
    expect(page.data).toEqual({});
    expect(page.messages).toEqual([]);
    expect(page.contents).toEqual(undefined);
    expect(page.path).toEqual('feature/example.md');
    expect(page.dirname).toEqual('feature');
    expect(page.basename).toEqual('example.md');
    expect(page.stem).toEqual('example');
    expect(page.extname).toEqual('.md');
    expect(page.cwd).toEqual('/docs');

    expect(page.fullpath).toEqual('/docs/feature/example.md');
    expect(page.base).toEqual('example');
  });

  it('history', () => {
    const page = new Page({path: '/', cwd: '/docs'});
    page.basename = 'README';
    page.extname = '.md';

    expect(page.history).toEqual(['/', '/README', '/README.md']);
    expect(page.fullpath).toEqual('/docs/README.md');
    expect(page.base).toEqual('/');
  });

  it('history 2', () => {
    const page = new Page({path: '/feature/', cwd: '/docs'});
    page.path += 'README'; // should work by setting stem, bug in vfile?
    page.extname = '.md';

    expect(page.history).toEqual(['/feature/', '/feature/README', '/feature/README.md']);
    expect(page.fullpath).toEqual('/docs/feature/README.md');
    expect(page.base).toEqual('/feature/');
  });

  it('#toString()', () => {
    expect(String(new Page())).toEqual('');
    expect(String(new Page('this is content'))).toEqual('this is content');
  });
});

