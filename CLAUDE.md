# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jedison is a JavaScript library that generates interactive forms from JSON Schemas with built-in validation. It supports multiple JSON Schema drafts (04, 06, 07, 2019-09, 2020-12) and multiple UI themes (Bootstrap 3, 4, 5). It can run headless (Node.js) for server-side validation or in the browser with full UI.

## Commands

```bash
# Development
yarn dev              # Dev server on port 8282 (Vue playground)
yarn serve            # Build + preview on port 8181

# Build (outputs ESM, CJS, UMD to dist/)
yarn build

# Lint
yarn lint
yarn lint:fix

# Unit tests (JSON Schema compliance via official test suite)
yarn unit             # Builds first, then runs Jest

# E2E tests (CodeceptJS + Puppeteer, starts preview server automatically)
yarn e2e              # Default theme, 10 parallel workers
yarn e2e:b3           # Bootstrap 3
yarn e2e:b4           # Bootstrap 4
yarn e2e:b5           # Bootstrap 5
yarn e2e:*            # All themes sequentially
yarn test:full        # E2E + unit

# Run a single E2E test by grep tag
yarn e2e:clean && SHOW=true THEME='bootstrap5' start-server-and-test serve http://localhost:8181 \
  'codeceptjs run -c tests/e2e/codecept.conf.cjs --steps --debug --grep @your-tag'
```

## Architecture

The library is layered with clear separation of concerns. All source is pure ES6 modules in `src/`.

### Core (`src/jedison.js`)
Main class extending `EventEmitter`. Factory for creating type-specific instances via `createInstance()`. Manages the full form lifecycle: schema parsing, instance tree creation, validation, and UI rendering. Holds a registry (Map) of all instances.

### Instances (`src/instances/`)
Data model layer. Each JSON type has its own class (string, number, boolean, object, array, null) plus `multiple` (oneOf/anyOf) and `if-then-else`. Base class `instance.js` manages value, schema, parent/child relationships, dirty tracking, and validation state.

### Editors (`src/editors/`)
UI controller layer (~37 editors). Each editor builds DOM controls, handles user input, and displays validation errors. The base class is `editor.js`. Which editor is used for a given schema is resolved by `src/ui-resolver.js` based on schema type and `x-editor` options.

### Validation (`src/validation/`)
JSON Schema validation engine. `validator.js` orchestrates constraint checking. Each draft (`validation/drafts/`) defines which constraints apply. Individual constraints live in `validation/constrains/` (~40 files, one per keyword like `required.js`, `minimum.js`, `pattern.js`).

### Themes (`src/themes/`)
Abstract `theme.js` base with Bootstrap 3/4/5 implementations. Generates themed HTML elements. Icon sets in `themes/icons/`.

### Helpers
- `helpers/schema.js` — Schema property accessors (`getSchemaType`, `getSchemaXOption`, etc.)
- `helpers/utils.js` — Utilities (`clone`, `equal`, `isSet`, `combineDeep`, etc.)
- `ref-parser/` — `$ref` dereferencing with recursion detection
- `schema-generator/` — Generates schemas from existing JSON data
- `i18n/` — Translation system

### Entry point (`src/index.js`)
Exports all public classes as a default object. The library builds to three formats via Vite configs:
- `vite.config.prod.js` — Library build (ESM/CJS/UMD)
- `vite.config.dev.js` — Development playground (Vue)
- `vite.config.pages.js` — Documentation site

## Testing

- **Unit tests** (`tests/unit/`) — Jest, validates against the official JSON-Schema-Test-Suite for draft compliance
- **E2E tests** (`tests/e2e/`) — CodeceptJS with Puppeteer, organized into `features/`, `parsing/`, `validation/`, and `issues/` (regression tests)
- E2E tests use `@tag` annotations for grep-based filtering
- E2E runs require the preview server on port 8181 (handled by `start-server-and-test`)

## Code Style

- ESLint with `standard` config, ES2020 parser
- `dot-notation: off`, `no-new: off`, `no-var: warn`
- Note: the constraints directory is spelled `constrains` (not `constraints`)
