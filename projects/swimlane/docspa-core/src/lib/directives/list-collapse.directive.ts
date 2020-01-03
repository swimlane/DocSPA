import { Directive, ElementRef, SimpleChanges, Renderer2, Input } from '@angular/core';

import { HooksService } from '../services/hooks.service';
import { throttleable } from '../shared/throttle';

@Directive({
    selector:'[listCollapse]'
})
export class ListCollapse {
  // an array of active hash
  @Input()
  listCollapse: string[];

  // an array of anchors in this element
  private tocLinks: HTMLAnchorElement[];

  constructor(private elm: ElementRef, private renderer: Renderer2, private hooks: HooksService){
  }

  ngOnInit() {
    this.getTocLinks();
    this.markLinks();

    // if page content changes, get links
    this.hooks.doneEach.tap('main-content-loaded', () => {
      this.getTocLinks();
      this.markLinks();
    });
  }

  // if list of hashs changes, update links
  ngOnChanges(changes: SimpleChanges) {
    if ('listCollapse' in changes) {
      this.markLinks();
    }
  }

  private getTocLinks() {
    if (!this.listCollapse) return;
    this.tocLinks = Array.prototype.slice.call(this.elm.nativeElement.querySelectorAll('ul > li > a'));
  }

  @throttleable(120)
  private markLinks() {
    if (!this.tocLinks) return;

    // clear
    for (let i = 0; i < this.tocLinks.length; i++) {
      const a = this.tocLinks[i];
      this.renderer.removeClass(a, 'active');
      this.updateTree(a, false);
    }

    // set
    for (let i = 0; i < this.tocLinks.length; i++) {
      const a = this.tocLinks[i];
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
  private isLinkActive(a: HTMLAnchorElement) {
    return a.classList.contains('router-link-active');
  }

  /**
   * Determines if a link's hash is active
   * @param a
   */
  private isHashActive(a: HTMLAnchorElement) {
    const hash = a.hash.replace(/^#/, '');
    return !hash || this.listCollapse.includes(hash);
  }

  private updateTree(elem: Element, isActive: boolean) {
    const action = isActive ? 'addClass' : 'removeClass';
  
    let p = elem.parentNode;
    // walk up dom to set active class
    while (p && ['LI', 'UL', 'P'].includes(p.nodeName)) {
      this.renderer[action](p, 'active');
      p = p.parentNode;
    }
  }
}