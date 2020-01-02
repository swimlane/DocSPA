import { Injectable, EventEmitter, Renderer2, RendererFactory2 } from '@angular/core';

import { HooksService } from './hooks.service';
import { VFile } from '../../vendor';

@Injectable({
  providedIn: 'root'
})
export class PageScrollService {
  updated: EventEmitter<Set<string>> = new EventEmitter();

  private intersectionObserver: IntersectionObserver;
  private inScrollHashes = new Set<string>();
  private renderer: Renderer2;

  constructor(private hooks: HooksService, rendererFactory2: RendererFactory2) {
    this.renderer = rendererFactory2.createRenderer(null, null);
    this.hooks.doneEach.tap('main-content-loaded', (page: VFile) => {
      if (page.data.docspa.isPageContent) {
        this.setupPageListeners();
      }
    });
  }

  markLinks(links: HTMLAnchorElement[]) {
    if (!links) return;

    // clear
    for (let i = 0; i < links.length; i++) {
      const a = links[i];
      this.renderer.removeClass(a, 'active');
      this.updateTree(a, false);
    }

    // set
    for (let i = 0; i < links.length; i++) {
      const a = links[i];
      if (this.isLinkActive(a)) {
        if (this.isHashActive(a)) {
          this.renderer.addClass(a, 'active');
        }
        this.updateTree(a, true);
      }
    }
  }

  /**
   * Determines if a link is active (requires router-link-active)
   * @param a
   */
  isLinkActive(a: HTMLAnchorElement) {
    return a.classList.contains('router-link-active');
  }

  /**
   * Determines if a link's hash is active
   * @param a
   */
  isHashActive(a: HTMLAnchorElement) {
    const hash = a.hash.replace(/^#/, '');
    return !hash || this.inScrollHashes.has(hash);
  }

  updateTree(elem: Element, isActive: boolean) {
    const action = isActive ? 'addClass' : 'removeClass';
  
    let p = elem.parentNode;
    // walk up dom to set active class
    while (p && ['LI', 'UL', 'P'].includes(p.nodeName)) {
      this.renderer[action](p, 'active');
      p = p.parentNode;
    }
  }

  private setupPageListeners() {
    const sections: Element[] = Array.prototype.slice.call(document.querySelectorAll('#content > #main section[id]'));

    if (this.intersectionObserver) this.intersectionObserver.disconnect();
    this.inScrollHashes = new Set();

    this.intersectionObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          this.inScrollHashes.add(e.target.id);
        } else {
          this.inScrollHashes.delete(e.target.id);
        }
      });
      this.updated.emit(this.inScrollHashes);
    });

    sections.forEach(s => {
      this.intersectionObserver.observe(s);
    });
  }
}
