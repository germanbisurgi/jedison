/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('exclusiveMaximum')

Scenario('@constraint @exclusiveMaximum should display validation errors', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/exclusiveMaximum')
  I._selectShowErrors('always')
  I.dontSee('Must be less than 100', '[data-path="#/number"]')
  I.dontSee('Must be less than 100', '[data-path="#/integer"]')
  I.fillField('[id="root-number"]', 100)
  I.pressKey('Tab')
  I.fillField('[id="root-integer"]', 100)
  I.pressKey('Tab')
  I._waitForText('Must be less than 100', '[data-path="#/number"]')
  I._waitForText('Must be less than 100', '[data-path="#/integer"]')
  I.fillField('[id="root-number"]', 99)
  I.pressKey('Tab')
  I.fillField('[id="root-integer"]', 99)
  I.pressKey('Tab')
  I.dontSee('Must be less than 100', '[data-path="#/number"]')
  I.dontSee('Must be less than 100', '[data-path="#/integer"]')
})
