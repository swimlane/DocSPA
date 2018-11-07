import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule, Injector } from '@angular/core';
import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
  /// HashLocationStrategy
} from '@angular/common';
import { createCustomElement } from '@angular/elements';

import { LoadingBarModule } from '@ngx-loading-bar/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { AppComponent } from './app.component';
import { DocspaCoreModule } from '@swimlane/docspa-core';
import { EditOnGithubComponent } from './plugins/edit-on-github';

import { config } from '../docspa.config';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

class TrafficLightComp extends HTMLElement {
  lightStyle: any;

  static get observedAttributes() {
    return ['record'];
  }

  constructor() {
    super();
    this.lightStyle = `height: 310px;
                      width: 100px;
                      background-color: #333;
                      border-radius: 30px;
                      padding: 20px;
                      box-sizing: content-box;
                      margin: 0 auto;`;
  }

  getBulbStyle(color) {
    return `height: 90px;
            width: 90px;
            background-color: ${color};
            border-radius: 50%;
            margin: 10px auto;`;
  }

  connectedCallback() {
    this.update();
  }

  disconnectedCallback() {}

  attributeChangedCallback(attrName, oldVal, newVal) {
    this.update();
  }

  get record() {
    return JSON.parse(this.getAttribute('record'));
  }

  set record(value) {
    this.setAttribute('record', JSON.stringify(value));
  }

  update() {
    let template = '';
    if (this.record) {

      template = `
      <div>
        Hello
      </div>
      `;

      /* template = `<div id="traffic-light" style="${this.lightStyle}">
                    <div id="red-light" style="${this.getBulbStyle(
                      this.record.severity &&
                      this.record.severity.value === "High"
                        ? "red"
                        : "#111"
                    )}"></div>
                    <div id="yellow-light" style="${this.getBulbStyle(
                      this.record.severity &&
                      this.record.severity.value === "Medium"
                        ? "yellow"
                        : "#111"
                    )}"></div>
                    <div id="green-light" style="${this.getBulbStyle(
                      this.record.severity &&
                      this.record.severity.value === "Low"
                        ? "green"
                        : "#111"
                    )}"></div>
                  </div>`; */
    }

    this.innerHTML = template;
  }
}

customElements.define('demo-trafficlight', TrafficLightComp);

@NgModule({
  declarations: [
    AppComponent,
    EditOnGithubComponent
  ],
  imports: [
    CommonModule,
    DocspaCoreModule.forRoot(config),
    BrowserModule,
    FormsModule,
    NgxChartsModule,
    LoadingBarModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production
    })
  ],
  providers: [
    Location,
    { provide: LocationStrategy, useClass: PathLocationStrategy }
  ],
  bootstrap: [AppComponent],
  entryComponents: [EditOnGithubComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    const content = createCustomElement(EditOnGithubComponent, { injector: this.injector });
    customElements.define(EditOnGithubComponent.is, content);
  }

  ngDoBootstrap() {}
}
