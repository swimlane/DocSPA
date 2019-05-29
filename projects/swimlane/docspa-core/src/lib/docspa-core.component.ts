import {
  Component, OnInit, ViewChild, Renderer2,
  HostListener, ViewEncapsulation, SimpleChanges,
  AfterViewInit, OnDestroy
} from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

import { VFile } from '../vendor';
import { HooksService } from './services/hooks.service';
import { RouterService } from './services/router.service';
import { SettingsService } from './services/settings.service';
import { splitHash } from './utils';

@Component({
  selector: 'lib-docspa-core,docspa-page,[docspa-page]',
  templateUrl: './docspa-core.component.html',
  styleUrls: ['./docspa-core.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DocSPACoreComponent implements OnInit, AfterViewInit, OnDestroy {
  contentPage: string;
  navbarPage: string;
  coverPage: string;
  sidebarPage: string;
  rightSidebarPage: string;
  footerPage: string;
  anchor: string;

  activeLink: string;
  activeAnchors: string;

  contentHeadings: any[];

  @ViewChild('coverMain', {static: false}) coverMain: any;

  private sidebarClose = false;

  constructor(
    private settings: SettingsService,
    private routerService: RouterService,
    private renderer: Renderer2,
    private titleService: Title,
    private metaService: Meta,
    private hooks: HooksService
  ) {
  }

  // TODO: Move to a scroll spy event on EmbedMarkdownComponent
  @HostListener('window:scroll', [])
  onWindowScroll() {
    let add = true;
    let coverHeight = 0;
    if (this.coverMain) {
      const cover = this.coverMain.nativeElement;
      coverHeight = cover.getBoundingClientRect().height;
      add = window.pageYOffset >= coverHeight || cover.classList.contains('hidden');
    }

    if (add) {
      this.renderer.addClass(document.body, 'sticky');
    } else {
      this.renderer.removeClass(document.body, 'sticky');
    }

    if (this.contentHeadings) {
      const fromTop = window.scrollY - 60 - coverHeight;
      const fromBottom = window.scrollY + window.innerHeight + 60 - coverHeight;

      let lastLink = null;
      const current = this.contentHeadings
        .filter(link => {
          const offsetBottom = link.offsetTop + link.offsetHeight;
          const past = offsetBottom <= fromBottom;
          if (past) {
            lastLink = link;
          }
          return link.offsetTop >= fromTop && offsetBottom <= fromBottom;
        })
        .map(link => splitHash(link.getAttribute('href'))[1]);

      if (current && current.length > 0) {
        this.activeAnchors = current.join(';');
      } else if (lastLink) {
        this.activeAnchors = splitHash(lastLink.getAttribute('href'))[1];
      } else {
        this.activeAnchors = '';
      }
    }
  }

  toggleSidebar(nextState: boolean = !this.sidebarClose) {
    this.sidebarClose = nextState;
    localStorage.setItem('DocSPACoreComponent#sidebarClose', String(this.sidebarClose));
    if (this.sidebarClose) {
      this.renderer.addClass(document.body, 'close');
    } else {
      this.renderer.removeClass(document.body, 'close');
    }
  }

  ngOnInit() {
    const sidebar = localStorage.getItem('DocSPACoreComponent#sidebarClose') || 'false';
    this.toggleSidebar(sidebar === 'true');
    this.routerService.changed.subscribe((changes: SimpleChanges) => this.pathChanges(changes));
    this.routerService.onInit();
    this.hooks.mounted.call();
  }

  ngAfterViewInit() {
    this.hooks.ready.call();
  }

  ngOnDestroy() {
    this.hooks.destroy.call();
  }

  mainContentLoaded(page: VFile) {
    let title = this.settings.name;
    let subTitle: string;
    if (page.data) {
      if (page.data.matter && page.data.matter.title) {
        subTitle = page.data.matter.title;
      } else if (page.data.title) {
        subTitle = page.data.title;
      }
    }
    if (subTitle && subTitle !== title) {
      title += ' - ' + subTitle;
    }

    // TODO: move these to a plugin, make optional
    this.titleService.setTitle(title);

    ['description', 'keywords', 'author'].forEach(name => {
      const content = page.data && page.data.matter && page.data.matter[name] || this.settings.meta[name];
      if (content) {
        this.metaService.updateTag({ name: name, content });
      } else {
        this.metaService.removeTag(name);
      }
    });

    this.renderer.addClass(document.body, 'ready');
    this.contentHeadings = [].slice.call(document.querySelectorAll('h1[id] a, h2[id] a, h3[id] a'));

    this.onWindowScroll();
  }

  private pathChanges(changes: SimpleChanges) {
    if ('anchor' in changes) {
      this.anchor = changes.anchor.currentValue;
    }

    if ('contentPage' in changes && this.contentPage !== changes.contentPage.currentValue) {
      this.contentPage = changes.contentPage.currentValue;
      this.activeLink = this.contentPage;

      // if the page changes, and no anchor is given, scroll top the top
      if ('anchor' in changes && changes.anchor.currentValue === '') {
        this.anchor = 'coverPage' in changes ? 'cover-top' : 'content-top';
      }
    }

    if ('coverPage' in changes) {
      this.coverPage = changes.coverPage.currentValue;
    }

    if (changes.sideLoad) {
      const sideLoad = changes.sideLoad.currentValue;
      this.sidebarPage = sideLoad.sidebar;
      this.navbarPage = sideLoad.navbar;
      this.rightSidebarPage = sideLoad.rightSidebar;
      this.footerPage = sideLoad.footer;
    }

    // TODO: ready event from sub components?
    setTimeout(() => {
      if ('coverPage' in changes) {
        this.onWindowScroll();
      }
    }, 30);
  }
}
