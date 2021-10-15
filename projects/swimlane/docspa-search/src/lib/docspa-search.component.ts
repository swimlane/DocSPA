import { Component, Input, OnChanges, OnInit, ViewEncapsulation } from '@angular/core';

import { Observable, defer } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import lunr, { tokenizer, Builder, stopWordFilter } from 'lunr';

import { FetchService, MarkdownService, LocationService } from '@swimlane/docspa-core';
import { escapeRegexp, getExcerpt, highlight, join, splitHash } from './utils';

interface MatchIndex {
  heading: string;
  name: string;
  page: string;
}

interface MatchResult {
  heading: string;
  name: string;
  link: string;
  fragment: string;
  text$?: Observable<string>;
  ref: string;
  score: number;
  routerLink: string | string[];
}

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
  minLength = 3;

  private _paths: string[];

  queryTerm: string;
  searchIndex: { [key: string]: MatchIndex };
  searchResults: MatchResult[];

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
    this.queryTerm = queryTerm;
    this.pageIndex = 0;
    this.searchResults = null;

    if (typeof queryTerm !== 'string' || queryTerm.trim() === '' || queryTerm.length < this.minLength) {
      return;
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

      // // highlight each term
      // queryRegexps.forEach(re => {
      //   name = highlight(name, re);
      //   heading = highlight(heading, re);
      // });

      let routerLink: string | string[] = link;
      // Hack to preserve trailing slash
      if (typeof routerLink === 'string' && routerLink.length > 1 && routerLink.endsWith('/')) {
        routerLink = [routerLink, ''];
      }

      const metadata = r?.matchData?.metadata || {};
      const matchWords = Object.keys(r.matchData.metadata);

      // highlight each term
      matchWords.forEach(word => {
        const re = escapeRegexp(word);
        if ('page' in metadata[word]) {
          name = highlight(name, re);
        }
        if ('heading' in metadata[word]) {
          heading = highlight(heading, re);
        }
      });

      // result for a single document match
      const result: MatchResult = {
        ...r,
        ...match,
        heading,
        name,
        link,
        fragment,
        routerLink
      };

      // Checks if text was part of the match
      const hasTextMatch = matchWords.some(k => !!metadata[k].text);

      if (hasTextMatch) {
        const queryRegexps = matchWords.map(t => escapeRegexp(t));

        // Lazy loads text, defered untill loaded
        result.text$ = defer(async () => {
          const sections = await this.fetchSections(link);

          // get raw text for the section
          const section = sections.find(s => s.id === fragment);
          if (!section) { return; }  // defensive

          const { text } = section;

          // find index of term that matches first
          let index = 0;
          let position = Infinity;
          queryRegexps.forEach((_, idx) => {
            const i = text.search(_);
            if (i < position) {
              index = idx;
              position = i;
            }
          });

          let excerpt = getExcerpt(text, queryRegexps[index], matchWords[index].length);

          // highlight each term
          queryRegexps.forEach((_, _i) => {
            excerpt = highlight(excerpt, _);
          });

          return excerpt;
        }).pipe(shareReplay(1));
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

          // add page name, heading, and full text to the index
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
