import { Component, Input, OnChanges, OnInit, ViewEncapsulation } from '@angular/core';

import { of } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { Builder, stopWordFilter } from 'lunr';

import { join, splitHash } from '@swimlane/docspa-core/lib/shared/utils';

import { FetchService, MarkdownService } from '@swimlane/docspa-core';
import { LocationService } from '@swimlane/docspa-core';

@Component({
  selector: 'docspa-search',
  templateUrl: './docspa-search.component.html',
  styleUrls: ['./docspa-search.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DocspaSearchComponent implements OnInit, OnChanges {
  static readonly is = 'md-search';

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
  minDepth: 1 | 2 | 3 | 4 | 5 | 6 = 1;

  @Input()
  maxDepth: 1 | 2 | 3 | 4 | 5 | 6 = 6;

  private _paths: string[];

  searchIndex: any[];
  searchResults: any[];

  private idx: any;

  constructor(
    private fetchService: FetchService,
    private locationService: LocationService,
    // private tocService: TocService,
    private markdownService: MarkdownService
  ) {
  }

  ngOnInit() {
    this.update();
  }

  ngOnChanges() {
    this.update();
  }

  async update() {
    if (!this.paths && this.summary) {
      this.paths = await this.loadSummary(this.summary);
    }
    return this.generateSearchIndex(this.paths);
  }

  search(query: string) {
    if (typeof query !== 'string' || query.trim() === '') {
      this.searchResults = null;
      return;
    }

    // this.searchIndex.forEach(link => {
    //   const index = link.content.search(regEx);
    //   if (index > -1) {
    //     const start = index < 21 ? 0 : index - 20;
    //     const end = start + 40;
    //     const content = link.content
    //       .substring(start, end)
    //       .replace(regEx, x => `<em class="search-keyword">${x}</em>`);
    //     matchingResults.push({
    //       ...link,
    //       content
    //     });
    //   }
    // });

    if (!query.includes('*')) {
      query = '*' + query + '*';
    }

    this.searchResults = this.idx.search(query).map(r => {
      const url = r.ref;
      // const [link, fragment] = splitHash(url);

      const match = this.searchIndex.find(link => link.url === url);

      return match;

      // return {
      //   link,
      //   fragment: fragment.replace(/^#/, ''),
      //   name: url,
      //   content: ''
      // };
    });
  }

  private loadSummary(summary: string) {
    const vfile = this.locationService.pageToFile(summary);
    const fullPath = join(vfile.cwd, vfile.path);
    return this.fetchService.get(fullPath).pipe(
      mergeMap(resource => {
        vfile.contents = resource.contents;
        vfile.data = vfile.data || {};
        return resource.notFound ? of(null) : this.markdownService.processLinks(vfile);
      }),
      map((_: any) => {
        return _.data.tocSearch.map(__ => __.url).join(',');
      })
    ).toPromise();
  }

  private async generateSearchIndex(paths: string[]) {
    this.searchIndex = null;
    this.idx = null;

    if (!paths) {
      return;
    }

    const builder = new Builder();

    builder.pipeline.add(stopWordFilter);

    builder.ref('url');
    // builder.field('name', { boost: 10 });
    builder.field('content');

    this.searchIndex = [];

    const promises = paths.map(async p => {
      const vfile = this.locationService.pageToFile(p);
      const fullPath = join(vfile.cwd, vfile.path);

      const resource = await this.fetchService.get(fullPath).toPromise();
      vfile.contents = resource.contents;
      vfile.data = vfile.data || {};

      const file = resource.notFound ? null : await this.markdownService.processTOC(vfile, {
        minDepth: +this.minDepth,
        maxDepth: +this.maxDepth as 1
      });

      if (file?.data?.tocSearch) {
        console.log(file.data.tocSearch);
        file.data.tocSearch.forEach(doc => {
          console.log(doc);
          this.searchIndex.push(doc);
          builder.add(doc);
        });
      }
    });

    await Promise.all(promises);
    this.idx = builder.build();
  }
}
