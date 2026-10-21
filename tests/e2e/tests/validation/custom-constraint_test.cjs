/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('Custom constraint')

Scenario('should display @warning from @custom-constraint', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}&example=custom/custom-constraint&showErrors=always`)
  I._waitForElement('.jedi-ready')
  I._waitForText('Must be at least 4 characters long.', '[data-path="#"] .jedi-error-message')
  I._waitForText('Value should be equal to "test"', '[data-path="#"] .jedi-warning-message')
  I._fillField('#root', 'abcd')
  I._waitForInvisible('.jedi-error-message')
  I._waitForText('Value should be equal to "test"', '[data-path="#"] .jedi-warning-message')
  I._fillField('#root', 'test')
  I._waitForInvisible('.jedi-error-message')
  I._waitForInvisible('.jedi-warning-message')
})
