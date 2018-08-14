# Config Reference

Here is a basic config with notes:

```js
const config = {
  basePath: 'docs/',              // Where the markdown fiels are located
  homepage: 'README.md',          // Default page to load when navigating to a directrory
  sideLoad: [                     // Additional content load (can be set to false)
    '_sidebar.md',
    '_navbar.md',
    '_right_sidebar.md',
    '_footer.md'
  ],
  coverpage: '_coverpage.md',     // Coverpage to loads (can be set to false)
  plugins: [                      // Docsify-like plugins
    mermaidHook,
    window['EditOnGithubPlugin'].create('https://github.com/swimlane/docspa/blob/master/src/docs/', null, '✎ Edit this page')
  ],
  remarkPlugins: [                // remark plugins (can also be a remark preset)
    ...defaultRemarkPlugins,
    mermaid,
    prism
  ],
  runtimeModules: [              // modules available within the Angular live runtime component
    CommonModule,
    NgxChartsModule,
    BrowserAnimationsModule
  ]
};
```

i> In the quick start the config file is located at `src/docspa.config.ts`.  The location and name of the is arbitarty but must be imported and set as a provider in your `app.module`.