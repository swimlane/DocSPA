import { Component, Input, OnInit, ViewEncapsulation, SimpleChanges } from '@angular/core';

import { RouterService } from '../services/router.service';
import { MarkdownService } from '../services/markdown.service';
import { LocationService } from '../services/location.service';
import { FetchService } from '../services/fetch.service';

import VFile from 'vfile';
import { getBasePath } from '../utils';

import unified from 'unified';
import markdown from 'remark-parse';
import toc from 'mdast-util-toc';
import visit from 'unist-util-visit';
import stringify from 'remark-stringify';
import toString from 'mdast-util-to-string';
import slug from 'remark-slug';
import { join } from '../utils';
import { MDAST } from 'mdast';
import frontmatter from 'remark-frontmatter';

import { of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

@Component({
  selector: 'md-toc-page', // tslint:disable-line
  template: `
    <div class="docsify-pagination-container">
      <div class="pagination-item pagination-item--previous" *ngIf="prev">
        <a class="prev" [href]="prepareLink(prev) + '#main'" >
          <div class="pagination-item-label">
            <span>« PREVIOUS</span>
          </div>
          <div class="pagination-item-title">{{prev.data.title}}</div>
        </a>
      </div>
      <div class="pagination-item pagination-item--next" *ngIf="next">
        <a class="next" [href]="prepareLink(next) + '#main'" >
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

  @Input()
  summary: string;

  private processLinks: any;

  private _paths: string[];

  files: VFile[];

  next: any;
  prev: any;

  getBasePath: (vfile: VFile) => string = getBasePath;

  constructor(
    private fetchService: FetchService,
    private routerService: RouterService,
    private markdownService: MarkdownService,
    private locationService: LocationService
  ) {
    const getLinks = () => {
      return (tree, file) => {
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

    this.processLinks = unified()
      .use(markdown)
      .use(frontmatter)
      .use(slug)
      .use(getLinks)
      .use(stringify);
  }

  ngOnInit() {
    const processFiles = files => {
      this.files = files;
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

  prepareLink(vfile: VFile) {
    return this.locationService.prepareLink(vfile.history[0]);
  }

  private loadSummary(summary: string) {
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
        }).join(',');
      })
    ).toPromise();
  }

  private pathChanges(path: string) {
    const index = this.files.findIndex(file => file.history[0] === path);
    this.prev = index > 0 ? this.files[index - 1] : null;
    this.next = index < this.files.length ? this.files[index + 1] : null;
  }

  private generatePageIndex(paths: string[]): Promise<VFile[]> {
    if (!paths) {
      this.files = null;
      return;
    }

    return Promise.all(paths.map(_ => {
      // TODO: all I need is the title
      // should be able to avoid this
      // Need to run plugins incase title is changed?
      return this.markdownService.getMd(_, true)
        .toPromise();
    }));
  }
}
