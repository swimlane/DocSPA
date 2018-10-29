import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { RouterService, LocationService } from '@swimlane/docspa-core';

@Component({
  selector: 'docspa-edit-on-github', // tslint:disable-line
  template: `<a [attr.href]="href" target="_blank"><ng-content></ng-content></a>`,
  styles: []
})
export class EditOnGithubComponent implements OnInit {
  static readonly is = 'md-edit-on-github';

  @Input()
  set docBase(value: string) {
    this.docEditBase = value.replace(/\/blob\//, '/edit/');
  }

  private path: string;
  private docEditBase: string;

  get href() {
    return this.docEditBase + this.path;
  }

  constructor(private routerService: RouterService, private locationService: LocationService) {
  }

  ngOnInit() {
    this.setPath(this.routerService.contentPage);
    this.routerService.changed.subscribe((changes: SimpleChanges) => {
      if ('contentPage' in changes) {
        this.setPath(changes.contentPage.currentValue);
      }
    });
  }

  setPath(page: string) {
    const vfile = this.locationService.pageToFile(page);
    this.path = vfile.path;
  }
}
