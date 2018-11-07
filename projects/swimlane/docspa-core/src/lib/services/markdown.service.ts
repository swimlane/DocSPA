import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { flatMap, tap, share } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';

import unified from 'unified';
import markdown from 'remark-parse';
import reporter from 'vfile-reporter';
import remark2rehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import raw from 'rehype-raw';

import { AsyncSeriesWaterfallHook, SyncHook } from 'tapable';

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

  // Eventually these will be global hooks
  // Modified by plugins
  hooks = {
    beforeEach: new AsyncSeriesWaterfallHook(['vfile']),
    afterEach: new AsyncSeriesWaterfallHook(['vfile']),
    doneEach: new SyncHook(['vfile'])
  };

  constructor(
    private locationService: LocationService,
    private fetchService: FetchService,
    private logger: NGXLogger,
    private settings: SettingsService
  ) {
    if (settings.plugins.length > 0) {
      this.importDocsifyPlugins(settings.plugins);
    }

    // TODO: make a DocSPA plugin
    this.hooks.doneEach.tap('logging', page => {
      this.logger.info(reporter(page));
    });

    this.processor = unified()
      .use(markdown)
      .use(this.settings.remarkPlugins)
      .use(links, locationService)
      .use(images, locationService)
      .use(remark2rehype, { allowDangerousHTML: true })
      .use(raw)
      // TODO: rehype plugins
      .use(rehypeStringify);
  }

  // Convert docsify plugins to internal hooks
  // This may eventually be a DocSPA plugin
  importDocsifyPlugins(plugins: any[]) {
    const vm = {  // Mock docsify vm for docsify plugins
      config: this.settings,
      route: {
        file: ''
      }
    };

    const beforeEach = fn => {
      // todo: async
      this.hooks.beforeEach.tap('docsify-beforeEach', (vfile: VFile) => {
        vm.route.file = vfile.data.docspa.url;
        vfile.contents = fn(vfile.contents);
        return vfile;
      });
    };

    const afterEach = fn => {
      // todo: async
      this.hooks.afterEach.tap('docsify-afterEach', (vfile: VFile) => {
        vm.route.file = vfile.history[1].replace(/^\//, '');
        vfile.contents = fn(vfile.contents);
        return vfile;
      });
    };

    const doneEach = fn => {
      this.hooks.doneEach.tap('docsify-doneEach', () => {
        setTimeout(() => {  // get rid of this, could be called after component renders
          return fn();
        }, 30);
      });
    };

    const hook = {
      init: fn => fn(), // Called when the script starts running, only trigger once, no arguments
      beforeEach, // Invoked each time before parsing the Markdown file
      afterEach, // Invoked each time after the Markdown file is parsed
      doneEach, // Invoked each time after the data is fully loaded, no arguments
      // mounted // Called after initial completion. Only trigger once, no arguments.
      // ready // Called after initial completion, no arguments.
    };

    // initialize docsify plugins
    plugins.forEach(plugin => plugin(hook, vm));
  }

  /**
   *
   * @param page The page content path
   * @param content Plugins only run if page is the content page
   */
  getMd(page: string, content = true): Observable<VFile>  {
    if (!page) {
      const _ = new VFile('');
      return of(_)
        .pipe(tap(() => this.hooks.doneEach.call(_)));
    }

    const vfile = this.locationService.pageToFile(page);
    return this.fetchService.get(vfile.data.docspa.url)
      .pipe(
        flatMap(async (res: CachePage) => {
          if (res.notFound) {
            content = false;
          }

          this.logger.debug(`Processing started: ${vfile.path}`);

          vfile.contents = res.contents;

          if (content) {
            await this.hooks.beforeEach.promise(vfile);
          }
          // This might eventually be a hook as well
          const err = await this.processor.process(vfile);
          if (content) {
            await this.hooks.afterEach.promise(vfile);
            this.hooks.doneEach.call(err || vfile);
          }
          return vfile;
        }),
        share()
      );
  }
}
