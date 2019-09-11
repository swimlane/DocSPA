import { Injectable, InjectionToken, Inject, Optional } from '@angular/core';

import { Observable, of } from 'rxjs';
import { flatMap, tap, share } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';

import unified from 'unified';
import markdown from 'remark-parse';
import remark2rehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import raw from 'rehype-raw';

import { LocationService } from '../../services/location.service';
import { FetchService, CachePage } from '../../services/fetch.service';
import { HooksService } from '../../services/hooks.service';
import { links, images } from '../../shared/links';

import VFILE from 'vfile';
import { VFile } from '../../../vendor';

export const MARKDOWN_CONFIG_TOKEN = new InjectionToken<any>( 'forRoot() configuration.' );

interface Preset extends unified.Preset {
  reporter?: (vfile: VFile) => {};
}

@Injectable({
  providedIn: 'root'
})
export class MarkdownService {
  get processor(): unified.Processor {
    if (this._processor) {
      return this._processor;
    }
    return this._processor = unified()
      .use(markdown)
      .use(this.config)
      .use(links, this.locationService)
      .use(images, this.locationService)
      .use(remark2rehype, { allowDangerousHTML: true })
      .use(raw)
      // TODO: rehype plugins
      .use(rehypeStringify);
  }

  get remarkPlugins(): unified.PluggableList {
    if (Array.isArray(this.config)) {
      return this.config;
    }
    return this.config.plugins;
  }

  private _processor: any;

  constructor(
    private locationService: LocationService,
    private fetchService: FetchService,
    private logger: NGXLogger,
    private hooks: HooksService,
    @Optional() @Inject(MARKDOWN_CONFIG_TOKEN) private config: Preset
  ) {
    this.config = this.config || {};
    this.config.plugins = this.config.plugins || [];

    if (this.config.reporter) {
      this.hooks.doneEach.tap('logging', (page: any) => {
        this.logger.info(this.config.reporter(page));
      });
    }
  }

  /**
   *
   * @param page The page content path
   * @param runPlugins Plugins only run if page is the content page
   */
  getMd(page: string, runPlugins = true): Observable<VFILE.VFile>  {
    if (!page) {
      const _ = VFILE('');
      return of(_)
        .pipe(tap(() => this.hooks.doneEach.call(_)));
    }

    const vf = this.locationService.pageToFile(page) as VFile;
    return this.fetchService.get(vf.data.docspa.url)
      .pipe(
        flatMap(async (res: CachePage) => {
          vf.data.docspa.noFound = res.notFound;
          if (res.notFound) {
            runPlugins = false;
          }

          // this.logger.debug(`Processing started: ${vf.path}`);

          vf.contents = res.contents;
          return this.processMd(vf, runPlugins);
        }),
        share()
      );
  }

  /**
   *
   * @param page The page content path
   * @param runPlugins Plugins only run if page is the content page
   */
  async processMd(vf: VFile, runPlugins: boolean): Promise<VFILE.VFile> {
    if (runPlugins) {
      await this.hooks.beforeEach.promise(vf);
    }

    // This might eventually be a hook as well
    const err = await this.processor.process(vf);

    if (runPlugins) {
      await this.hooks.afterEach.promise(vf);
      this.hooks.doneEach.call(err || vf);
    }
    return vf;
  }
}
