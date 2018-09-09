import { Component, Input, OnInit, ViewEncapsulation, HostBinding, SimpleChanges } from '@angular/core';

import { of } from 'rxjs';
import { flatMap, map, share } from 'rxjs/operators';
import unified from 'unified';
import markdown from 'remark-parse';
import html from 'remark-html';
import toc from 'mdast-util-toc';
import visit from 'unist-util-visit';
import slug from 'remark-slug';
import { join } from '../utils';

import { FetchService } from '../services/fetch.service';
import { RouterService } from '../services/router.service';
import { LocationService } from '../services/location.service';

import { links, images } from '../plugins/links';
import frontmatter from 'remark-frontmatter';

@Component({
  selector: 'md-toc', // tslint:disable-line
  template: ``,
  encapsulation: ViewEncapsulation.None
})
export class TOCComponent implements OnInit {
  static readonly is = 'md-toc';

  @Input()
  set path(val: string) {
    if (val !== this._path) {
      this._path = val;
      this.load(this.path);
    }
  }
  get path() {
    return this._path;
  }

  @Input()
  minDepth = 1;

  @Input()
  public maxDepth = 6;

  @Input()
  public tight = false;

  @HostBinding('innerHTML')
  html: string;

  private processor: any;
  private _path: string;

  constructor(
    private fetchService: FetchService,
    private routerService: RouterService,
    private locationService: LocationService
  ) {
    const toToc = () => {
      return (tree) => {
        const result = toc(tree, { maxDepth: this.maxDepth, tight: this.tight });
        tree.children = [].concat(
          tree.children.slice(0, result.index),
          result.map || []
        );
      };
    };

    const removeMinNodes = () => {
      return tree => {
        visit(tree, 'heading', (node, index, parent) => {
          if (node.depth < this.minDepth) {
            parent.children.splice(index, 1);
          }
        });
      };
    };

    this.processor = unified()
      .use(markdown)
      .use(frontmatter)
      .use(slug)
      .use(removeMinNodes)
      .use(toToc)
      .use(links, locationService)
      .use(images, locationService)
      .use(html);
  }

  ngOnInit() {
    if (!this.path) {
      this.path = this.routerService.contentPage;
      this.routerService.changed.subscribe((changes: SimpleChanges) => {
        if ('contentPage' in changes) {
          this.path = changes.contentPage.currentValue;
        }
      });
    } else {
      this.load(this.path);
    }
  }

  private load(page: string) {
    if (typeof page !== 'string' || page.trim() === '') {
      return of(null);
    }

    const vfile = this.locationService.pageToFile(page);
    const fullpath = join(vfile.cwd, vfile.path);
    this.fetchService.get(fullpath)
      .pipe(
        flatMap(resource => {
          vfile.contents = resource.contents;
          vfile.data = vfile.data || {};

          // TODO: might need to run plugins if headers change
          return resource.notFound ? of('') : this.processor.process(vfile);
        }),
        map(String),
        share()
      ).subscribe(_ => {
        this.html = _;
      });
  }
}
