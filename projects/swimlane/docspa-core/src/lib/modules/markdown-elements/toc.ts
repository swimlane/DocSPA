import {
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewEncapsulation,
  HostBinding
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { mergeMap } from 'rxjs/operators';

import { FetchService } from '../../services/fetch.service';
import { RouterService } from '../../services/router.service';
import { LocationService } from '../../services/location.service';
import { HooksService } from '../../services/hooks.service';
import { join } from '../../shared/utils';
import { MarkdownService } from '../markdown/markdown.service';

import type { VFile } from '../../shared/vfile';

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
  minDepth: 1 | 2 | 3 | 4 | 5 | 6 = 1;

  @Input()
  maxDepth: 1 | 2 | 3 | 4 | 5 | 6 = 6;

  @Input()
  tight = true;

  @HostBinding('innerHTML')
  html: SafeHtml;

  private lastPath: string;

  constructor(
    private fetchService: FetchService,
    private routerService: RouterService,
    private locationService: LocationService,
    private sanitizer: DomSanitizer,
    private hooks: HooksService,
    private markdownService: MarkdownService
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
    this.load();
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
    if (page === this.lastPath) { return; }

    // get new TOC content
    const vfile = this.locationService.pageToFile(page) as VFile;
    const fullpath = join(vfile.cwd, vfile.path);
    this.fetchService.get(fullpath)
      .pipe(
        mergeMap(async resource => {
          vfile.contents = resource.contents;
          vfile.data = vfile.data || {};
          /* const err = */ await this.markdownService.processTOC(vfile, {
            minDepth: +this.minDepth,
            // @ts-ignore
            maxDepth: +this.maxDepth,
            tight: this.tight
          });
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
