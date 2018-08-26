import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { flatMap, map, share } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';
import reporter from 'vfile-reporter';
import * as path from 'path';

import unified from 'unified';
import markdown from 'remark-parse';
import html from 'remark-html';

import { LocationService } from './location.service';
import { FetchService, CachePage } from './fetch.service';
import { SettingsService } from './settings.service';
import { links, images } from '../plugins/links';

import VFile from 'vfile';

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

  /**
   *
   * @param page The page content path
   * @param plugins Run plugins?
   */
  getMd(page: string, plugins = true): Observable<VFile>  {
    let o: Observable<VFile>;
    if (!page) {
      o = of(new VFile(''));
    } else {
      const vfile = this.locationService.pageToFile(page);
      const url = path.join(vfile.cwd, vfile.path);
      o = this.fetchService.get(url)
        .pipe(
          flatMap((res: CachePage): Promise<VFile> => {
            vfile.data = vfile.data || {};
            vfile.data.docspa = {};

            plugins = res.notFound ? false : plugins;

            this.logger.debug(`Processing started: ${vfile.path}`);
            vfile.contents = plugins ?
              this.processBeforeEach(res.contents) :
              res.contents;

            return this.processor.process(vfile).then((err): VFile => {
              vfile.contents = plugins ?
                this.processAfterEach(String(vfile)) :
                String(vfile);
              this.logger.debug(reporter(err || page));
              return vfile;
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
