import { Component, Input, OnChanges, OnInit, ViewEncapsulation } from '@angular/core';

import { of } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

import unified from 'unified';
import markdown from 'remark-parse';
import toc from 'mdast-util-toc';
import stringify from 'remark-stringify';
import slug from 'remark-slug';
import { links, images } from '../../shared/links';
import frontmatter from 'remark-frontmatter';
import * as MDAST from 'mdast';
import { getTitle } from '@swimlane/docspa-remark-preset';

import { join } from '../../shared/utils';

import { FetchService } from '../../services/fetch.service';
import { LocationService } from '../../services/location.service';
import { TocService } from './toc.service';

@Component({
  selector: 'docspa-toc-search', // tslint:disable-line
  template: `
  <div class="search" *ngIf="searchIndex">
    <div class="input-wrap">
      <input
        #searchInput
        type="search"
        value=""
        placeholder="Search topics"
        aria-label="Search topics"
        (keyup)="search($event.target.value)"
        (search)="search($event.target.value)">
    </div>

    <div class="results-panel" [class.show]="searchResults">
      <p class="empty" *ngIf="searchResults?.length === 0">No results!</p>
      <div class="matching-post" *ngFor="let result of searchResults | slice:0:9">
        <a [routerLink]="result.link" (click)="search(searchInput.value = '')">
          <h2 [innerHTML]="result.name"></h2>
          <p [innerHTML]="result.content"></p>
        </a>
      </div>
    </div>
  </div>
  `,
  styleUrls: ['./toc-search.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TOCSearchComponent implements OnInit, OnChanges {
  static readonly is = 'md-toc-search';

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
  minDepth = 1;

  @Input()
  maxDepth = 6;

  private get processor() {
    if (this._processor) {
      return this._processor;
    }
    // TODO: add sectionize... find sections.
    return this._processor = unified() // md -> toc -> md + links
      .use(markdown)
      .use(frontmatter)
      .use(slug)
      .use(getTitle)
      .use(this.tocService.removeNodesPlugin, this.minDepth)
      .use(this.tocService.tocPlugin, { maxDepth: this.maxDepth })
      .use(links, this.locationService)
      .use(images, this.locationService)
      .use(this.tocService.linkPlugin)
      .use(stringify);
  }
  private get processLinks() {
    if (this._processLinks) {
      return this._processLinks;
    }
    return this._processLinks = unified() // md -> md + links
      .use(markdown)
      .use(frontmatter)
      .use(slug)
      .use(this.tocService.linkPlugin)
      .use(stringify);
  }

  private _processor: any;
  private _processLinks: any;

  private _paths: string[];

  searchIndex: any[];
  searchResults: any[];

  constructor(
    private fetchService: FetchService,
    private locationService: LocationService,
    private tocService: TocService
  ) {
  }

  ngOnInit() {
    this.update();
  }

  ngOnChanges() {
    if (this._processor) {
      this._processor = null;
      this._processLinks = null;
      this.update();
    }
  }

  update() {
    if (!this.paths && this.summary) {
      this.loadSummary(this.summary).then(paths => {
        this.paths = paths;
        this.generateSearchIndex(this.paths);
      });
    } else {
      this.generateSearchIndex(this.paths);
    }
  }

  search(query: string) {
    if (typeof query !== 'string' || query.trim() === '') {
      this.searchResults = null;
      return;
    }

    const regEx = new RegExp(
      query.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'),
      'gi'
    );

    const matchingResults = [];

    this.searchIndex.forEach(link => {
      const index = link.content.search(regEx);
      if (index > -1) {
        const start = index < 21 ? 0 : index - 20;
        const end = start + 40;
        const content = link.content
          .substring(start, end)
          .replace(regEx, x => `<em class="search-keyword">${x}</em>`);
        matchingResults.push({
          ...link,
          content
        });
      }
    });

    this.searchResults = matchingResults;
  }

  private loadSummary(summary: string) {
    const vfile = this.locationService.pageToFile(summary);
    const fullPath = join(vfile.cwd, vfile.path);
    return this.fetchService.get(fullPath).pipe(
      mergeMap(resource => {
        vfile.contents = resource.contents;
        vfile.data = vfile.data || {};
        return resource.notFound ? of(null) : this.processLinks.process(vfile);
      }),
      map((_: any) => {
        return _.data.tocSearch.map(__ => __.url).join(',');
      })
    ).toPromise();
  }

  private generateSearchIndex(paths: string[]) {
    if (!paths) {
      this.searchIndex = null;
      return;
    }
    const promises = paths.map(_ => {
      const vfile = this.locationService.pageToFile(_);
      const fullPath = join(vfile.cwd, vfile.path);
      return this.fetchService.get(fullPath)
        .pipe(
          mergeMap(resource => {
            vfile.contents = resource.contents;
            vfile.data = vfile.data || {};
            return resource.notFound ? of(null) : this.processor.process(vfile);
          })
        ).toPromise();
    });

    return Promise.all(promises).then(files => {
      this.searchIndex = (files.reduce((acc: any[], file: any): any[] => {
        return file ? acc.concat(file.data.tocSearch) : acc;
      }, []) as any[]);
    });
  }
}
