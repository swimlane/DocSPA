import { NgModule, ModuleWithProviders, InjectionToken, Injector, Inject } from '@angular/core';
import { ThemeService, FOR_ROOT_OPTIONS_TOKEN } from './theme.service';

@NgModule({
})
export class ThemeModule {
  static forRoot(config: any): ModuleWithProviders {
    return {
      ngModule: ThemeModule,
      providers: [
        ThemeService,
        {
          provide: FOR_ROOT_OPTIONS_TOKEN,
          useValue: config
        }
      ]
    };
  }

  constructor(public themeService: ThemeService) {
  }
}
