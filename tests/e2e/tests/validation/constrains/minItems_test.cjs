/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('minItems')

Scenario('@constraint @minItems should display validation errors', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/minItems')
  I._selectShowErrors('always')
  I._uncheckOption('[id="enforceMinItems"]')
  I._waitForElement('.jedi-ready')
  I._waitForText('Must have at least 1 items', '[data-path="#/array"]')
  I._click('.jedi-array-add')
  I.dontSee('Must have at least 1 items', '[data-path="#/array"]')
})
