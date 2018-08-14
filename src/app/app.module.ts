import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule, Injector, Compiler } from '@angular/core';
import { Location, LocationStrategy, HashLocationStrategy } from '@angular/common';

import { LoadingBarModule } from '@ngx-loading-bar/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { AppComponent } from './app.component';
import { DocspaCoreModule } from '@swimlane/docspa-core';

import config from '../docspa.config';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    DocspaCoreModule.forRoot(config),
    BrowserModule,
    FormsModule,
    NgxChartsModule,
    LoadingBarModule.forRoot()
  ],
  providers: [
    Location,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
  ngDoBootstrap() { }
}
