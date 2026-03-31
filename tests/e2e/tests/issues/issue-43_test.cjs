/* global Feature Scenario BeforeSuite */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-43'

Feature('issue-43 stale validation cache with cross-instance custom constraints')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @issue-43 switching frame to GALACTIC shows error, switching back to J2000 clears it', ({ I }) => {
  // Initially no errors: J2000 frame + matching lng1 value
  I.seeInField('#editor-errors', '[]')

  // Switch frame to GALACTIC — lng1 "19:39:25.026661" contains ":" → custom constraint error
  I.selectOption('[data-path="#/targets/frame"] select', 'GALACTIC')
  I._waitForText('Invalid GALACTIC longitude', '[data-path="#/targets/lng1"] .jedi-error-message')
  I.seeInField('#editor-errors', 'Invalid GALACTIC longitude')

  // Switch frame back to J2000 — error must be cleared in both getErrors() and the UI
  I.selectOption('[data-path="#/targets/frame"] select', 'J2000')
  I._waitForValue('#editor-errors', '[]')
  I._waitForInvisible('.jedi-error-message')
})
