# AGENTS

## Quick start
- **Setup**: `yarn`
- **Build library**: `yarn build`
- **Build docs / dev assets**: `yarn preserve` (creates `docs/` from `src`/`src-docs`).  `yarn dev` starts a dev server on port **8282**.
- **Preview built site**: `yarn serve` (Vite preview, port 8181).

## Linting & type‑checking
- **Lint**: `yarn lint`
- **Fix lint issues**: `yarn lint:fix`

## Testing
- **Unit tests** (after `yarn build`): `yarn unit`
  - single file: `yarn unit -- --testPathPattern path/to/file.test.js`
- **Full test suite** (e2e + unit): `yarn test:full`
- **E2E tests**: `yarn e2e`
  - Requires dev server to start automatically via `start‑server‑and‑test`.
  - Theme overrides (Bootstrap 3/4/5): e.g. `yarn e2e:b3`, `yarn e2e:b4`, `yarn e2e:b5`.
  - Single scenario grep: `yarn e2e:grep` or headless: `yarn e2e:grep:headless`.

## Building
- **Production build**: `yarn build`
- **Pre‑build for pages** (used in CI): `yarn prebuild`
- **Preserve dev build for docs**: `yarn preserve`

## Release
- **Publish**: `yarn release` (pushes package to NPM). Requires NPM auth.

## Misc
- `yarn dev` serves the Vite dev server on `http://localhost:8282`.
- `yarn serve` previews production build on `http://localhost:8181`.
- All scripts run with `yarn` (v1). Do not use `npm` commands.
