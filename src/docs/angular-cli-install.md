# Adding DocSPA to a angular cli app

!!> If you are starting a new project we recommend looking at the [quick start](quickstart).

## Generate new Angular app

```sh
ng new my-docspa-project
# Recommended options:
# ? Do you want to enforce stricter type checking and stricter bundle budgets in the workspace? No
# ? Would you like to add Angular routing? Yes
# ? Which stylesheet format would you like to use? SCSS
cd my-docspa-project
```

## Install DocSPA and peer dependencies

First install DocSPA core and DocSPA remark-preset:

```sh
npm install --save @swimlane/docspa-core @swimlane/docspa-remark-preset
```

Then peer dependencies:

```sh
npm i --save ngx-logger @angular/elements @webcomponents/custom-elements @ungap/global-this
npm i --save-dev @types/node
```

## Add a `docspa.config.ts` file to the `src` folder.

```ts
export const config = {
  name: "My DocSPA Site",
  basePath: "docs/",
  homepage: "README.md",
  notFoundPage: "_404.md",
  sideLoad: {
    sidebar: "_sidebar.md",
    navbar: "_navbar.md",
    rightSidebar: "/_sidebar2.md",
    footer: "_footer.md",
  },
  coverpage: "_coverpage.md",
};
```

> See [DocspaCoreModule](modules/core) for details on this file.

## Edit `pollyfill.ts`

Add the following to `pollyfill.ts`:

```ts
// Used for browsers with partially native support of Custom Elements
import "@webcomponents/custom-elements/src/native-shim";

// Used for browsers without a native support of Custom Elements
import "@webcomponents/custom-elements/custom-elements.min";

window["global"] = globalThis as any;
window["process"] = window["process"] || require("process/browser");
window["Buffer"] = window["Buffer"] || require("buffer").Buffer;
```

## Edit `index.html` to add a docsify theme:

```html { mark="10" }
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>MyDocspaProject</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">

  <link rel="stylesheet" href="//unpkg.com/docsify/themes/buble.css" />
<body>
  <app-root></app-root>
</body>
</html>
```

## Add imports and config to `AppModule`

```ts { mark="7-10,19-22,24-26" }
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { config } from "../docspa.config";
import { DocspaCoreModule, MarkdownElementsModule, MarkdownModule, MARKDOWN_CONFIG_TOKEN } from "@swimlane/docspa-core";
import { LoggerModule, NgxLoggerLevel } from "ngx-logger";
import { preset } from "@swimlane/docspa-remark-preset";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, DocspaCoreModule.forRoot(config), LoggerModule.forRoot({ level: NgxLoggerLevel.WARN }), MarkdownModule.forRoot(), MarkdownElementsModule.forRoot()],
  providers: [{ provide: MARKDOWN_CONFIG_TOKEN, useFactory: () => preset }],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## Update `app-routing.module.ts` to support DocSPA routing

```ts { mark="1,4,6-8,11,13-16" }
import { LocationStrategy, PathLocationStrategy } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DocSPACoreComponent, LocationWithSlashes } from "@swimlane/docspa-core";

const routes: Routes = [{ path: "**", component: DocSPACoreComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    { provide: Location, useClass: LocationWithSlashes },
    { provide: LocationStrategy, useClass: PathLocationStrategy },
  ],
})
export class AppRoutingModule {}
```

## Remove boilerplate from `app.component.html`

```html
<router-outlet></router-outlet>
```

## Add content to `src/docs`

You can copy from the quickstart [docs folder](https://github.com/swimlane/docspa-starter/tree/master/src/docs).

> See [content](content).

## Edit `angular.json`

Add the `src/docs` folder `angular.json` as an asset

```json { mark="9" }
{
  "projects": {
    "my-docspa-project": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              ...
              "src/docs",
              ...
            ],
```

## Run

```sh
npm start
```
