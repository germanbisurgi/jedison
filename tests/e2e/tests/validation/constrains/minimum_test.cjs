/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('minimum')

Scenario('@constraint @minimum should display validation errors', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/minimum')
  I._selectShowErrors('always')
  I._waitForText('Must be at least 100', '[data-path="#/number"]')
  I._waitForText('Must be at least 100', '[data-path="#/integer"]')
  I.fillField('[id="root-number"]', 100)
  I.pressKey('Tab')
  I.fillField('[id="root-integer"]', 100)
  I.pressKey('Tab')
  I.dontSee('Must be at least 100', '[data-path="#/number"]')
  I.dontSee('Must be at least 100', '[data-path="#/integer"]')
  I.fillField('[id="root-number"]', 99)
  I.pressKey('Tab')
  I.fillField('[id="root-integer"]', 99)
  I.pressKey('Tab')
  I._waitForText('Must be at least 100', '[data-path="#/number"]')
  I._waitForText('Must be at least 100', '[data-path="#/integer"]')
})
