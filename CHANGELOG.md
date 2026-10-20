### 1.28.1

- Fixed `$ref` resolution: refs now resolve against the nearest `$id` (relative and URN base URIs), `$anchor` is supported, `~0`, `~1` and `%XX` are decoded in JSON pointers, and `$ref` to a boolean schema works. Remote refs are loaded by document URL and honor the `#/pointer` instead of returning the whole document
- Fixed `unevaluatedProperties` to follow the spec: a property only counts as evaluated if a keyword that applied touched it (`anyOf`/`oneOf` branches must validate; `additionalProperties`, `if`/`then`/`else`, `dependentSchemas` and `$ref` are handled), and a schema is accepted as value, not only a boolean. Forms that passed only because of a non-matching branch can now report errors
- Fixed `if`/`then`/`else`: a property declared only inside `if` now decides the branch, errors from the branch that was active before no longer remain after `setValue()`, and the schema object passed to `Jedison` is no longer stripped of its `if`/`then`/`else`
- Added `unevaluatedItems` validation (`prefixItems`, `items`, `contains`, `allOf`, valid `anyOf`/`oneOf` branches, `if`/`then`/`else` and `$ref` count as evaluated)
- Added `assertFormat` checks for `date`, `time`, `date-time`, `duration`, `ipv4`, `ipv6`, `hostname`, `uri`, `uri-reference`, `uri-template`, `json-pointer`, `relative-json-pointer` and `regex`. Values of these formats that were silently accepted can now report errors
- Fixed `pattern` and `patternProperties` to use unicode regex semantics, and an `$id` inside an unknown keyword is no longer treated as a schema identifier
- Added multi-draft support: `$schema` drafts 4, 6, 7 and 2019-09 are normalized to 2020-12 (`items` array, `additionalItems`, `dependencies`, draft 4 `id` and boolean `exclusiveMinimum`/`exclusiveMaximum`, `$id: "#x"`). `$dynamicRef` and `$recursiveRef` are not supported
- Added the `keepRefSiblings` option (default `false`): per spec, keywords next to `$ref` are ignored up to draft 7. Set it to `true` to keep merging them
- Fixed `multipleOf` for decimals (`0.3` / `0.1`), `minLength` / `maxLength` to count code points, `$ref` to inherited keys such as `constructor`, and endless loops on self-referencing `$ref` chains and empty `$ref`
- Fixed XSS through property names, schema titles, data keys and error messages used as labels
- Fixed `purifyData` altering plain text such as `a < b`

### 1.28.0

- Added `ThemeTailwind4`
- 
### 1.27.2

- Fixed issue #88: `format: "url"` validation could freeze the page and throw "too much recursion" on some URLs (regex backtracking). It now uses the native `URL` parser; accepted schemes (`http`, `https`, `ftp`) and the TLD/IPv4 host requirement are unchanged

### 1.27.1

- Fixed issue #86: table header cells were not wrapped in a `<tr>`, which produced invalid markup in the `table` and `table-object` formats

### 1.27.0

