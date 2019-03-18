import { Injectable, InjectionToken, Inject } from '@angular/core';

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
import { links, images } from '../../plugins/links';

import VFILE from 'vfile';
import { VFile } from '../../../vendor';

export const FOR_ROOT_OPTIONS_TOKEN = new InjectionToken<any>( 'forRoot() configuration.' );

@Injectable({
  providedIn: 'root'
})
export class MarkdownService {
  get processor() {
    if (this._processor) {
      return this._processor;
    }
    return this._processor = unified()
      .use(markdown)
      .use(this.config.plugins)
      .use(links, this.locationService)
      .use(images, this.locationService)
      .use(remark2rehype, { allowDangerousHTML: true })
      .use(raw)
      // TODO: rehype plugins
      .use(rehypeStringify);
  }

  get remarkPlugins() {
    return this.config.plugins;
  }

  private _processor: any;

  constructor(
    private locationService: LocationService,
    private fetchService: FetchService,
    private logger: NGXLogger,
    private hooksService: HooksService,
    @Inject(FOR_ROOT_OPTIONS_TOKEN) private config: any
  ) {
    if (this.config.reporter) {
      this.hooksService.hooks.doneEach.tap('logging', (page: any) => {
        this.logger.info(this.config.reporter(page));
      });
    }
  }

  /**
   *
   * @param page The page content path
   * @param content Plugins only run if page is the content page
   */
  getMd(page: string, content = true): Observable<VFILE.VFile>  {
    if (!page) {
      const _ = VFILE('');
      return of(_)
        .pipe(tap(() => this.hooksService.hooks.doneEach.call(_)));
    }

    const vf = this.locationService.pageToFile(page);
    return this.fetchService.get((vf as VFile).data.docspa.url)
      .pipe(
        flatMap(async (res: CachePage) => {
          if (res.notFound) {
            content = false;
          }

          // this.logger.debug(`Processing started: ${vf.path}`);

          vf.contents = res.contents;

          if (content) {
            await this.hooksService.hooks.beforeEach.promise(vf);
          }
          // This might eventually be a hook as well
          const err = await this.processor.process(vf);
          if (content) {
            await this.hooksService.hooks.afterEach.promise(vf);
            this.hooksService.hooks.doneEach.call(err || vf);
          }
          return vf;
        }),
        share()
      );
  }
}
