import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgModule, Injectable } from '@angular/core';

import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
} from '@angular/common';
import { ServiceWorkerModule } from '@angular/service-worker';

import { LoadingBarModule } from '@ngx-loading-bar/core';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';

import { AppComponent } from './app.component';

import { environment } from '../environments/environment';
import { DocspaModule } from './docspa.module';
import { AppRoutingModule } from './app-routing.module';

// @Injectable({
//   providedIn: AppRoutingModule,
// })
// class LocationWithTrailingSlashes extends Location {
//   public static stripTrailingSlash(url: string) {
//     debugger;
//     return url;
//   }
// }

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    LoadingBarModule.forRoot(),
    LoadingBarHttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production
    }),
    DocspaModule,
    AppRoutingModule
  ],
  // providers: [
  //   { provide: Location, useClass: LocationWithTrailingSlashes },
  //   { provide: LocationStrategy, useClass: PathLocationStrategy }
  // ],
  bootstrap: [AppComponent]
})
export class AppModule {
  ngDoBootstrap() {}
}
