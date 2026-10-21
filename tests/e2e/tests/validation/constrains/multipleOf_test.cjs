/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('multipleOf')

Scenario('@constraint @multipleOf should display validation errors', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/multipleOf')
  I._selectShowErrors('always')
  I.dontSee('Must be multiple of 10', '[data-path="#/number"]')
  I.dontSee('Must be multiple of 10', '[data-path="#/integer"]')
  I.fillField('[id="root-number"]', 9)
  I.pressKey('Tab')
  I.fillField('[id="root-integer"]', 9)
  I.pressKey('Tab')
  I._waitForText('Must be multiple of 10', '[data-path="#/number"]')
  I._waitForText('Must be multiple of 10', '[data-path="#/integer"]')
  I.fillField('[id="root-number"]', 100)
  I.pressKey('Tab')
  I.fillField('[id="root-integer"]', 100)
  I.pressKey('Tab')
  I.dontSee('Must be multiple of 10', '[data-path="#/number"]')
  I.dontSee('Must be multiple of 10', '[data-path="#/integer"]')
})
