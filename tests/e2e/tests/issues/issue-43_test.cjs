/* global Feature Scenario BeforeSuite */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-43'

Feature('issue-43 nav badge not cleared after cross-field constraint errors are resolved')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @issue-43 switching frame to GALACTIC shows badge, switching back to J2000 clears badge', ({ I }) => {
  // Initially no errors: J2000 frame + valid lng1 value
  I.seeInField('#editor-errors', '[]')

  // Switch frame to GALACTIC — lng1 "19:39:25.026661" contains ":" → custom constraint error
  I.selectOption('[data-path="#/targets/sources/0/frame"] select', 'GALACTIC')
  I._waitForText('Invalid GALACTIC longitude', '[data-path="#/targets/sources/0/lng1"] .jedi-error-message')
  I.seeInField('#editor-errors', 'Invalid GALACTIC longitude')

  // The "Source 1" nav-vertical tab badge must be visible
  I.seeElement('.jedi-nav-warning')

  // Switch frame back to J2000 — error must be cleared in getErrors() and the badge must disappear
  I.selectOption('[data-path="#/targets/sources/0/frame"] select', 'J2000')
  I._waitForValue('#editor-errors', '[]')
  I._waitForInvisible('.jedi-error-message')
  I._waitForInvisible('.jedi-nav-warning')
})
