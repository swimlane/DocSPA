import { Component, Input, OnInit, HostBinding, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

import unified from 'unified';
import markdown from 'remark-parse';
import visit from 'unist-util-visit';
import toString from 'mdast-util-to-string';
import slug from 'remark-slug';
import MDAST from 'mdast';
import VFILE, { default as VFile } from 'vfile';
import frontmatter from 'remark-frontmatter';
import rehypeStringify from 'rehype-stringify';
import remark2rehype from 'remark-rehype';
import raw from 'rehype-raw';

import { images } from '../plugins/links';

import { LocationService } from '../services/location.service';
import { FetchService } from '../services/fetch.service';
import { SettingsService } from '../services/settings.service';
import { RouterService } from '../services/router.service';

import { join } from '../utils';

interface CustomVFile extends VFILE.VFile {
  data: any;
}

interface Heading extends MDAST.Heading {
  data: any;
}

@Component({
  selector: 'docspa-print', // tslint:disable-line
  template: `<!-- -->`,
  styles: []
})
export class MdPrintComponent implements OnInit {
  static readonly is = 'md-print';

  @Input()
  summary = '';

  @Input()
  coverpage = this.settings.coverpage;

  @Input()
  set showToc(val: string | boolean) {
    this._showToc = typeof val === 'string' ?
      val.toLowerCase() === 'true' :
      Boolean(val);
  }
  get showToc(): string | boolean {
    return this._showToc;
  }

  @Input()
  set printOnLoad(val: string | boolean) {
    this._printOnLoad = typeof val === 'string' ?
      val.toLowerCase() === 'true' :
      Boolean(val);
  }
  get printOnLoad(): string | boolean {
    return this._printOnLoad;
  }

  @Input()
  set paths(val: string[]) {
    if (typeof val === 'string') {
      val = (val as string).split(',');
    }
    if (!Array.isArray(val)) {
      val = [val];
    }
    this._paths = val;
  }
  get paths(): string[] {
    return this._paths;
  }

  @HostBinding('innerHTML')
  html: string | SafeHtml;

  safe = true;

  private processor: any;
  private processLinks: any;
  // private page = '';

  private _paths: string[];
  private _showToc = true;
  private _printOnLoad = false;

  private get path() {
    return this.routerService.contentPage;
  }

  constructor (
    private settings: SettingsService,
    private routerService: RouterService,
    private fetchService: FetchService,
    private locationService: LocationService,
    private sanitizer: DomSanitizer,
    private elm: ElementRef
  ) {
    const getLinks = () => {
      return (tree: any, file: CustomVFile) => {
        file.data = file.data || {};
        file.data.tocSearch = [];
        visit(tree, 'link', (node: MDAST.Link) => {
          const url = node.url;
          const content = toString(node);
          const name = (file.data.matter ? file.data.matter.title : false) || file.data.title || file.path;
          file.data.tocSearch.push({
            name,
            url,
            content,
            depth: (node as any).depth
          });
          return true;
        });
      };
    };

    const fixLinks = () => {
      return (tree, file: VFILE.VFile) => {
        visit(tree, 'link', (node: MDAST.Link) => {
          if (node && !LocationService.isAbsolutePath(node.url)) {
            const url = locationService.prepareLink(node.url, file.history[0]).replace(/[\/#]/g, '--');
            node.url = `#${url}`;
          }
          return true;
        });
      };
    };

    const fixIds = () => {
      return (tree, file: VFILE.VFile) => {
        visit(tree, 'heading', (node: Heading) => {
          if (node && node.data && node.data.hProperties && node.data.hProperties.id) {
            const id = locationService.prepareLink(`#${node.data.hProperties.id}`, file.history[0]).replace(/[\/#]/g, '--');
            node.data.hProperties.id = node.data.id = id;
          }
          return true;
        });
      };
    };

    this.processLinks = unified()
      .use(markdown)
      .use(frontmatter)
      .use(slug)
      .use(getLinks as any)
      .use(remark2rehype, { allowDangerousHTML: true })
      .use(raw)
      .use(rehypeStringify);

    this.processor = unified()
      .use(markdown)
      .use(this.settings.remarkPlugins)
      .use(fixLinks as any)
      .use(fixIds as any)
      .use(images as any, locationService)
      .use(remark2rehype, { allowDangerousHTML: true })
      .use(raw)
      .use(rehypeStringify);
  }

  ngOnInit() {
    if (this.summary) {
      this.load();
    }
  }

  private async load() {
    const paths = await this.loadSummary(this.summary);

    this.paths = [...paths];

    if (this.showToc) {
      this.paths.unshift(this.summary);
    }

    if (this.coverpage) {
      this.paths.unshift(this.coverpage);
    }

    const p = this.paths.map(async (path: string) => {
      const vfile = this.locationService.pageToFile(path);
      const url = join(vfile.cwd, vfile.path);
      const res = await this.fetchService.get(url).toPromise();
      vfile.contents = res.contents;
      return this.processor.process(vfile);
    });

    const files = await Promise.all(p);
    const contents = files.map((f, i) => {
      const id = f.history[0].replace(/^\//, '').replace(/[\/#]/g, '--');
      return `<article class="print-page" id="${id}"><a id="--${id}"></a>${f.contents}</article>`;
    }).join('<hr class="page-break">');

    this.html = this.safe ? this.sanitizer.bypassSecurityTrustHtml(contents) : contents;

    setTimeout(() => {
      const elms = this.elm.nativeElement.getElementsByTagName('details');
      for (let i = 0; i < elms.length; i++) {
        elms[i].setAttribute('open', 'true');
      }

      if (this.printOnLoad) {
        window.print();
      }
    });


  }

  private loadSummary(summary: string): Promise<string[]> {
    const vfile = this.locationService.pageToFile(summary);
    const fullPath = join(vfile.cwd, vfile.path);
    return this.fetchService.get(fullPath).pipe(
      flatMap(resource => {
        vfile.contents = resource.contents;
        vfile.data = vfile.data || {};
        return resource.notFound ? of(null) : this.processLinks.process(vfile);
      }),
      map((_: any) => {
        return _.data.tocSearch.map(__ => {
          return __.url[0] === '/' ? __.url : '/' + __.url;
        });
      })
    ).toPromise();
  }
}

