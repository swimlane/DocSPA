# DocSPA

> An Angular-powered documentation SPA.

## Introduction

DocSPA (like it's inspiration docsify) generates your documentation website on the fly. Unlike GitBook, it does not generate static HTML files. Instead, it loads and parses your Markdown files and displays them as website. Unlike docsify, DocSPA generates an Angular SPA, which allows embedded Angular components and excellent [custom element support](https://custom-elements-everywhere.com/#angular).

See the [Quick start](quickstart) for details on how to get up and running quickly.  See [modules](modules) for details on customizing DocSPA.

## How it works

A DocSPA site is a <abbr title="Single Page Application">SPA</abbr> powered by Angular and the Angular CLI.  If you've used the Angular CLI before you already know a lot about the DocSPA infrastructure.  If you built Angular applications before, customizing a DocSPA site will be a familiar experience.  If you are not familar with Angular, no worries, out-of-the-box DocSPA provides a simple experience so you can get right to your [content](content).

As mentioned DocSPA is a Angular SPA.  It uses Angular CLI tools for the build process.  Once built and deployed the DocSPA site will generate HTML content on-the-fly from your markdown content.  Markdown files are converted to HTML using [remark][https://remark.js.org/].  Remark plugins (both DocSPA internal and third-party) handle all markdown extensions.  In addition, the DocSPA site supports custom elements (one of the key features of the Web Components standard) and includes custom elements that allows [live Angular examples](features#runtime-content) within markdown!

## Features

- [Ability to leverage Angular and Web Components in markdown](features#custom-elements)
- [Remark plugins with defaults optimized for technical documentation](features#markdown-extensions)
- [Compatible with many docsify plugins and themes](features#docsify-plugins)

[Examples](features)

## Todo

DocSPA is a work in progress.  DocSPA was developed by [Swimlane](http://swimlane.com/) for use in Swimlane projects.

## Why not X?

DocSPA is not SEO-friendly, if you need a pregenerated SEO-friendly site without live Angular support you might try [GitBook](https://www.gitbook.com/).  If you don't need a pregenerated site nor embedded Angular code (or prefer Vue) you might try [Docsify](https://docsify.js.org/#/).

## Credits

DocSPA is a Swimlane open-source project; we believe in giving back to the open-source community by sharing some of the projects we build for our application. Swimlane is an automated cyber security operations and incident response platform that enables cyber security teams to leverage threat intelligence, speed up incident response and automate security operations.

DocSPA was developed in Angular following inspiration from [docsify](https://docsify.js.org/) by [QingWei-Li](https://github.com/QingWei-Li) and contributors.
