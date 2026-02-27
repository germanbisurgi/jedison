# Jedison Performance Optimization Roadmap

## Problem Statement

Complex schemas (perf-checkbox.json, perf-oneOf.json, perf-oneOf-discriminator.json) produce
1+ second delays per single value change. These schemas feature:
- Root array with 1-5 items of complex objects
- Nested if-then-else conditionals (7 levels deep)
- oneOf with 2+ branches per array item
- ~42 enum values across nested properties
- 7-8 levels of nesting depth

---

## Bottleneck Analysis

### B1: Temporary Jedison instances for validation (CRITICAL)

**Where:** `src/instances/multiple.js:162-185`, `src/instances/if-then-else.js:239-246`,
and 13 validation constraint files.

**What happens:** `getFittestIndex()` creates a full `new Jedison()` instance for each
oneOf/anyOf option just to validate. Each temporary Jedison builds the entire instance tree,
registers instances, sets up event listeners, and creates editors. For a oneOf with 2 branches,
2 complete instance trees are created and destroyed on every value change.

The same pattern exists in 13 constraint files under `src/validation/constrains/`:
`oneOf.js`, `anyOf.js`, `allOf.js`, `if-then-else.js`, `items.js`, `contains.js`, `not.js`,
`dependentSchemas.js`, `prefixItems.js`, `additionalProperties.js`, `unevaluatedProperties.js`,
`patternProperties.js`, `propertyNames.js`.

**Why it's slow:** With 5 array items, each containing oneOf + if-then-else, a single keystroke
can spawn dozens of temporary full instance trees. This is exponential in nesting depth.

**Key insight:** `properties.js` already validates correctly by calling
`context.validator.getErrors()` directly — proving the pattern works without temp instances.

---

### B2: JSON.parse/JSON.stringify cloning (CRITICAL)

**Where:** `src/helpers/utils.js:11-17` (`clone()`), called from 60+ sites across 9 files.

**What happens:** Every `getValue()` call (instance.js:276) returns `clone(this.value)` using
`JSON.parse(JSON.stringify(thing))`. During cascading parent updates, `onChildChange()` calls
`child.getValue()` for every child at every tree level.

**Why it's slow:** An object with 10 properties at 3 nesting levels triggers 30+ full
JSON serialization round-trips per keystroke. Primitives (strings, numbers, booleans) are
needlessly serialized and parsed.

---

### B3: `equal()`/`different()` using JSON.stringify (CRITICAL)

**Where:** `src/helpers/utils.js:76-94`

**What happens:** `equal()` calls `sortObject()` (allocates new objects) then
`JSON.stringify()` on both values. `different()` wraps `equal()`. Called in every
`setValue()` (instance.js:351) and every `refreshInstances()` comparison (object.js:292).

**Why it's slow:** O(N) serialization for every comparison, no short-circuit on first
difference, unnecessary object allocation in `sortObject()`.

---

### B4: Array child reconstruction (HIGH)

**Where:** `src/instances/array.js:127-146` (`refreshChildren()`)

**What happens:** On every `set-value` event, ALL children are discarded (`this.children = []`)
and recreated from scratch. Each child is a full instance with potential sub-trees.

**Why it's slow:** Editing a single field in an array item destroys and recreates the entire
array's instance tree (all items, not just the changed one).

---

### B5: Object refreshInstances redundant work (HIGH)

**Where:** `src/instances/object.js:275-322`

**What happens:** Called on every `set-value`. Walks all value keys, calls `different()`
(B3) for each child, and calls `sortChildrenByPropertyOrder()` (line 318) every time even
though property order comes from the schema and never changes at runtime.

---

### B6: Validator clones schema on every call (MEDIUM)

**Where:** `src/validation/validator.js:35`

**What happens:** `getErrors()` does `const schemaClone = clone(schema)` on every invocation.
No constraint function mutates the schema — they only read from `context.schema`.

---

### B7: EventEmitter uses linear scan (MEDIUM)

**Where:** `src/event-emitter.js:30`

**What happens:** `emit()` calls `this.listeners.filter(l => l.name === name)` — a linear
scan of ALL listeners for ALL event types on every emit. With hundreds of instances each
having 3-4 event types, this adds up.

---

### B8: Watched path scanning (LOW-MEDIUM)

**Where:** `src/jedison.js:243-251`

**What happens:** Every `instance-change` event iterates `Object.entries(this.watched)` to
find matching paths. Direct Map/object lookup would be O(1).

---

## Optimization Roadmap

