/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('exclusiveMinimum')

Scenario('@constraint @exclusiveMinimum should display validation errors', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/exclusiveMinimum')
  I._selectShowErrors('always')
  I._waitForText('Must be greater than 100', '[data-path="#/number"]')
  I._waitForText('Must be greater than 100', '[data-path="#/integer"]')
  I.fillField('[id="root-number"]', 101)
  I.pressKey('Tab')
  I.fillField('[id="root-integer"]', 101)
  I.pressKey('Tab')
  I.dontSee('Must be greater than 100', '[data-path="#/number"]')
  I.dontSee('Must be greater than 100', '[data-path="#/integer"]')
  I.fillField('[id="root-number"]', 100)
  I.pressKey('Tab')
  I.fillField('[id="root-integer"]', 100)
  I.pressKey('Tab')
  I._waitForText('Must be greater than 100', '[data-path="#/number"]')
  I._waitForText('Must be greater than 100', '[data-path="#/integer"]')
})
