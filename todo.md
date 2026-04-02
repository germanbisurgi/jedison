## Todo

### notes

- options, deprecate old names but keep aliases for retro compatibility

### braking

- enforceConst true default
- Validation: support multiple drafts
- Validation: formats: https://json-schema.org/understanding-json-schema/reference/string#format
- implement clearStoredEventListeners() in all editors that need event listener cleanup
- disable add item if maxItems reached
- array copy value button
- array set value button
- object copy value button
- object set value button
- object activators sort by property order
- use super.refreshUI() in all editors
- error messages subcategories by data type?
- use editor methods and overrides in build configs
- recursive collapse

#### New Editors
- Editor: SignaturePad
- Editor: Void instance (for buttons, and other stuff). Does not register
- Editor: input file
- Editor: color picker

#### UI Enhancements
- responsive options (xs, sm, sd, lg) for nav editors
- array nav-horizontal needs left and right arrows buttons instead of up and down
- array items titles in item containers
- collapse expands text and animation, collapse children on collapse
- info variant tooltip
- info variant popover

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
