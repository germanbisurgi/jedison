/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('anyOf')

Scenario('@constraint @anyOf should display validation errors', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/anyOf')
  I._selectShowErrors('always')
  I._waitForText('Must validate against at least one of the provided schemas', '[data-path="#/string"]')
  I.fillField('[id="root-string"]', 'Albert')
  I.pressKey('Tab')
  I._click('#set-value')
  I.dontSee('Must validate against at least one of the provided schemas', '[data-path="#/string"]')
})
