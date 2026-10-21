/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('maxLength')

Scenario('@constraint @maxLength should display validation errors', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/maxLength')
  I._selectShowErrors('always')
  I.dontSee('Must be at most 5 characters long', '[data-path="#/string"]')
  I.fillField('[id="root-string"]', 'string')
  I.pressKey('Tab')
  I._waitForText('Must be at most 5 characters long', '[data-path="#/string"]')
})
