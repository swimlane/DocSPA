import { Injectable, Injector, Compiler, ReflectiveInjector } from '@angular/core';

import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class PluginsService {
  constructor(
    private settings: SettingsService,
    private injector: Injector,
    private compiler: Compiler) {
  }

  initPlugins() {
    this.settings.plugins.forEach(plugin => {
      if (typeof plugin === 'function' && plugin.ngInjectorDef) {
        this.loadModule(plugin);
      }

      if (typeof plugin === 'object' && plugin.ngModule) {
        this.loadModule(plugin.ngModule, plugin.providers);
      }
    });
  }

  private loadModule(module: any, providers?: any[]) {
    this.compiler.compileModuleAsync<any>(module).then(moduleFactory => {
      const injector = Injector.create({
        providers,
        parent: this.injector
      });
      moduleFactory.create(injector);
    });
  }
}
