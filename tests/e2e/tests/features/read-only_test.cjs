/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'

Feature('read-only')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', 'features/read-only')
  I._waitForElement('.jedi-ready')
})

Scenario('Should hide the properties toggle and keep collapse usable @read-only', ({ I }) => {
  I.dontSeeElement('[data-path="#"] .jedi-properties-toggle')
  I.seeElement('[data-path="#"] .jedi-collapse-toggle')
  I.dontSeeElement('[data-path="#"] .jedi-collapse-toggle[disabled]')
})

Scenario('Should let a read-only editor view and copy but not save JSON data @read-only', ({ I }) => {
  I.dontSeeElement('#jedi-json-data-toggle-json-data-root[disabled]')
  I.see('View JSON', '#jedi-json-data-toggle-json-data-root')
  I._click('#jedi-json-data-toggle-json-data-root')
  I._waitForElement('#json-data-input-json-data-root')
  I.seeElement('#json-data-input-json-data-root[readonly]:not([disabled])')
  I.dontSeeElement('#jedi-json-data-copy-json-data-root[disabled]')
  I.dontSeeElement('#jedi-json-data-save-json-data-root')
})

Scenario('Should not render the buttons column of a table in a read-only editor @read-only', ({ I }) => {
  I.click('Arrays')
  I._waitForElement('[data-path="#/Arrays/array-table"]')
  I.dontSeeElement('[data-path="#/Arrays/array-table"] .jedi-array-delete')
  I.seeNumberOfElements('[data-path="#/Arrays/array-table"] thead th', 1)
})
