## Todo

### Essential (Core functionality and fixes)

#### Bug Fixes & Critical Issues
- focus issues with safari?
- implement clearStoredEventListeners() in all editors that need event listener cleanup

#### Core Validation
- Validation: support multiple drafts
- Validation: formats: https://json-schema.org/understanding-json-schema/reference/string#format

#### Core Array/Object Features
- disable add item if maxItems reached
- array copy value button
- array set value button
- object copy value button
- object set value button
- object activators sort by property order

#### Critical Refactoring
- refactor setInitialValue
- use super.refreshUI() in all editors

#### Core Functionality
- "properties" button + and additionalProperties
- error messages subcategories by data type?
- use editor methods and overrides in build configs

### Nice to Have (Enhancements)

#### New Editors
- Editor: SignaturePad
- Editor: Void instance (for buttons, and other stuff). Does not register
- Editor: input file
- Editor: color picker

#### UI Enhancements
- responsive options (xs, sm, sd, lg) for nav editors
- array nav-horizontal needs left and right arrows buttons instead of up and down
- array items titles in item containers
- array nav drag
- collapse expands text and animation, collapse children on collapse
- info variant tooltip
- info variant popover
- inline switch activators

#### Theme Improvements
- Themes: a theme option should be a string. to better handle config and config options and avoid duplication
- Themes: refactor theme.getCollapseToggle
- Themes: ionic
- Themes: material
- Themes: append descriptions if set and not hidden
- Themes: type hidden description

#### Additional Features
- x-selectEnum and x-selectEnumTitles
- context params in events
- enum titles are content parsing (to allow HTML icons and stuff)
- translation with template compiling
- object activators conditional visibility?
