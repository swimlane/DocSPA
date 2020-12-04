import { NgModule, ModuleWithProviders, InjectionToken, Optional, Inject } from '@angular/core';

import { SettingsService } from '../services/settings.service';
import { HooksService } from '../services/hooks.service';

import type { VFile } from '../shared/vfile';

export const DOCSIFYPLUGINS_CONFIG_TOKEN = new InjectionToken<any>( 'DocsifyPluginsModule.forRoot() configuration.' );

@NgModule({
})
export class DocsifyPluginsModule {
  static forRoot(config: any): ModuleWithProviders<DocsifyPluginsModule> {
    return {
      ngModule: DocsifyPluginsModule,
      providers: [
        {
          provide: DOCSIFYPLUGINS_CONFIG_TOKEN,
          useValue: config
        }
      ]
    };
  }

  constructor(
    private settings: SettingsService,
    private hooks: HooksService,
    @Optional() @Inject(DOCSIFYPLUGINS_CONFIG_TOKEN) config: any
  ) {
    const docsifyPlugins = [];
    if (config && config.plugins) {
      docsifyPlugins.push(...config.plugins);
    }
    if (window['$docsify'] && window['$docsify'].plugins) {
      docsifyPlugins.push(...window['$docsify'].plugins);
    }
    this.addDocsifyPlugins(docsifyPlugins);
  }

  addDocsifyPlugins(plugins: any[]) {
    const vm = {  // Mock docsify vm for docsify plugins
      config: this.settings,
      route: {
        file: ''
      }
    };

    const init = (fn: Function) => {
      this.hooks.init.tap('docsify-init', () => {
        setTimeout(() => {  // get rid of this, could be called after component renders
          return fn();
        }, 30);
      });
    };

    const beforeEach = (fn: Function) => {
      this.hooks.beforeEach.tap('docsify-beforeEach', (vf: VFile) => {
        // Docsify beforeEach only runs on main content
        if (vf.data.docspa.isPageContent) {
          vm.route.file = vf.data.docspa.url;
          vf.contents = fn(vf.contents);
        }
        return vf;
      });
    };

    const afterEach = (fn: Function) => {
      this.hooks.afterEach.tap('docsify-afterEach', (vf: VFile) => {
        // Docsify afterEach only runs on main content
        if (vf.data.docspa.isPageContent) {
          if (vf.history && vf.history[1]) {
            vm.route.file = vf.history[1].replace(/^\//, '');
          }
          vf.contents = fn(vf.contents);
        }
        return vf;
      });
    };

    const doneEach = (fn: Function) => {
      this.hooks.doneEach.tap('docsify-doneEach', () => {
        setTimeout(() => {  // get rid of this, could be called after component renders
          return fn();
        }, 30);
      });
    };

    const mounted = (fn: Function) => {
      this.hooks.mounted.tap('docsify-mounted', () => {
        setTimeout(() => {  // get rid of this, could be called after component renders
          return fn();
        }, 30);
      });
    };

    const ready = (fn: Function) => {
      fn();
    };

    const hooks = {
      init, // Called when the script starts running, only trigger once, no arguments
      beforeEach, // Invoked each time before parsing the Markdown file
      afterEach, // Invoked each time after the Markdown file is parsed
      doneEach, // Invoked each time after the data is fully loaded, no arguments
      mounted, // Called after initial completion. Only trigger once, no arguments.
      ready // Called after initial completion, no arguments.
    };

    // initialize docsify plugins
    plugins.forEach(p => p(hooks, vm));
  }
}
