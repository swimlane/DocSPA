import { 
  Component, Input,
  ViewChild, TemplateRef, ViewContainerRef, ElementRef, Renderer2,
  // Host, Optional, Inject
} from '@angular/core';
// import { Router, ActivatedRoute } from '@angular/router';
import { resolve } from 'url';

import { LocationService } from '../../services/location.service';
import { RouterService } from '../../services/router.service';

@Component({
  selector: 'docspa-link', // tslint:disable-line
  template: `
    <ng-template>
      <a
        [attr.class]="klass"
        [routerLink]="routerLink"
        [fragment]="fragment"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{exact: true}"
        [attr.aria-hidden]="ariaHidden">
        <ng-content></ng-content>
      </a>
    </ng-template>`,
  styles: [':host { display: content; }']
})
export class MdLink {
  static readonly is = 'md-link';

  @Input()
  href: string;

  @Input('aria-hidden')
  ariaHidden: any;

  @Input()
  source: string;

  @Input()
  download: boolean;

  @Input()
  klass: boolean;

  routerLink: string | string[];
  fragment: string;

  @ViewChild(TemplateRef, { static: true }) private template: TemplateRef<void>;

  constructor(
    // private router: Router,
    // private route: ActivatedRoute,
    private locationService: LocationService,
    private readonly vcRef: ViewContainerRef,
    // private readonly elementRef: ElementRef<HTMLElement>,
    // private readonly renderer2: Renderer2,
    private readonly routerService: RouterService
  ) {
  }

  ngAfterContentInit() {
    // Moving link outside of component
    this.vcRef.createEmbeddedView(this.template);
  }

  ngOnChanges() {
    // resolve path relative to source document
    const url = resolve(this.source, this.href);
    let [routerLink = '', fragment] = url.split('#');
    
    // resolve path relative to componnet
    this.routerLink = this.locationService.prepareLink(routerLink, this.routerService.root);

    // Hack to preserve trailing slash
    if (this.routerLink.length > 1 && this.routerLink.endsWith('/')) {
      this.routerLink = [this.routerLink, ''];
    }

    this.fragment = fragment ? fragment.replace(/^#/, '') : undefined;
  }
}
