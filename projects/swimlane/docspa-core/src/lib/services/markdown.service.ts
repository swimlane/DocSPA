import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { flatMap, map, share } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';
import reporter from 'vfile-reporter';

import unified from 'unified';
import markdown from 'remark-parse';
import html from 'remark-html';

import { LocationService } from './location.service';
import { FetchService } from './fetch.service';
import { SettingsService } from './settings.service';
import { links, images } from '../plugins/links';

import { Page } from './page.model';

@Injectable({
  providedIn: 'root'
})
export class MarkdownService {
  processor: any;
  mdastProcessor: any;

  private beforeEach = [];
  private afterEach = [];
  private doneEach = [];

  constructor(
    private locationService: LocationService,
    private fetchService: FetchService,
    private logger: NGXLogger,
    private settings: SettingsService
  ) {
    if (settings.plugins.length > 0) {
      const vm = {
        config: settings,
        route: locationService
      };
      const hook = {
        init: fn => fn(), // Called when the script starts running, only trigger once, no arguments
        beforeEach: fn => this.beforeEach.push(fn), // Invoked each time before parsing the Markdown file
        afterEach: fn => this.afterEach.push(fn), // Invoked each time after the Markdown file is parsed
        doneEach: fn => this.doneEach.push(fn), // Invoked each time after the data is fully loaded, no arguments
        // mounted // Called after initial completion. Only trigger once, no arguments.
        // ready // Called after initial completion, no arguments.
      };

      // initialize docsify-link plugins
      settings.plugins.forEach(plugin => plugin(hook, vm));
    }

    this.processor = unified()
      .use(markdown)
      .use(this.settings.remarkPlugins)
      .use(links, locationService)
      .use(images, locationService)
      .use(html);
  }

  getMd(url: string, plugins = true): Observable<Page>  {
    let o: Observable<Page>;
    if (!url) {
      o = of(new Page({
        // url,
        timestampCached: Date.now(),
        text: '',
        html: '',
        notFound: false
      }));
    } else {
      o = this.fetchService.get(url)
        .pipe(
          flatMap((page: Page): Promise<Page> => {
            page.data = page.data || {};
            page.data.docspa = {};

            plugins = page.notFound ? false : plugins;

            // hack until fetchService consumes vpage
            const initialPath = this.locationService.stripBaseHref(url);
            const base = this.locationService.fixPage(initialPath);

            page.resolvedPath = url;
            page.history = [base, initialPath];
            page.cwd = this.locationService.root;

            // todo: caching of md -> html, beware of plugins that change content
            // todo: generate a cache TOC here?
            /* if (page.html) {
              return Promise.resolve(page);
            } */

            this.logger.debug(`Processing started: ${page.path}`);
            page.contents = plugins ?
              this.processBeforeEach(page.text) :
              page.text;

            return this.processor.process(page).then((err): Page => {
              page.html = plugins ?
                this.processAfterEach(String(page)) :
                String(page);
              this.logger.debug(reporter(err || page));
              return page;
            });
          }),
          share()
        );
    }

    if (plugins) {
      o.toPromise().then(() => {
        this.doneEach.forEach(fn => {
          setTimeout(fn, 30);
        });
      });
    }

    return o;
  }

  private processBeforeEach(_: string) {
    return this.beforeEach.reduce((_md, fn) => fn(_md), _);
  }

  private processAfterEach(_: string) {
    return this.afterEach.reduce((_html, fn) => fn(_html), _);
  }
}
