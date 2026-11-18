# Release

Update `CHANGELOG.md` first.

```bash
npm login
```

```bash
yarn lint
yarn unit
yarn "e2e:*"   # keep the quotes, zsh fails without them
```

```bash
yarn build     # refreshes dist/ and docs/ (GitHub Pages), commit both
```

Commit and push everything, then:

```bash
npm version x.y.z -m "Release v%s"   # also pushes commit and tags
npm publish --access public
```
