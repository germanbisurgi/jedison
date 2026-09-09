# Contributing to Jedison

Thanks for considering a contribution. This project has a single maintainer, so
well-scoped issues and PRs make a real difference.

## Getting started

```bash
yarn install
yarn dev
```

`yarn dev` starts the playground with hot reload at `http://localhost:8282` —
this is the fastest way to try a schema against your local changes.

## Running the test suites

```bash
yarn lint      # eslint (eslint-config-standard)
yarn unit      # jest, builds the lib first
yarn e2e       # codeceptjs against the built playground (bootstrap5 theme)
yarn e2e:b3    # same suite against bootstrap3/4 themes
yarn e2e:b4
yarn e2e:b5
```

`yarn e2e:grep` runs a single scenario headed, with steps/debug output — useful
while iterating on one feature:

```bash
SHOW=true THEME='bootstrap5' yarn e2e:grep
```

A PR is expected to pass `yarn lint`, `yarn unit`, and the relevant `yarn e2e:*`
suite before review.

## Reporting a bug

The [playground](https://germanbisurgi.github.io/jedison/index.html?theme=bootstrap5)
can save and share a schema via URL — the fastest way to report an issue is to
reproduce it there and paste the resulting link, the way most existing issues
already do.

## Adding a custom editor

Extend a specific editor class (`EditorString`, `EditorNumber`, `EditorObject`,
etc.), never the internal `Editor` base class — it isn't exported and isn't a
stable extension point. See the existing editors under `src/editors/` for the
pattern, and set a `static priority()` if resolution order against other
editors matters.

## Submitting changes

- Keep PRs focused on one issue or one behavior change — easier to review, and
  easier to bisect later if something regresses.
- Reference the issue number in the PR description (`Fixes #123`).
- Add or update a test alongside the change (`tests/unit` for logic,
  `tests/e2e` for rendered behavior).
- The changelog entry under `CHANGELOG.md`'s `Unreleased` section is normally
  added at release time — you don't need to touch it in your PR.