### Phase 1: Replace clone/equal/different
| | |
|---|---|
| **Goal** | Eliminate the slowest utility functions that run on every operation |
| **Impact** | HIGH (est. 30-50% reduction) |
| **Risk** | LOW — drop-in replacement, same external behavior |
| **Targets** | B2, B3 |
| **Files** | `src/helpers/utils.js` |
| **Approach** | Primitive short-circuit in `clone()`, `structuredClone` for objects. Recursive `equal()` with early exit on first difference. No `sortObject`, no `JSON.stringify`. |
| **Status** | Pending |
| **Benchmark** | — |

### Phase 2: Remove validator schema clone
| | |
|---|---|
| **Goal** | Stop cloning schema in `getErrors()` — constraints are read-only |
| **Impact** | MEDIUM |
| **Risk** | LOW — verified no constraint mutates schema |
| **Targets** | B6 |
| **Files** | `src/validation/validator.js` |
| **Approach** | Remove `clone(schema)` at line 35, use schema directly. |
| **Status** | Pending |
| **Benchmark** | — |

### Phase 3: EventEmitter optimization
| | |
|---|---|
| **Goal** | O(1) event dispatch instead of linear filter |
| **Impact** | MEDIUM |
| **Risk** | LOW |
| **Targets** | B7, B8 |
| **Files** | `src/event-emitter.js`, `src/jedison.js` |
| **Approach** | Map-based listener storage. Direct property lookup for watched paths. |
| **Status** | Pending |
| **Benchmark** | — |

### Phase 4: Internal getValueRaw()
| | |
|---|---|
| **Goal** | Avoid cloning for trusted internal callers (onChildChange, refreshInstances) |
| **Impact** | HIGH (est. 70-80% fewer clones) |
| **Risk** | LOW-MEDIUM — must ensure internal callers don't mutate returned values |
| **Targets** | B2 |
| **Files** | `src/instances/instance.js`, `object.js`, `array.js`, `multiple.js`, `if-then-else.js` |
| **Approach** | Add `getValueRaw()` returning `this.value` directly. Replace `getValue()` with `getValueRaw()` in internal aggregation paths. Keep `getValue()` with clone for public API. |
| **Status** | Pending |
| **Benchmark** | — |

### Phase 5: Eliminate temp Jedison in validation
| | |
|---|---|
| **Goal** | Replace `new Jedison()` pattern with direct `validator.getErrors()` calls |
| **Impact** | VERY HIGH (est. 50-80% reduction in getFittestIndex time) |
| **Risk** | MEDIUM — must produce identical validation results |
| **Targets** | B1 |
| **Files** | `src/instances/multiple.js`, `src/instances/if-then-else.js`, 13 files in `src/validation/constrains/` |
| **Approach** | Replace `new Jedison({schema, data}).getErrors()` with `validator.getErrors(value, schema, key, path)`. Already proven by `properties.js` constraint which uses this pattern. |
| **Status** | Pending |
| **Benchmark** | — |

### Phase 6: Differential array/object refresh
| | |
|---|---|
| **Goal** | Update existing children in-place instead of destroy/recreate |
| **Impact** | MEDIUM-HIGH |
| **Risk** | MEDIUM — array index/path management needs care |
| **Targets** | B4, B5 |
| **Files** | `src/instances/array.js`, `src/instances/object.js` |
| **Approach** | Array: reuse existing children, only create/destroy at boundaries. Object: sort once in `prepare()`, remove from `refreshInstances()`. |
| **Status** | Pending |
| **Benchmark** | — |

### Phase 7: Validation result caching (Architectural)
| | |
|---|---|
| **Goal** | Cache validation results to skip repeated getFittestIndex revalidation |
| **Impact** | HIGH for repeated operations |
| **Risk** | MEDIUM — requires cache invalidation strategy |
| **Targets** | B1 (further optimization) |
| **Files** | `src/validation/validator.js`, `src/instances/multiple.js` |
| **Approach** | Map-based cache keyed by schema ref + value hash. Only implement if Phases 1-6 insufficient. |
| **Status** | Pending |
| **Benchmark** | — |

---

## Benchmarks

Measured with perf-oneOf-discriminator.json schema in the playground.

| Metric | Baseline | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | Phase 7 |
|--------|----------|---------|---------|---------|---------|---------|---------|---------|
| Init time (ms) | — | — | — | — | — | — | — | — |
| Single field change (ms) | — | — | — | — | — | — | — | — |
| getErrors() time (ms) | — | — | — | — | — | — | — | — |

---

## Verification Checklist (per phase)

- [ ] `yarn unit` — all JSON Schema Test Suite tests pass
- [ ] `yarn e2e` — all end-to-end tests pass
- [ ] Manual test with perf-checkbox, perf-oneOf, perf-oneOf-discriminator schemas
- [ ] Record benchmark numbers in table above
