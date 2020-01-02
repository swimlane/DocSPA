import {
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewEncapsulation,
  HostBinding
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { flatMap } from 'rxjs/operators';
import unified from 'unified';
import markdown from 'remark-parse';
import slug from 'remark-slug';
import rehypeStringify from 'rehype-stringify';
import remark2rehype from 'remark-rehype';
import raw from 'rehype-raw';
import frontmatter from 'remark-frontmatter';

import { FetchService } from '../../services/fetch.service';
import { RouterService } from '../../services/router.service';
import { LocationService } from '../../services/location.service';
import { HooksService } from '../../services/hooks.service';
import { TocService } from './toc.service';
import { links, images } from '../../shared/links';
import { join } from '../../shared/utils';

import { VFile } from '../../../vendor';

@Component({
  selector: 'docspa-toc', // tslint:disable-line
  template: ``,
  encapsulation: ViewEncapsulation.None
})
export class TOCComponent implements OnChanges, OnInit {
  static readonly is = 'md-toc';

  @Input()
  path: string;

  @Input()
  plugins = false;

  @Input()
  minDepth = 1;

  @Input()
  maxDepth = 6;

  @Input()
  tight = true;

  @HostBinding('innerHTML')
  html: SafeHtml;

  private get processor() {
    if (this._processor) {
      return this._processor;
    }
    return this._processor = unified()
      .use(markdown)
      .use(frontmatter)
      .use(slug)
      .use(this.tocService.removeNodesPlugin, this.minDepth)
      .use(this.tocService.tocPlugin, { maxDepth: this.maxDepth, tight: this.tight })
      .use(links, this.locationService)
      .use(images, this.locationService)
      .use(remark2rehype, { allowDangerousHTML: true })
      .use(raw)
      .use(rehypeStringify);
  }

  private _processor: any;
  private lastPath: string;

  constructor(
    private fetchService: FetchService,
    private routerService: RouterService,
    private locationService: LocationService,
    private sanitizer: DomSanitizer,
    private hooks: HooksService,
    private tocService: TocService
  ) {
  }

  ngOnInit() {
    this.hooks.doneEach.tap('main-content-loaded', (page: VFile) => {
      if (page.data.docspa.isPageContent) {
        // load or update after main content changes
        this.load();
      }
    });
  }

  ngOnChanges() {
    if (this._processor) {
      this._processor = null;
      this.load();
    }
  }

  private load() {
    const page = this.path || this.routerService.contentPage;

    // Not a page, clear
    if (typeof page !== 'string' || page.trim() === '') {
      this.html = '';
      this.lastPath = page;
      return;
    }

    // TOC content hasn't changed,
    if (page === this.lastPath) return;

    // get new TOC content
    const vfile = this.locationService.pageToFile(page) as VFile;
    const fullpath = join(vfile.cwd, vfile.path);
    this.fetchService.get(fullpath)
      .pipe(
        flatMap(async resource => {
          vfile.contents = resource.contents;
          vfile.data = vfile.data || {};
          /* const err = */ await this.processor.process(vfile);
          return vfile;
        }),
      ).subscribe(_vfile => {
        this.html = this.sanitizer.bypassSecurityTrustHtml(_vfile.contents as string);
        this.lastPath = page;
        setTimeout(() => {
          this.hooks.doneEach.call(_vfile);
        }, 30);
      });
  }
}
