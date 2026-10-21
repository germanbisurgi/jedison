/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('pattern')

Scenario('@constraint @pattern should display validation errors', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/pattern')
  I._selectShowErrors('always')
  I._waitForText('Must match the pattern: "^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$"', '[data-path="#"]')
  I.fillField('[id="root-string"]', 'test@test.com')
  I.pressKey('Tab')
  I.dontSee('Must match the pattern: "^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$"', '[data-path="#"]')
})
