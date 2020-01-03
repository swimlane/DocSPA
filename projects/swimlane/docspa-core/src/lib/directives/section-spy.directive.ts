import { Directive, ElementRef, Output, EventEmitter } from '@angular/core';

@Directive({
    selector:'[sectionScrollSpy]'
})
export class SectionScrollSpy {
  @Output('sectionScrollSpy')
  updated: EventEmitter<string[]> = new EventEmitter();

  private intersectionObserver: IntersectionObserver;
  private mutationObserver: MutationObserver;
  private inScrollHashes: Set<string>;

  constructor(private elm: ElementRef){
  }

  ngOnInit() {
    this.mutationObserver = new MutationObserver(() => this.setupPageListeners());
    this.mutationObserver.observe(this.elm.nativeElement, { childList : true, subtree: true });
  }

  ngOnDestroy() {
    if (this.mutationObserver) this.mutationObserver.disconnect();
    if (this.intersectionObserver) this.intersectionObserver.disconnect();
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