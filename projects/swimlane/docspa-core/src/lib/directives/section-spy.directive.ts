import { Directive, ElementRef, Output, EventEmitter, Renderer2 } from '@angular/core';

import { HooksService } from '../services/hooks.service';
import { VFile } from '../../vendor';

@Directive({
    selector:'[sectionScrollSpy]'
})
export class SectionScrollSpy {
  @Output('sectionScrollSpy')
  updated: EventEmitter<string[]> = new EventEmitter();

  private intersectionObserver: IntersectionObserver;
  private inScrollHashes: Set<string>;

  constructor(private elm: ElementRef, private renderer: Renderer2, private hooks: HooksService){
  }

  ngOnInit() {
    this.hooks.doneEach.tap('main-content-loaded', (page: VFile) => {
      // If page content changes, update listeners
      if (page.data.docspa.isPageContent) {
        this.setupPageListeners();
      }
    });
  }

  private setupPageListeners() {
    const nodes = this.elm.nativeElement.querySelectorAll('#content > #main section[id]');
    const sections: Element[] = Array.prototype.slice.call(nodes);

    if (this.intersectionObserver) this.intersectionObserver.disconnect();
    this.inScrollHashes = new Set();

    this.intersectionObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const action = e.isIntersecting ? 'add' : 'delete';
        this.inScrollHashes[action](e.target.id);
      });
      this.updated.emit(Array.from(this.inScrollHashes));
    });

    sections.forEach(s => {
      this.intersectionObserver.observe(s);
    });
  }
}