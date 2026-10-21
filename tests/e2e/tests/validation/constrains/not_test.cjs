/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('not')

Scenario('@constraint @not should display validation errors', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/not')
  I.fillField('[id^="root-test-switcher"]', 'String')
  I._waitForText('Must not validate against the provided schema', '[data-path="#/test"]')
  I.fillField('[id^="root-test-switcher"]', 'Number')
  I._waitForInvisible('Must not validate against the provided schema', '[data-path="#/test"]')
})
