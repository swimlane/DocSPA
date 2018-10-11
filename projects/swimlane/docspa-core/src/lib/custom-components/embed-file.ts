import {
  Component, ViewEncapsulation,
  OnInit, OnChanges, HostBinding,
  Input, Output, EventEmitter,
  ElementRef, Renderer
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { Observable } from 'rxjs';

import { LocationService } from '../services/location.service';
import { MarkdownService } from '../services/markdown.service';
import { splitHash } from '../utils';

import VFile from 'vfile';

@Component({
  selector: 'docspa-md-embed', // tslint:disable-line
  template: ``,
  encapsulation: ViewEncapsulation.None
})
export class EmbedMarkdownComponent implements OnInit, OnChanges {
  static readonly is = 'md-embed';

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

  @Output() done: EventEmitter<VFile> = new EventEmitter();

  content: Observable<string | SafeHtml>;

  @HostBinding('innerHTML')
  html: string | SafeHtml;

  constructor(
    private locationService: LocationService,
    private markdownService: MarkdownService,
    private sanitizer: DomSanitizer,
    private elm: ElementRef,
    private renderer: Renderer
  ) {
  }

  ngOnChanges(changes) {
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
    this.markdownService.getMd(this.path, this.plugins)
    .subscribe(vfile => {
      setTimeout(() => {
        this.markActiveLinks();
        this.doScroll();
        this.done.emit(vfile);
      }, 30);
      this.html = this.safe ? this.sanitizer.bypassSecurityTrustHtml(vfile.contents) : vfile.contents;
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
        this.renderer.setElementClass(a, 'active', active);

        let p = a.parentNode;
        while (p && ['LI', 'UL', 'P', 'MD-LINK'].includes(p.nodeName)) {
          this.renderer.setElementClass(p, 'active', active);
          p = p.parentNode;
        }
      }

      activeLinks.forEach(a => {
        let p = a.parentNode;
        while (p && ['LI', 'UL', 'P', 'MD-LINK'].includes(p.nodeName)) {
          this.renderer.setElementClass(p, 'active', true);
          p = p.parentNode;
        }
      });
    }
  }
}
