import {
  Component, Input, ViewEncapsulation,
  ViewChild, ElementRef, OnInit, TemplateRef
} from '@angular/core';

@Component({
  selector: 'runtime-content',
  template: `
    <code class="source" #source><ng-content></ng-content></code>
    <ng-container *dynamicComponent="template; context: context; selector: selector"></ng-container>
  `,
  styles: [`
    runtime-content > .source {
      display: none;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class RuntimeContentComponent implements OnInit {
  static readonly is = 'runtime-content';

  @Input('context')
  context: any;

  @Input()
  template: string;

  @Input()
  selector = 'runtime-component-sample';

  @ViewChild('source', { static: true })
  source: ElementRef;

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
