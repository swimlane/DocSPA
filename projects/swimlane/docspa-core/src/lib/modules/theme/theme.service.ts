import { Injectable, InjectionToken, Inject } from '@angular/core';

export const FOR_ROOT_OPTIONS_TOKEN = new InjectionToken<any>( 'forRoot() configuration.' );

export interface Theme {
  [key: string]: string;
}

// TODO: make dynamic
// TODO: find 3rd party tool to inject css-vars?
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme: Theme = {};

  constructor(
    @Inject(FOR_ROOT_OPTIONS_TOKEN) private config: any
  ) {
    this.currentTheme = (config && config.theme) || {};
    this.update();
  }

  update() {
    for (const key in this.currentTheme) {
      if (this.currentTheme.hasOwnProperty(key)) {
        document.body.style.setProperty(key, this.currentTheme[key]);
      }
    }
  }
}