- Added a BPMN editor (`x-format: "bpmn"`) for BPMN 2.0 XML strings, built on [bpmn-js](https://github.com/bpmn-io/bpmn-js) and used only when `window.BpmnJS` is loaded. Set `"x-purifyData": false` on the field. bpmn-js is not MIT licensed: its license requires the bpmn.io logo to stay visible
- Added the `readOnly` option (default `false`): a view-only form where collapse toggles and "View JSON" (copy only) still work, text fields are `readonly` and structure buttons are hidden. A schema `readOnly` behaves the same. Unlike `disable()`, nothing is greyed out
- The "Edit JSON" button now has a text label (new translation keys `editJson` and `viewJson`)
- Fixed: `table` and `table-object` arrays rendered an empty buttons column when no row button was shown

### 1.26.0

- Improved performance of large arrays, including the `table` and `table-object` formats: editing a field or calling `setValue()` is now much faster (300 items: about 220 ms to 12 ms per edit). First render and the `nav` formats are unchanged
- Added "Large array", "Large table" and "Large table of objects" examples and a "Sticky" sidebar checkbox to the playground

### 1.25.0

- Added `x-purifyData` to override the `purifyData` option per schema, like `x-purifyHtml` does for `purifyHtml`. `"x-purifyData": false` keeps a string exactly as it is, which matters for fields where markup is content, for example a Markdown editor holding an HTML comment: DOMPurify removes comments, so the field showed (and saved) an empty string. Without it nothing changes

### 1.24.0

- Added `x-ace.options` for the Ace editor (`x-format: "ace"`): the object is passed to Ace's `setOptions`, so any Ace option works like the options of the SimpleMDE and Milkdown editors do. For example `"x-ace": { "mode": "markdown", "options": { "minLines": 3, "maxLines": 60, "wrap": true } }` makes the editor as high as its content (between `minLines` and `maxLines`) and wraps long lines. Without `options` nothing changes

### 1.23.3

- Fixed: disabled editors can still expand accordions and view/copy JSON in the "Edit JSON" dialog

### 1.23.2

- Fixed issue #84: a nullable object with `properties` and `"default": null` crashed the editor (`hasOwn` on `null`) - the `object` branch inherited the wrapper's `null` default. Branches now only inherit a `default` that fits their type

### 1.23.1

- Fixed issue #82: the object editor's "Add property" control was fully disabled whenever `additionalProperties: false` was set, even when `patternProperties` still allowed adding a matching property name. The control now stays available in that case, and rejects (with an inline message) a name that matches neither `properties` nor `patternProperties`, instead of silently accepting it and only failing validation afterwards.

### 1.23.0

- Added `keepMissingSchemaFields` option: when `true`, schema-defined properties that are missing from the value will remain visible in the form instead of being hidden. Default is `false` for backward compatibility.
- Fixed issue #78: `x-defaultProperty` had no effect when declared on a property behind a `$ref`

### 1.22.3

- Fixed issue #56: calling `setValue()` directly on a deactivated instance (e.g. a non-required property under `x-deactivateNonRequired`) updated its own value but left it inactive, so the parent object's aggregated value never picked up the change - `setValue()` now reactivates the instance, matching what already happens when a value is set through the parent's own `refreshInstances()`
- Fixed issue #80: `parseMarkdown: true` threw instead of degrading when `window.marked` wasn't loaded - `markdownEnabled` now checks for `window.marked`'s presence the same way `purifyContent()` already checks for `window.DOMPurify`, and warns once instead of crashing

### 1.22.2

- Fixed issue #78: `x-defaultProperties`/`x-defaultProperty` had no effect on `oneOf`/`anyOf` branches under `x-discriminator` - `InstanceMultiple` was stomping each branch's defaults with an empty placeholder right after creation, also letting properties leak between branches

### 1.22.1

- Fixed issue #79: `x-buttons` on an array editor (`nav-horizontal`/`nav-vertical`/default) never fired - `refreshUI()` cleared the button's click listener right after it was registered. Schema-button listeners now live in their own list, separate from the one array editors clear on every refresh
- The object editor's "Add property" button now has its own icon (a circled plus) instead of reusing the array's plain "Add item" plus, which made the two easy to confuse

### 1.22.0

- Added issue #78: `x-defaultProperties` lets an object schema whitelist which optional properties show by default, without needing the properties-toggle opt-in
- Added issue #78: `x-defaultProperty` lets a property override that whitelist on its own schema, so a property reused via `$ref` can decide its own default visibility per consumer

### 1.21.1

- security updates

### 1.21.0

- Fixed issue #70: `dist` now rebuilds on version bump and before publish, so `Jedison.version` matches the package version
- Added issue #71: custom/built-in editors can set a `static priority()` to control resolution order
- Added issue #72: `deprecated: true` now adds a `jedi-deprecated` class to the field's container

### 1.20.2

- Fixed issue #69: exposed a runtime `version`, contained editor-resolution errors, fixed the `constraints` default type mismatch

### 1.20.1

- Fixed issue #68: titles/descriptions no longer re-parsed through `marked`/`DOMPurify` on every change

### 1.20.0

- Added Tom Select editor (`x-format: "tom-select"`)
- Added RefParser constructor options
- Fixed awesomplete issue #67
- Fixed security updates

### 1.19.0

- Added Milkdown editor (`x-format: "milkdown"`), a WYSIWYG markdown editor built on ProseMirror and Remark
- security updates

### 1.18.0

- Vertical nav now shrinks to fit its widest label instead of a fixed ~33% column; added `x-navMinWidth`/`x-navMaxWidth`
- Vertical nav now stacks full-width on narrow containers, via a container query

### 1.17.0

- Added `applyOverlay` helper: apply an OpenAPI-Overlay-style document (ordered `update`/`remove` actions targeted by a JSONPath subset) to layer presentation directives (`x-format`, `x-hidden`, …) onto a schema without editing the source
- Fixed issue #65: with `nav-horizontal`/`nav-vertical` and `if/then` conditions, toggling a field no longer resets the active tab to the first one
- Fixed nav tabs losing a manual tab click when it coincided with a field edit; tabs now render in place instead of rebuilding the whole tab DOM on every change
- security updates

### 1.16.2

- The whole editor header (title/legend) is now clickable to toggle collapse, not just the toggle button
- security updates

### 1.16.1

- Fixed `x-info` modal button being duplicated in every row of `table`/`table-object` arrays; the info button now appears only once, in the column header

### 1.16.0

- Added `x-buttons` keyword for schema-defined action buttons
- Fixed switcher disappearing/floating above the editor when embedded (`select-inline`/`modal`) into an `if/then/else` branch or a nested `anyOf`/`oneOf`
- Nested `anyOf`/`oneOf` switchers now stack instead of overwriting each other
- Object/array switcher now sits next to the title, consistent with other editors
- Deprecated `x-embedSwitcher` in favor of `x-switcherInput: "select-inline"`

### 1.15.0

- Added `switcherInput: 'select-inline'` option

### 1.14.0

- Added object radios editor
- Larger dialogs

### 1.13.0

- added `switcherTypeLabels` option and `x-switcherTypeLabels` x-option to override the default type names displayed in the multiple-type switcher
- security updates

### 1.12.3

- Added object horizontal editor (experimental)
- Added `x-card'`option (experimental)

### 1.12.2

- fixed multiple switching between numeric instances issue

### 1.12.1

- Improved UI

### 1.12.0

- added filepond plugin editor
- added `"x-sortable"` option for array-checkboxes
- added `"x-format": "accordion"`
- added switcherInput `modal` option  
- security updates
- fixed issue #50 (Icon doesn't display, depending on x-format)

### 1.11.2

- security updates
- boosted performance

### 1.11.1

- fixed issue #43 (Optional property of a type object creates an error)

### 1.11.0

- Array nav support for `x-sortable`
- Security updates
- fixed issue #43 (Custom constraint errors persist in UI nested)
- Copy json data to clipboard feature

### 1.10.1

- fixed issue #43 (Custom constraint errors persist in UI)

### 1.10.0

- added pickr editor
- fixed issue #32 (memory leak)
- fixed issue #42 (x-info content not scoped)

### 1.9.1

- Security updates

### 1.9.0

- added `x-categoryOrder` option
- fixed issue #35
- fixed issue #33
- fixed issue #31. Added x-titleTemplate fallback when placeholder is empty

### 1.8.0

- added `arrayDeleteAll` and `x-arrayDeleteAll` options
- added `arrayFooterAdd` and `x-arrayFooterAdd` options
- added `arrayFooterButtonsPosition` and `x-arrayFooterButtonsPosition` options
- added `arrayFooterDeleteAll` and `x-arrayarrayFooterDeleteAllDeleteAll` options
- Fix registration of correct if-then-else branch

### 1.7.0

- Updated character-creator example to showcase correct use of `oneOf` and `x-discriminator`
- Prefixed tabs IDs with editor ID to avoid clashes
- Added `arrayAddAfter` feature
- Fixed issue #24 `"x-format": "choices"` doesn't trigger when items is a `$ref`

### 1.6.0

- Added warning in legends
- Added discriminator validation
- Added AnyJson editor
- Added subErrors option
- Added `x-propGroupOrder` schema option,
- Added `x-embedSwitcher` schema option,
- Added `arrayDeleteConfirm` option

### 1.5.2

- Improved accessibility
- Security updates

### 1.5.1

- Tabs should not render when `x-hidden: true`
- Security updates

### 1.5.0

- Added categories editor
- Fix issue #17 using data option

### 1.4.4

- Fix issue #17 data partially missing when using `additionalProperties`

### 1.4.3

- Fix minor regression

### 1.4.2

- Performance boosts

### 1.4.1

- Fixed issue 13 InstanceIfThenElse should propagate arrayTemplateData to sub-instances

### 1.4.0

- Added array tuple editor
- Added configurable `muteValidationMessages` option to control which constraint errors are hidden in the UI

### 1.3.6

- Fixed tab warning indicators updating with a 1-step delay

### 1.3.5

- Better Tabs layout

### 1.3.4

- Fixed oneOf fit test

### 1.3.3

- Fixed crash in array editors when value is not an array

### 1.3.2

- Security updates

### 1.3.1

- Fixed bug with arrays when setting non-array values
- Configurable nav warning messages

### 1.3.0

- Added `useConstraintAttributes` option
- Added `length` and `remaining` template data

### 1.2.0

- Added "arrayButtonsPosition" option
- Improved array editor with adaptive td for buttons

### 1.1.0

- Added "purifyData" option

### 1.0.0

- Detect and flag recursive schemas when dereferencing refs
- Compliance with new official JSON-Schema-Test-Suite

### 0.3.26

- Bugfix for Jodit plugin

### 0.3.25

- Added template functions

### 0.3.24

- Added ace editor

### 0.3.23

- Fixed array nav-vertical readonly buttons not being properly disabled

### 0.3.22

- Exposed Editor.js
- Added parent reference to templates
- Extended editJsonData feature to support arrays with toggle button and dialog functionality
- Implemented an event listener cleanup system to prevent memory leaks

### 0.3.21

- Builds

### 0.3.20

- Added editJsonData feature
- Security updates  
- Ensured disabled state for readOnly editors
- Fixed nav editors, responsive cols
- Fixed option override enablePropertiesToggle

### 0.3.19

- Added showErrors on input feature

### 0.3.18

- Added grid breakpoints feature
- Fixed issue with multiple instance registering

### 0.3.17

- Hide array table object header when empty
- Added enforceMaxItems option

### 0.3.16

- Fixed issue oneOf and properties validator

### 0.3.15

- Fixed issue with more complex if-the-else + nullables scenario

### 0.3.14

- Fixed range resolve function issue

### 0.3.13

- Fixed syntax issue

### 0.3.12

- Fixed double id issue with navs
- Improved performance

### 0.3.11

- improved performance

### 0.3.10

- Added `x-propGroup` option
- Added number imask editor
- Added SimpleMDE editor

### 0.3.9

- "title" and "description" templates

### 0.3.8

- Fixed issue with if-then-else + nullable (multiple) initial values

### 0.3.7

- Fixed array items disabled state

### 0.3.6

- Enforce the use of "x-format" for consistency

### 0.3.5

- Added number input nullable editor and example

### 0.3.4

- Security updates

### 0.3.3

- Fixed issue with if-then-else initial values

### 0.3.2

- Better number input interaction

### 0.3.1

- Fixed "x-format": "table" naming

### 0.3.0

- Fixed trailing 0 in number inputs
- Array "x-format": "table" (generic) and "x-format": "table-object" (objects items specific)

### 0.2.3

- Fixed array table issue with ref parser

### 0.2.2

- Array nav actions inside tab

### 0.2.1

- Fixed issue with a table array
- Fixed fontawesome three missing buttons

### 0.2.0

- Added option `'constraints'` to add custom constraints (validators)
- Added type property to error messages `'error'` | `'warning'`
