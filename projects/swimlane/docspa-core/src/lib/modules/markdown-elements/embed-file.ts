import {
  Component, ViewEncapsulation,
  OnInit, OnChanges, HostBinding, HostListener,
  Input,
  ElementRef, Renderer2,
  SimpleChanges
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { MarkdownService } from '../markdown/markdown.service';
import { LocationService } from '../../services/location.service';
import { FetchService } from '../../services/fetch.service';
import { HooksService } from '../../services/hooks.service';
import { splitHash } from '../../utils';

import { VFile } from '../../../vendor';
import VFILE from 'vfile';

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
  activeLink: string;

  @Input()
  activeAnchors: string = null;

  @Input()
  codeblock: string = null;

  @Input()
  attr: string = null;

  @HostBinding('innerHTML')
  html: string | SafeHtml;

  private _safe: boolean = null;

  constructor(
    private markdownService: MarkdownService,
    private sanitizer: DomSanitizer,
    private elm: ElementRef,
    private renderer: Renderer2,
    private locationService: LocationService,
    private fetchService: FetchService,
    private hooks: HooksService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('path' in changes || 'plugins' in changes || 'safe' in changes) {
      this.load();
    } else {
      if ('scrollTo' in changes) {
        this.doScroll();
      }
      if ('activeLink' in changes || 'activeAnchors' in changes) {
        this.markActiveLinks();
      }
    }
  }

  ngOnInit() {
    this.load().then(() => {
      this.hooks.doneEach.tap('update-links', () => {
        this.markActiveLinks();
      });
    });
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
    setTimeout(() => {
      this.markActiveLinks();
      this.doScroll();
      this.hooks.doneEach.call(_vfile);
    }, 30);

    this.html = bypassSecurity ? this.sanitizer.bypassSecurityTrustHtml(_vfile.contents as string) : _vfile.contents;
    return this.html;
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

  private isHashActive(hash: string) {
    if (!hash) return;
    const activeLink = this.activeLink.replace(/^\//, '');
    const parts = splitHash(hash);
    parts[0] = parts[0].replace(/^\//, '');
    if (activeLink === parts[0]) {
      return (this.activeAnchors === undefined || this.activeAnchors === null) ?
        true :
        this.activeAnchors.split(';').includes(parts[1]); // todo: split once
    }
    return false;
  }

  // Add 'active' class to links
  // TODO: move to TOC component?
  private markActiveLinks() {
    // if (this.activeLink) {
    //   const aObj = this.elm.nativeElement.getElementsByTagName('a');
    //   const activeLinks = [];
    //   for (let i = 0; i < aObj.length; i++) {
    //     const a = aObj[i];
    //     const active = this.isHashActive(a.getAttribute('href'));
    //     if (active) {
    //       activeLinks.push(a);
    //     }
    //     if (active) {
    //       this.renderer.addClass(a, 'active');
    //     } else {
    //       this.renderer.removeClass(a, 'active');
    //     }

    //     let p = a.parentNode;
    //     while (p && ['LI', 'UL', 'P'].includes(p.nodeName)) {
    //       if (active) {
    //         this.renderer.addClass(p, 'active');
    //       } else {
    //         this.renderer.removeClass(p, 'active');
    //       }
    //       p = p.parentNode;
    //     }
    //   }

    //   activeLinks.forEach(a => {
    //     let p = a.parentNode;
    //     while (p && ['LI', 'UL', 'P'].includes(p.nodeName)) {
    //       this.renderer.addClass(p, 'active');
    //       p = p.parentNode;
    //     }
    //   });
    // }
  }
}
