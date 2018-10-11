import { Component, Input, HostListener } from '@angular/core';
import { RouterService } from '../services/router.service';

@Component({
  selector: 'docspa-link', // tslint:disable-line
  template: `<ng-content></ng-content>`,
  styles: []
})
export class MdLinkComponent {
  static readonly is = 'md-link';

  @Input()
  href = '';

  constructor (private routerService: RouterService) {
  }

  @HostListener('click', ['$event'])
  onClick(ev: Event) {
    ev.preventDefault();
    this.routerService.go(this.href);
  }
}


