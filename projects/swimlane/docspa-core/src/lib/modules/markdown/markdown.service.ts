import { Injectable, InjectionToken, Inject, Optional } from '@angular/core';

import { NGXLogger } from 'ngx-logger';

import unified from 'unified';
import markdown from 'remark-parse';
import remark2rehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import raw from 'rehype-raw';
import frontmatter from 'remark-frontmatter';
import slug from 'remark-slug';
import sectionize from 'remark-sectionize';
import { getTitle } from '@swimlane/docspa-remark-preset';
import toString from 'mdast-util-to-string';
import { resolve } from 'url';
import visit from 'unist-util-visit';

import vfile from 'vfile';

import type { VFileCompatible } from 'vfile';
import type * as mdast from 'mdast';

import { LocationService } from '../../services/location.service';
import { HooksService } from '../../services/hooks.service';
import { links, images } from '../../shared/links';

import lazyInitialize from '../../shared/lazy-init';

import { tocPlugin } from './plugins/toc';
import { removeNodesPlugin } from './plugins/remove';
import { sectionPlugin } from './plugins/sections';

import type { Preset, TOCOptions, VFile, TOCData, Link } from '../../vendor';
import { RouterService } from '../../services/router.service';

export const MARKDOWN_CONFIG_TOKEN = new InjectionToken<any>( 'forRoot() configuration.' );

@Injectable({
  providedIn: 'root'
})
export class MarkdownService {

  /**
   * Processor for converting md to html
   */
  @lazyInitialize
  get processor(): unified.Processor {
    return unified()
      .use(markdown)
      .use(this.config)
      .use(links, { locationService: this.locationService })
      .use(images, { locationService: this.locationService })
      .use(remark2rehype, { allowDangerousHtml: true })
      .use(raw)
      .use(rehypeStringify);
  }

  /**
   * Processor for converting md to a toc
   */
  @lazyInitialize
  private get tocProcessor() {
    return unified()
      .use(markdown)
      .use(frontmatter)
      .use(slug)
      .use(getTitle as any)
      .use(removeNodesPlugin)
      .use(tocPlugin)
      .use(links, { locationService: this.locationService })
      .use(images, { locationService: this.locationService })
      .use(this.linkPlugin)
      .use(remark2rehype, { allowDangerousHtml: true })
      .use(raw)
      .use(rehypeStringify);
  }

  @lazyInitialize
  private get linksProcessor() {
    return unified()
      .use(markdown)
      .use(frontmatter)
      .use(slug)
      .use(this.linkPlugin)
      .use(remark2rehype, { allowDangerousHtml: true })
      .use(raw)
      .use(rehypeStringify);
  }

  /**
   * Processor for extracting sections from md
   */
  @lazyInitialize
  private get sectionProcessor() {
    return unified()
      .use(markdown)
      .use(slug)
      .use(sectionize)
      .use(sectionPlugin);
  }

  get remarkPlugins(): unified.PluggableList {
    if (Array.isArray(this.config)) {
      return this.config;
    }
    return this.config.plugins;
  }

  constructor(
    private locationService: LocationService,
    private logger: NGXLogger,
    private hooks: HooksService,
    private routerService: RouterService,
    @Optional() @Inject(MARKDOWN_CONFIG_TOKEN) private config: Preset
  ) {
    this.config = this.config || { plugins: [] };
    this.config.plugins = this.config.plugins || [];

    if (this.config.reporter) {
      this.hooks.afterEach.tap('logging', (page: any) => {
        this.logger.info(this.config.reporter(page));
      });
    }
  }

  /**
   * Process MD
   */
  async process(vf: VFileCompatible): Promise<VFile> {
    await this.hooks.beforeEach.promise(vf);
    const err = await this.processor.process(vf);
    await this.hooks.afterEach.promise(err || vf);
    return (err || vf) as VFile;
  }

  /**
   * Get TOC
   */
  async processTOC(doc: VFileCompatible, options?: TOCOptions): Promise<VFile> {
    const file = vfile(doc) as VFile;
    file.data.tocOptions = {
      ...(file.data?.tocOptions || {}),
      ...options,
    };
    const err = await this.tocProcessor.process(file) as VFile;
    return err || file;
  }

  async processLinks(doc: VFileCompatible) {
    const file = vfile(doc) as VFile;
    const err = await this.linksProcessor.process(file) as VFile;
    return err || file;
  }

  /**
   * Get Sections
   */
  async getSections(doc: VFileCompatible) {
    const file = vfile(doc) as VFile;
    const tree = await this.sectionProcessor.parse(file);
    const p = await this.sectionProcessor.run(tree, file);
    return file.data?.sections || [];
  }

  private linkPlugin = () => {
    return (tree: mdast.Root, file: VFile) => {
      file.data = file.data || {};
      file.data.tocSearch = [];
      return visit(tree, 'link', (node: Link, index: number, parent: mdast.Parent) => {
        file.data.tocSearch.push(this.convertToTocData(file, node, parent));
        return true;
      });
    };
  }

  private convertToTocData(file: VFile, node: Link, parent?: mdast.Parent): TOCData {
    const content = toString(node);
    const name = (file.data.matter ? file.data.matter.title : false) || file.data.title || file.path;

    let { url } = node;
    let link: string | string[] = '';
    let fragment = '';

    if (node.data && node.data.hName === 'md-link') {
      // resolve path relative to source document
      url = resolve(node.data.hProperties.source, url);
      link = node.data.hProperties.link as string;
      fragment = node.data.hProperties.fragment;

      link = this.locationService.prepareLink(link, this.routerService.root);
    } else {
      [link = '', fragment] = url.split('#');
    }

    // Hack to preserve trailing slash
    if (typeof link === 'string' && link.length > 1 && link.endsWith('/')) {
      link = [link, ''];
    }

    return {
      name,
      url,
      content,
      link,
      fragment: fragment ? fragment.replace(/^#/, '') : undefined,
      depth: node.depth as number
    };
  }
}
