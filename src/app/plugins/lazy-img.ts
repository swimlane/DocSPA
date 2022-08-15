require('style-loader!./lazy-img.css');

export default class LazyloadImage extends HTMLImageElement {
  original = '';
  intersectionObserver: IntersectionObserver;
  matchMediaPrint: MediaQueryList;

  static get FALLBACK_IMAGE(): string {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEElEQVR42gEFAPr/AP///wAI/AL+Sr4t6gAAAABJRU5ErkJggg==';
  }

  static get observedAttributes(): string[] {
    return [
      'offset'
    ];
  }

  get offset(): string {
    return this.getAttribute('offset');
  }

  set offset(value: string) {
    this.setAttribute('offset', value);
  }

  get observer(): IntersectionObserver {
    if (!this.intersectionObserver) {
      this.intersectionObserver = new IntersectionObserver(this.onIntersect, {
        rootMargin: this.offset
      });
    }
    return this.intersectionObserver;
  }

  get mediaMatch(): MediaQueryList {
    if (!this.matchMediaPrint) {
      this.matchMediaPrint = window.matchMedia('print');
    }
    return this.matchMediaPrint;
  }

  constructor(_width: number, _height: number) {
    super();
    this.original = this.currentSrc || this.src;
    this.src = LazyloadImage.FALLBACK_IMAGE;
    this.onIntersect = this.onIntersect.bind(this);
    this.onPrint = this.onPrint.bind(this);
  }

  connectedCallback(): void {
    this.classList.toggle('loading', false);
    this.observe();
  }

  disconnectedCallback(): void {
    this.unobserve();
  }

  attributeChangedCallback(_name: string, _oldValue: unknown, _newValue: unknown): void {
    if (this.observer === null) {
      return;
    }

    this.unobserve();
    this.observe();
  }

  private observe() {
    this.observer.observe(this);
    this.mediaMatch.addEventListener('change', this.onPrint);
  }

  private unobserve() {
    this.observer.unobserve(this);
    this.observer.disconnect();
    this.mediaMatch.removeEventListener('change', this.onPrint);
  }

  private onPrint() {
    this.load();
  }

  private onIntersect(entries) {
    if (entries.length === 0) {
      return;
    }

    if (entries[0].intersectionRatio <= 0) {
      return;
    }
    this.load();
  }

  private load() {
    this.addEventListener('load', () => {
      this.unobserve();
    });

    this.addEventListener('error', () => {
      this.src = LazyloadImage.FALLBACK_IMAGE;
      this.unobserve();
    });

    this.src = this.original;
    this.classList.toggle('loaded', true);
  }
}

customElements.define('lazyload-image', LazyloadImage, {
  extends: 'img'
});
