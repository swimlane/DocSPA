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
  plugins: [                      // Docsify plugins
    window['EditOnGithubPlugin'].create('https://github.com/swimlane/docspa/blob/master/src/docs/', null, '✎ Edit this page')
  ]
};
```

i> In the quick start the config file is located at `src/docspa.config.ts`.  The location and name of the is arbitrary but must be imported and set used as configuration for the `DocspaCoreModule`.