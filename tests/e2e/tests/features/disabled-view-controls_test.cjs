/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('disabled-view-controls')

const accordionToggle = {
  barebones: '.jedi-accordion-toggle',
  bootstrap3: '.panel-heading',
  bootstrap4: '.card-header .btn-link',
  bootstrap5: '.accordion-button',
  tailwind4: '.jedi-accordion-toggle'
}[theme]

Scenario('Should keep the accordion toggle usable when the editor is disabled @disabled-view-controls @object-accordion', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', 'editors/object-accordion')
  I._waitForElement('.jedi-ready')
  I._scrollTo('#disable-editor')
  I._click('#disable-editor')
  I.dontSeeElement(`.jedi-ready ${accordionToggle}[disabled]`)
  I._click(`[data-path="#"] ${accordionToggle}`)
  I._waitForElement('[data-path="#/personal/name"] input')
  I.seeElement('[data-path="#/personal/name"] input[disabled]')
})

Scenario('Should let a disabled editor show and copy but not save JSON data @disabled-view-controls @edit-json-data', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', 'features/edit-json-data')
  I._waitForElement('.jedi-ready')
  I.checkOption('#editJsonData')
  I._waitForElement('.jedi-ready')
  I._scrollTo('#disable-editor')
  I._click('#disable-editor')
  I.dontSeeElement('#jedi-json-data-toggle-json-data-root[disabled]')
  I._click('#jedi-json-data-toggle-json-data-root')
  I._waitForElement('#json-data-input-json-data-root')
  I.seeElement('#json-data-input-json-data-root[readonly]:not([disabled])')
  I.dontSeeElement('#jedi-json-data-copy-json-data-root[disabled]')
  I.seeElement('#jedi-json-data-save-json-data-root[disabled]')
})
