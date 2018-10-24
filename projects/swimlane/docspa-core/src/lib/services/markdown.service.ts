import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { flatMap, map, share } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';
import reporter from 'vfile-reporter';
import { join } from '../utils';

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

  vm = {  // Mock docsify vm for docsify plugins
    config: this.settings,
    route: {
      file: ''
    }
  };

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
      const hook = {
        init: fn => fn(), // Called when the script starts running, only trigger once, no arguments
        beforeEach: fn => this.beforeEach.push(fn), // Invoked each time before parsing the Markdown file
        afterEach: fn => this.afterEach.push(fn), // Invoked each time after the Markdown file is parsed
        doneEach: fn => this.doneEach.push(fn), // Invoked each time after the data is fully loaded, no arguments
        // mounted // Called after initial completion. Only trigger once, no arguments.
        // ready // Called after initial completion, no arguments.
      };

      // initialize docsify-link plugins
      settings.plugins.forEach(plugin => plugin(hook, this.vm));
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
      const url = join(vfile.cwd, vfile.path);
      o = this.fetchService.get(url)
        .pipe(
          flatMap(async (res: CachePage) => {
            vfile.data = vfile.data || {};
            vfile.data.docspa = {};

            plugins = res.notFound ? false : plugins;

            this.logger.debug(`Processing started: ${vfile.path}`);
            vfile.contents = plugins ?
              this.processBeforeEach(res) :
              res.contents;

            const err = await this.processor.process(vfile);

            vfile.contents = plugins ?
              this.processAfterEach(vfile) :
              String(vfile);

            if (plugins) {
              this.logger.info(reporter(err || page));
            }
            return vfile;
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

  private processBeforeEach(page: CachePage) {
    this.vm.route.file = page.resolvedPath;
    return this.beforeEach.reduce((_md, fn) => fn(_md), page.contents);
  }

  private processAfterEach(page: VFile) {
    this.vm.route.file = page.history[1].replace(/^\//, '');
    return this.afterEach.reduce((_html, fn) => fn(_html), page.contents);
  }
}
