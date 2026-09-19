# NPM Package Publishing Guide

## Login to npm
```bash
npm login
```

## Full Release Workflow

1. Update CHANGELOG.md

2. Run the test suites:

```bash
yarn lint
yarn unit
yarn "e2e:*"
```

Quote `"e2e:*"`. The script really is named with a `*`, so in zsh an unquoted
`yarn e2e:*` aborts with `no matches found`; bash only gets away with it because
no file happens to match the pattern.

3. Refresh both committed build artifacts:

```bash
yarn build
```

This runs `build:lib` (→ `dist/`) followed by `pages` (→ `docs/`). `docs/` is
the GitHub Pages source, served from `main:/docs`, and only
`vite.config.pages.js` builds it with the required `/jedison/` base — so
skipping this step leaves the live playground on the previous release's bundle.
No other script writes to `docs/`: `yarn serve` and the e2e suites build into
the gitignored `.vite-preview/` instead, because their output has no base path
and would break every asset URL under `/jedison/`.

4. Commit and push all changes, including the refreshed `dist/` and `docs/`

5. Run version command:

```bash
npm version x.y.z -m "Release v%s"
```

The `"version"` script rebuilds `dist/` and stages it, then `"postversion"`
runs `git push && git push --tags` — both happen automatically.

6. Run publish command:

```bash
npm publish --access public
```

The `"prepublishOnly"` script rebuilds `dist/` once more before the tarball is packed.
