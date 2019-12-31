import {
  Component, Input, ViewEncapsulation,
  ViewChild, ElementRef, OnInit
} from '@angular/core';

@Component({
  selector: 'docspa-runtime',
  template: `
    <div class="source" #source><ng-content></ng-content></div>
    <ng-container *dynamicComponent="template; context: context; selector: selector"></ng-container>
  `,
  styles: [`
    docspa-runtime > .source {
      display: none;
    }
    md-runtime > .source {
      display: none;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class RuntimeContentComponent implements OnInit {
  static readonly is = 'md-runtime';

  @Input('context')
  context: any;

  @Input()
  template: string;

  @Input()
  selector = 'runtime-component-sample';

  @ViewChild('source', { static: true })
  source: ElementRef;

  _template: string;

  ngOnInit() {
    if (!this.template && this.source) {
      this.template = this.source.nativeElement.innerHTML.trim();
    }

    this.context = this.context || {};
    if (typeof this.context === 'string') {
      try {
        this.context = JSON.parse(this.context);
      } catch(err) {
        this.context  = {};
      }
    }
  }
}
