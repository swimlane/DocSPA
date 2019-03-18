import { Component, Input, Optional, Inject } from '@angular/core';

@Component({
  selector: 'env-var', // tslint:disable-line
  template: `{{value}}`,
  styles: []
})
export class EnvVarComponent {
  static readonly is = 'env-var';

  @Input()
  var: string;

  get value() {
    return String(this.var ? this.environment[this.var] : '');
  }

  constructor(@Optional() @Inject('environment') private environment: any) {
  }
}


