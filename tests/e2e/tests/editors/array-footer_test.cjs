/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'editors/array-footer'

Feature('array-footer')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@editor @array-footer should show @footer-delete-all button', ({ I }) => {
  I._waitForElement('[data-path="#/default"] .jedi-array-footer .jedi-array-delete-all')
})

Scenario('@editor @array-footer should NOT show @delete-all when option is false', ({ I }) => {
  I.dontSeeElement('[data-path="#/footer_left"] .jedi-array-delete-all')
})

Scenario('@editor @array-footer footer buttons should be @right-aligned by default', ({ I }) => {
  I._waitForElement('[data-path="#/default"] .jedi-array-footer .jedi-btn-group[style*="margin-left"]')
})

Scenario('@editor @array-footer footer buttons should be @left-aligned when configured', ({ I }) => {
  I.dontSeeElement('[data-path="#/footer_left"] .jedi-array-footer .jedi-btn-group[style*="margin-left"]')
})

Scenario('@editor @array-footer @delete-all should remove all items and @delete-all should be @disabled when array is empty', ({ I }) => {
  I.waitForElement('[data-path="#/default"] .jedi-array-delete-all')
  I.waitForElement('[data-path="#/default"] .jedi-array-footer .jedi-array-delete-all')
  I.waitForElement('[data-path="#/default"] .jedi-array-delete')
  I._click('[data-path="#/default"] .jedi-array-delete-all')
  I.seeInPopup('Are you sure you want to delete all items?')
  I.acceptPopup()
  I.dontSeeElement('[data-path="#/default"] .jedi-array-delete')
  I.waitForElement('[data-path="#/default"] .jedi-array-delete-all:disabled')
  I.waitForElement('[data-path="#/default"] .jedi-array-footer .jedi-array-delete-all:disabled')
})
