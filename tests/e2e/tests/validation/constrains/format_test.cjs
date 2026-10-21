/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('format')

Scenario('@constraint @format should display validation error', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/format')
  I._selectShowErrors('always')
  I.dontSee('Invalid format: email.', '[data-path="#/email"]')
  I._checkOption('[id="assertFormat"]')
  I._waitForText('Invalid format: email.', '[data-path="#/email"]')
  I.fillField('[id="root-email"]', 'some@email.com')
  I.pressKey('Tab')
  I.dontSee('Invalid format: email.', '[data-path="#/email"]')
})
