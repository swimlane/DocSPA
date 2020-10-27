import { Component, Input, OnChanges, OnInit, ViewEncapsulation } from '@angular/core';

import lunr, { Builder, stopWordFilter } from 'lunr';

import { join, splitHash } from '@swimlane/docspa-core/lib/shared/utils';

import { FetchService, MarkdownService } from '@swimlane/docspa-core';
import { LocationService } from '@swimlane/docspa-core';
import { escapeRegexp, extractAndHighlight, highlight } from './utils';

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

  private _paths: string[];

  searchIndex: { [key: string]: any };
  searchResults: any[];

  pageIndex = 0;
  pageSize = 5;

  idx: lunr.Index;

  constructor(
    private fetchService: FetchService,
    private locationService: LocationService,
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
      this.paths = await this.fetchSummary(this.summary);
    }
    return this.generateSearchIndex(this.paths);
  }

  search(queryTerm: string) {
    if (typeof queryTerm !== 'string' || queryTerm.trim() === '') {
      this.searchResults = null;
      return;
    }

    queryTerm = queryTerm.toLowerCase();
    const reQuery = escapeRegexp(queryTerm);

    this.pageIndex = 0;

    // const results = this.idx.query(q => {
    //   // look for an exact match and apply a large positive boost
    //   q.term(queryTerm, { usePipeline: true, boost: 100 });

    //   // look for terms that match the beginning of this queryTerm and apply a medium boost
    //   q.term(queryTerm, { usePipeline: true, wildcard: lunr.Query.wildcard.TRAILING, boost: 10 });

    //   // look for partial match and apply a small boost
    //   // tslint:disable-next-line: no-bitwise
    //   q.term(queryTerm, { wildcard: lunr.Query.wildcard.LEADING | lunr.Query.wildcard.TRAILING, usePipeline: true, boost: 1 });
    // });

    if (!queryTerm.includes('*')) {
      queryTerm = '*' + queryTerm + '*';
    }
    const results = this.idx.search(queryTerm);

    this.searchResults = results.map(r => {
        const ref = r.ref;

        // tslint:disable-next-line: prefer-const
        let [link, fragment] = splitHash(ref);
        fragment = fragment.replace(/^#/, '');

        const match = this.searchIndex[ref];

        let heading: string = match.heading || '';
        let name: string = match.page || match.name;

        name = highlight(name, reQuery);
        heading = highlight(heading, reQuery);

        const result = {
          ...r,
          ...match,
          heading,
          name,
          link,
          fragment
        };

        // Checks if text was part of the match
        const hasTextMatch = Object.keys(r.matchData.metadata).some(k => !!r.matchData.metadata[k].text);

        if (hasTextMatch) {
          // Lazy loads text
          this.fetchSections(link).then(sections => {
            const { text } = sections.find(s => s.id === fragment);
            result.text = extractAndHighlight(text, reQuery, queryTerm.length);
          });
        }

        return result;
      });
  }

  onPageChange($event: {pageSize: number, pageIndex: number }) {
    this.pageSize = $event.pageSize;
    this.pageIndex = $event.pageIndex;
  }

  private async fetchSummary(summary: string) {
    const vfile = this.locationService.pageToFile(summary);
    const fullPath = join(vfile.cwd, vfile.path);
    const resource = await this.fetchService.get(fullPath).toPromise();
    if (resource.notFound) {
      return [];
    }
    vfile.contents = resource.contents;
    vfile.data = vfile.data || {};
    const links = await this.markdownService.getTocLinks(vfile);
    return links.map(__ => __.url);
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
    builder.field('page', { boost: 100 });
    builder.field('heading', { boost: 10 });
    builder.field('text');
    // TODO: tags??

    this.searchIndex = {};

    const promises = paths.map(async p => {
      const sections = await this.fetchSections(p);

      if (sections) {
        sections.forEach(s => {
          const url = `${s.source}#${s.id}`;

          // keep quick reference to page name and heading
          this.searchIndex[url] = {
            name: s.name,
            page: s.depth === 1 ? s.heading : '',
            heading: s.depth > 1 ? s.heading : ''
          };

          // add page name, heading, and full tex to the index
          builder.add({
            url,
            ...s,
            ...this.searchIndex[url]
          });
        });
      }
    });

    // wait tell all docs are added to the index
    await Promise.all(promises);

    // todo: store index in localstorage?
    this.idx = builder.build();
  }

  private async fetchSections(path: string) {
    const vfile = this.locationService.pageToFile(path);
    const fullPath = join(vfile.cwd, vfile.path);

    const resource = await this.fetchService.get(fullPath).toPromise();
    vfile.contents = resource.contents;
    vfile.data = vfile.data || {};

    return resource.notFound ? null : await this.markdownService.getSections(vfile);
  }
}
