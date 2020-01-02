import {
  Component, ViewEncapsulation,
  OnInit, OnChanges, HostBinding,
  Input,
  ElementRef,
  SimpleChanges
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import VFILE from 'vfile';

import { MarkdownService } from '../markdown/markdown.service';
import { LocationService } from '../../services/location.service';
import { FetchService } from '../../services/fetch.service';
import { HooksService } from '../../services/hooks.service';
import { PageScrollService } from '../../services/page-scroll.service';

import { VFile } from '../../../vendor';
import { throttleable } from '../../shared/throttle';

const codefilesTypes = ['js', 'json'];

@Component({
  selector: 'docspa-md-include', // tslint:disable-line
  template: ``,
  encapsulation: ViewEncapsulation.None
})
export class EmbedMarkdownComponent implements OnInit, OnChanges {
  static readonly is = 'md-include';

  @Input()
  path = '';

  @Input()
  isPageContent = false;

  @Input()
  set safe(val: boolean) {
    this._safe = true;
  }
  get safe() {
    return this._safe === null ? this.isPageContent : this._safe;
  }

  @Input()
  scrollTo: string;

  @Input()
  codeblock: string = null;

  @Input()
  attr: string = null;

  @Input()
  collapseLists: boolean = false;

  @HostBinding('innerHTML')
  html: string | SafeHtml;

  private _safe: boolean = null;
  private tocLinks: HTMLAnchorElement[];

  constructor(
    private markdownService: MarkdownService,
    private sanitizer: DomSanitizer,
    private locationService: LocationService,
    private fetchService: FetchService,
    private hooks: HooksService,
    private elm: ElementRef,
    private pageScrollService: PageScrollService
  ) {
  }

  ngOnInit() {
    this.load();
    this.pageScrollService.updated.subscribe(() => this.markLinks());
    this.hooks.doneEach.tap('main-content-loaded', () => {
      this.getTocLinks();
      this.markLinks();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('path' in changes || 'plugins' in changes || 'safe' in changes) {
      this.load();
    } else if ('scrollTo' in changes) {
      this.doScroll();
    }
  }

  private async load(): Promise<string | SafeHtml> {
    const _vfile = await this.fetch();

    const { notFound } = _vfile.data.docspa;

    const ext = _vfile.extname.replace('.', '');

    let codeblock = this.codeblock;
    const bypassSecurity = this.safe && !notFound;

    if (!codeblock && codefilesTypes.includes(ext)) {
      codeblock = ext;
    }

    if (codeblock) {
      codeblock = codeblock + (this.attr ? ` ${this.attr}` : '');
      _vfile.contents = `~~~${codeblock}\n${_vfile.contents}\n~~~`;
    }

    await this.markdownService.process(_vfile);
    this.html = bypassSecurity ? this.sanitizer.bypassSecurityTrustHtml(_vfile.contents as string) : _vfile.contents;

    setTimeout(() => {
      this.doScroll();
      this.hooks.doneEach.call(_vfile);
    }, 30);

    return this.html;
  }

  private getTocLinks() {
    if (!this.collapseLists) return;
    this.tocLinks = Array.prototype.slice.call(this.elm.nativeElement.querySelectorAll('ul > li > a'));
  }

  private async fetch() {
    let _vfile: VFile;

    if (!this.path) {
      _vfile = VFILE('') as VFile;
      _vfile.data.docspa.notFound = true;
    } else {
      _vfile = this.locationService.pageToFile(this.path) as VFile;
      const { contents, notFound } = await this.fetchService.get(_vfile.data.docspa.url).toPromise();
      _vfile.data.docspa.notFound = notFound;
      _vfile.data.docspa.isPageContent = this.isPageContent;
      _vfile.contents = (!notFound || this.isPageContent) ? contents : `!> *File not found*\n!> ${this.path}`;
    }
    return _vfile;
  }

  // Scroll to current anchor
  private doScroll() {
    if (this.scrollTo) {
      try {
        const element = document.getElementById(this.scrollTo);
        element.scrollIntoView({
          block: 'start'
        });
      } catch (e) {
      }
    }
  }

  @throttleable(120)
  private markLinks() {
    if (this.collapseLists) this.pageScrollService.markLinks(this.tocLinks);
  }
}
