/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('maxItems')

Scenario('@constraint @maxItems should display validation errors', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}&example=validator/maxItems&showErrors=always`)
  I._waitForElement('.jedi-ready')
  I.dontSee('Must have at most 3 items', '[data-path="#/array"]')
  I._click('.jedi-array-add')
  I.dontSee('Must have at most 3 items', '[data-path="#/array"]')
  I.fillField('#editor-value', JSON.stringify({
    "array": [
      "Albert",
      "Betti",
      "Carl",
      "Daniel"
    ]
  }))
  I._click('#set-value')
  I._waitForText('Must have at most 3 items', '[data-path="#/array"]')
})
