import {
  Component, ViewEncapsulation,
  OnInit, OnChanges, HostBinding, HostListener,
  Input, Output, EventEmitter,
  ElementRef, Renderer2,
  SimpleChanges
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { MarkdownService } from '../markdown/markdown.service';
import { LocationService } from '../../services/location.service';
import { RouterService } from '../../services/router.service';
import { splitHash } from '../../utils';

import * as vfile from 'vfile';

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
  plugins = false;

  @Input()
  safe = false;

  @Input()
  scrollTo: string;

  @Input()
  activeLink: string;

  @Input()
  activeAnchors: string = null;

  @Input()
  codeblock: string = null;

  @Output() done: EventEmitter<vfile.VFile> = new EventEmitter();

  @HostBinding('innerHTML')
  html: string | SafeHtml;

  @HostListener('click', ['$event'])
  onClickBtn = this.routerService.clickHandler;

  constructor(
    private markdownService: MarkdownService,
    private routerService: RouterService,
    private sanitizer: DomSanitizer,
    private elm: ElementRef,
    private renderer: Renderer2,
    private locationService: LocationService
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
    this.load();
  }

  private load() {
    if (!this.codeblock) {
      return this.markdownService.getMd(this.path, this.plugins)
        .subscribe(_vfile => {
          setTimeout(() => {
            this.markActiveLinks();
            this.doScroll();
            this.done.emit(_vfile);
          }, 30);
          this.html = this.safe ? this.sanitizer.bypassSecurityTrustHtml(_vfile.contents as string) : _vfile.contents;
        });
    }

    const vf: any = this.locationService.pageToFile(this.path);
    return fetch(vf.data.docspa.url).then(res => res.text()).then(async contents => {
      vf.contents = `~~~${this.codeblock}\n${contents}\n~~~`;
      await this.markdownService.processor.process(vf);
      await this.markdownService.processMd(true, vf);
      this.html = this.safe ? this.sanitizer.bypassSecurityTrustHtml(vf.contents) : vf.contents;
    });
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
  private markActiveLinks() {
    if (this.activeLink) {
      const aObj = this.elm.nativeElement.getElementsByTagName('a');

      const activeLinks = [];
      for (let i = 0; i < aObj.length; i++) {
        const a = aObj[i];
        const active = this.isHashActive(a.getAttribute('href'));
        if (active) {
          activeLinks.push(a);
        }
        if (active) {
          this.renderer.addClass(a, 'active');
        } else {
          this.renderer.removeClass(a, 'active');
        }

        let p = a.parentNode;
        while (p && ['LI', 'UL', 'P'].includes(p.nodeName)) {
          if (active) {
            this.renderer.addClass(p, 'active');
          } else {
            this.renderer.removeClass(p, 'active');
          }
          p = p.parentNode;
        }
      }

      activeLinks.forEach(a => {
        let p = a.parentNode;
        while (p && ['LI', 'UL', 'P'].includes(p.nodeName)) {
          this.renderer.addClass(p, 'active');
          p = p.parentNode;
        }
      });
    }
  }
}
