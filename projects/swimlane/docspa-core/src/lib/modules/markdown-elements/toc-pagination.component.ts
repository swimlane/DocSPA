import { Component, Input, OnChanges, ViewEncapsulation, SimpleChanges, OnInit } from '@angular/core';

import { of } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

import { RouterService } from '../../services/router.service';
import { MarkdownService } from '../markdown/markdown.service';
import { LocationService } from '../../services/location.service';
import { FetchService } from '../../services/fetch.service';

import { join } from '../../shared/utils';
import { getBasePath } from '../../shared/vfile';
import { VFile } from '../../shared/vfile';

interface FileIndexItem {
  title: string;
  path: string;
  link: string | string[];
}

@Component({
  selector: 'docspa-toc-page', // eslint-disable-line
  template: `
    <div class="docsify-pagination-container">
      <div class="pagination-item pagination-item--previous" *ngIf="prev">
        <a class="prev" [routerLink]="prev.link" >
          <div class="pagination-item-label">
            <span>« PREVIOUS</span>
          </div>
          <div class="pagination-item-title">{{prev.title}}</div>
        </a>
      </div>
      <div class="pagination-item pagination-item--next" *ngIf="next">
        <a class="next" [routerLink]="next.link" >
          <div class="pagination-item-label">
            <span>NEXT »</span>
          </div>
          <div class="pagination-item-title">{{next.title}}</div>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .docsify-pagination-container {
      width: 80%;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      overflow: hidden;
      margin: 5em auto 1em;
      border-top: 1px solid rgba(0, 0, 0, 0.07);
    }
    .pagination-item {
      margin-top: 2.5em;
      max-width: 50%;
    }
    .pagination-item a,
    .pagination-item a:hover {
      text-decoration: none;
    }
    .pagination-item a {
      color: currentColor;
    }
    .pagination-item a:hover .pagination-item-title {
      text-decoration: underline;
    }
    .pagination-item:not(:last-child) a .pagination-item-label,
    .pagination-item:not(:last-child) a .pagination-item-title {
      opacity: 0.3;
      transition: all 200ms;
    }
    .pagination-item:last-child .pagination-item-label,
    .pagination-item:not(:last-child) a:hover .pagination-item-label {
      opacity: 0.6;
    }
    .pagination-item:not(:last-child) a:hover .pagination-item-title {
      opacity: 1;
    }
    .pagination-item-label {
      font-size: 0.8em;
    }
    .pagination-item-label > * {
      line-height: 1;
      vertical-align: middle;
    }
    .pagination-item--next {
      margin-left: auto;
      text-align: right;
    }
    .pagination-item--previous {
      margin-right: auto;
      text-align: left;
    }
    .pagination-item-title {
      font-size: 1.6em;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class TOCPaginationComponent implements OnInit, OnChanges {
  static readonly is = 'md-toc-page';

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

  @Input()
  summary: string;

  @Input()
  page: string;

  next: FileIndexItem;
  prev: FileIndexItem;

  private files: FileIndexItem[];
  private _paths: string[];

  constructor(
    private fetchService: FetchService,
    private routerService: RouterService,
    private markdownService: MarkdownService,
    private locationService: LocationService
  ) {
  }

  ngOnInit() {
    this.update();
  }

  ngOnChanges() {
    this.update();
  }

  update() {
    const processFiles = (files: any[]) => {
      this.files = files.map(vfile => {
        // Use TOCService
        const path = getBasePath(vfile);
        let link: string | string[] = this.locationService.prepareLink(path, this.routerService.root);

        // Hack to preserve trailing slash
        if (link.length > 1 && link.endsWith('/')) {
          link = [link, ''];
        }

        return {
          path,
          title: vfile.data.title,
          link
        };
      });

      this.routerService.changed.subscribe((changes: SimpleChanges) => {
        if ('contentPage' in changes) {
          this.pathChanges(changes.contentPage.currentValue);
        }
      });
      this.pathChanges(this.routerService.contentPage);
    };

    if (!this.paths && this.summary) {
      this.loadSummary(this.summary).then(paths => {
        this.paths = paths;
        this.generatePageIndex(this.paths).then(processFiles);
      });
    } else {
      this.generatePageIndex(this.paths).then(processFiles);
    }
  }

  // TODO: markdownService.getTocLinks
  private loadSummary(summary: string) {
    const _vfile = this.locationService.pageToFile(summary);
    const fullPath = join(_vfile.cwd, _vfile.path);
    return this.fetchService.get(fullPath).pipe(
      mergeMap(resource => {
        _vfile.contents = resource.contents;
        _vfile.data = _vfile.data || {};
        return resource.notFound ? of(null) : this.markdownService.processLinks(_vfile);
      }),
      map((_: any) => {
        return _.data.tocSearch.map(__ => {
          return __.url[0] === '/' ? __.url : '/' + __.url;
        }).join(',');
      })
    ).toPromise();
  }

  private pathChanges(path: string) {
    // TODO: make a matches or isActive helper
    path = path.replace(/^\.\//, '');
    // eslint-disable-next-line security/detect-non-literal-regexp
    const re = new RegExp(`^.?/?${path}$`);
    const index = this.files.findIndex(file => {
      return re.test(file.path);
    });
    this.prev = index > 0 ? this.files[index - 1] : null;
    this.next = index < this.files.length ? this.files[index + 1] : null;
  }

  private generatePageIndex(paths: string[]): Promise<VFile[]> {
    if (!paths) {
      this.files = null;
      return;
    }
    return Promise.all(paths.map(async path => {
      const _vfile = await this.fetch(path);
      await this.markdownService.process(_vfile);
      return _vfile;
    }));
  }

  private async fetch(path: string) {
    let _vfile: VFile;

    if (!path) {
      _vfile = VFile('') as VFile;
      _vfile.data.docspa.notFound = true;
    } else {
      _vfile = this.locationService.pageToFile(path) as VFile;
      const { contents, notFound } = await this.fetchService.get(_vfile.data.docspa.url).toPromise();
      _vfile.data.docspa.notFound = notFound;
      _vfile.contents = !notFound ? contents : `!> *File not found*\n!> ${path}`;
    }
    return _vfile;
  }
}
