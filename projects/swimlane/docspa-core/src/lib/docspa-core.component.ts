import { Component, OnInit, ViewChild, Renderer, HostListener, ViewEncapsulation, SimpleChanges } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import VFile from 'vfile';

import { RouterService } from './services/router.service';
import { SettingsService } from './services/settings.service';

interface Changes {
  contentPage: string;
  coverPage: string;
  anchor: string;
  sideLoad: [string];
}

@Component({
  selector: 'lib-docspa-core,docspa-page,[docspa-page]',
  templateUrl: './docspa-core.component.html',
  styleUrls: ['./docspa-core.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DocSPACoreComponent implements OnInit {
  contentPage: string;
  navbarPage: string;
  coverPage: string;
  sidebarPage: string;
  rightSidebarPage: string;
  footerPage: string;
  anchor: string;

  activeLink: string;
  activeAnchors: string;

  contentHeadings: any;

  @ViewChild('coverMain') coverMain: any;

  private sidebarClose = false;

  constructor(
    private settings: SettingsService,
    private routerService: RouterService,
    private renderer: Renderer,
    private titleService: Title,
    private metaService: Meta
  ) {
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    let add = true;
    if (this.coverMain) {
      const cover = this.coverMain.nativeElement;
      const coverHeight = cover.getBoundingClientRect().height;
      add = window.pageYOffset >= coverHeight || cover.classList.contains('hidden');
    }
    this.renderer.setElementClass(document.body, 'sticky', add);

    if (this.contentHeadings) {
      const fromTop = window.scrollY - 60;
      const fromBottom = window.scrollY + window.innerHeight + 60;

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
        .map(link => this.splitHash(link.hash)[1]);

      if (current && current.length > 0) {
        this.activeAnchors = current.join(';');
      } else if (lastLink) {
        this.activeAnchors = this.splitHash(lastLink.hash)[1];
      } else {
        this.activeAnchors = '';
      }
    }
  }

  toggleSidebar() {
    this.sidebarClose = !this.sidebarClose;
    this.renderer.setElementClass(document.body, 'close', this.sidebarClose);
  }

  ngOnInit() {
    this.routerService.changed.subscribe((changes: SimpleChanges) => this.pathChanges(changes));
    this.routerService.onInit();
  }

  mainContentLoaded(page: VFile) {
    let title = this.settings.name;
    let subTitle;
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
    this.titleService.setTitle(title);

    ['description', 'keywords', 'author'].forEach(name => {
      const content = page.data && page.data.matter && page.data.matter[name] || this.settings.meta[name];
      if (content) {
        this.metaService.updateTag({ name: name, content });
      } else {
        this.metaService.removeTag(name);
      }
    });

    this.renderer.setElementClass(document.body, 'ready', true);
    this.contentHeadings = [].slice.call(document.querySelectorAll('h1[id] > a, h2[id] > a, h3[id] > a'));

    this.onWindowScroll();
  }

  private pathChanges(changes: SimpleChanges) {
    if ('contentPage' in changes && this.contentPage !== changes.contentPage.currentValue) {
      this.renderer.setElementClass(document.body, 'ready', false);
      this.contentPage = changes.contentPage.currentValue;
      this.activeLink = this.splitHash(document.location.hash)[0];
    }

    if ('coverPage' in changes) {
      this.coverPage = changes.coverPage.currentValue;
    }

    if (changes.sideLoad) {
      const sideLoad = changes.sideLoad.currentValue;
      this.sidebarPage = sideLoad[0];
      this.navbarPage = sideLoad[1];
      this.rightSidebarPage = sideLoad[2];
      this.footerPage = sideLoad[3];
    }

    if ('anchor' in changes) {
      this.anchor = changes.anchor.currentValue;
    }

    // TODO: ready event from sub components?
    setTimeout(() => {
      if ('coverPage' in changes) {
        this.onWindowScroll();
      }
    }, 30);
  }

  private splitHash(hash: string) {
    const arr = [hash, ''];
    const idx = hash.indexOf('#', 1);
    if (idx > 0) {
      arr[0] = hash.slice(0, idx);
      arr[1] = hash.slice(idx);
    }
    return arr;
  }
}
