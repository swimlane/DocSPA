import { 
  Component, Input,
  ViewChild, TemplateRef, ViewContainerRef
} from '@angular/core';

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
        routerLinkActive="router-link-active"
        [routerLinkActiveOptions]="{exact: true}"
        [attr.aria-hidden]="ariaHidden">
        <ng-content></ng-content>
      </a>
    </ng-template>`
})
export class MdLink {
  static readonly is = 'md-link';

  @Input()
  link: string;

  @Input('aria-hidden')
  ariaHidden: any;

  @Input()
  download: boolean;

  @Input()
  klass: boolean;

  @Input()
  routerLink: string | string[];

  @Input()
  fragment: string;

  @ViewChild(TemplateRef, { static: true }) private template: TemplateRef<void>;

  constructor(
    private locationService: LocationService,
    private readonly vcRef: ViewContainerRef,
    private readonly routerService: RouterService
  ) {
  }

  ngAfterContentInit() {
    // Moving link outside of component
    this.vcRef.createEmbeddedView(this.template);
  }

  /**
   * [routerLink] and [routerLinkActive] directives use ActivateRoute as the base,
   * However, when this component is used as a custom element (via angular elements)
   * it becomes disassociated with the page componnet (router outlet),
   * so we must convert the url here to be relaive to the page component activate route.
   */
  ngOnChanges() {
    // resolve path relative to component
    let routerLink: string | string[] = this.locationService.prepareLink(this.link, this.routerService.root);

    // Hack to preserve trailing slash
    if (typeof routerLink === 'string' && routerLink.length > 1 && routerLink.endsWith('/')) {
      routerLink = [routerLink, ''];
    }
    this.routerLink = routerLink;
  }
}
