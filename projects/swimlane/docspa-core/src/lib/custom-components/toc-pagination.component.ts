import { Component, Input, OnInit, ViewEncapsulation, SimpleChanges } from '@angular/core';

import { of } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { LocationService } from '../services/location.service';
import { RouterService } from '../services/router.service';
import { MarkdownService } from '../services/markdown.service';

import { Page } from '../services/page.model';

@Component({
  selector: 'md-toc-page', // tslint:disable-line
  template: `
    <div class="docsify-pagination-container">
      <div class="pagination-item pagination-item--previous" *ngIf="prev">
        <a class="prev" [href]="'#/' + prev.stem + '#main'" >
          <div class="pagination-item-label">
            <span>« PREVIOUS</span>
          </div>
          <div class="pagination-item-title">{{prev.data.title}}</div>
        </a>
      </div>
      <div class="pagination-item pagination-item--next" *ngIf="next">
        <a class="next" [href]="'#/' + next.stem + '#main'" >
          <div class="pagination-item-label">
            <span>NEXT »</span>
          </div>
          <div class="pagination-item-title">{{next.data.title}}</div>
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
export class TOCPaginationComponent implements OnInit {
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

  /* @Input()
  minDepth = 1;

  @Input()
  maxDepth = 6; */

  private processor: any;
  private _paths: string[];

  files: Page[];

  next: any;
  prev: any;

  constructor(
    private locationService: LocationService,
    private routerService: RouterService,
    private markdownService: MarkdownService,
  ) {
  }

  ngOnInit() {
    this.generatePageIndex(this.paths).then(files => {
      this.files = files;
      this.routerService.changed.subscribe((changes: SimpleChanges) => {
        if ('contentPath' in changes) {
          this.pathChanges(changes.contentPath.currentValue);
        }
      });
      this.pathChanges(this.routerService.contentPath);
    });
  }

  private pathChanges(path: string) {
    const index = this.files.findIndex(file => file.resolvedPath === path);
    this.prev = index > 0 ? this.files[index - 1] : null;
    this.next = index < this.files.length ? this.files[index + 1] : null;
  }

  private generatePageIndex(paths: string[]): Promise<Page[]> {
    if (!paths) {
      this.files = null;
      return;
    }

    return Promise.all(paths.map(_ => {
      const url = this.locationService.makePath(_);

      // TODO: all I need is the title
      // should be able to avoid this
      // Need to run plugins incase title is changed?
      return this.markdownService.getMd(url, true)
        .pipe(
          flatMap((page: Page) => {
            if (page.notFound) {
              return;
            }
            return of(page);
          })
        ).toPromise();
    }));
  }
}
