# Content

## Pages

Documents within the `./src/docs` folder are available within the application. By default, directory links resolve to `README.md`.  Inter-document links can be relative or absolute. You can nest documents within subfolders.

For example, given the following file structure:

```
.
└── docs
    ├── README.md
    ├── page.md
    └── sub
        ├── README.md
        └── page.md
```

Here are the matching routes:

```
docs/README.md     => http://domain.com/
docs/guide.md      => http://domain.com/#/guide
docs/sub/README.md => http://domain.com/#/sub/
docs/sub/page.md   => http://domain.com/#/sub/page
```

In this example, all these links are equivalent when included in a subdirectory.

```markdown
* [Your project](/)
* [Your project](/README.md)
* [Your project](../README.md)
```

i> The default page can be set using the `homepage` property set in `docspa.config.ts`.

## Side Content

Additional content is loaded from each directory. In the default configuration the following files are loaded:

    - `_sidebar.md`
    - `_navbar.md`
    - `_right_sidebar.md`
    - `_footer.md`

If the current directory doesn't have a given file, it will fall back to the parent directory recursively until the content is found.

i> The files to load can be set using the `sideLoad` property set in `docspa.config.ts`.  The default order of content is as shown above. Set a value to false to turn off the feature.

## Coverpage

When viewing to a homepage (`/` or `README`), if the current directory contains a `_coverpage.md` file it is loaded as an overlay over the `README.md` file.

i> The cover page can be set using the `coverpage` property set in `docspa.config.ts`.
i> Set this value to `false` to turn off the coverpage feature.
