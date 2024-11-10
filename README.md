# AspireWithAlinaDesktop

_TODO: update README..._

**Note:** There is an issue with Webpack 5 and bcryptjs. Currently the only way to fix this issue is by manually going into `node_modules/bcryptjs/package.json` and change `"browser"` from this:

```
"browser": "dist/bcrypt.js"
```

To this:

```
"browser": {
  "bin": "dist/bcrypt.js",
  "crypto": false
}
```

This isn't an issue for the finalized app because I'll be building a cross-platform binary with Electron, but for development purposes I felt it was important to include this fix mentioned above.
