import {
  Component, Input, ViewEncapsulation,
  ViewChild, ViewContainerRef, ComponentRef, OnInit,
  Compiler, NgModule,
  ComponentFactory, ModuleWithComponentFactories,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'runtime-content', // tslint:disable-line
  template: `
  <div class="source" #source><ng-content></ng-content></div>
  <div #container></div>`,
  styles: [`
    runtime-content > div.source {
      display: none;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class RuntimeContentComponent implements OnInit {
  @Input()
  context: any;

  @Input()
  template;

  @ViewChild('container', { read: ViewContainerRef })
  container: ViewContainerRef;

  @ViewChild('source')
  source: any;

  highlight: string;

  private componentRef: ComponentRef<{}>;

  constructor(
    private compiler: Compiler,
    private settings: SettingsService
  ) {
  }

  ngOnInit() {
    if (!this.template && this.source) {
      this.template = this.source.nativeElement.innerHTML.trim();
    }
    this.compileTemplate();
  }

  compileTemplate() {
    const metadata = {
      selector: `runtime-component-sample`,
      template: this.template
    };

    const factory = this.createComponentFactorySync(metadata, this.context);

    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
    this.componentRef = this.container.createComponent(factory);
  }

  private createComponentFactorySync(metadata: Component, context: any): ComponentFactory<any> {
    context = context ? JSON.parse(context) : {};
    class RuntimeComponent {
      constructor() {
        Object.assign(this, context);
      }
    }
    const decoratedCmp = Component(metadata)(RuntimeComponent);
    const imports = this.settings.runtimeModules;

    @NgModule({
      imports,
      declarations: [decoratedCmp],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    class RuntimeComponentModule { }

    const module: ModuleWithComponentFactories<any> = this.compiler.compileModuleAndAllComponentsSync(RuntimeComponentModule);
    return module.componentFactories.find(f => f.componentType === decoratedCmp);
  }
}
