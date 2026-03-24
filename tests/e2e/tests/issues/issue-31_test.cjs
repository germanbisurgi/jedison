/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-31'

Feature('issue-31 x-titleTemplate fallback when placeholder is empty')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @issue-31 tab with a name shows the resolved value', ({ I }) => {
  I._waitForText('Alice', '[href="#tab-pane-root-0"] .jedi-nav-text')
})

Scenario('@issue @issue-31 tab without a name shows the explicit fallback', ({ I }) => {
  I._waitForText('Unnamed', '[href="#tab-pane-root-1"] .jedi-nav-text')
})

Scenario('@issue @issue-31 setting a name updates the tab title', ({ I }) => {
  I._setEditorValue('[{"name":"Alice"},{"name":"Bob"}]')
  I._waitForText('Bob', '[href="#tab-pane-root-1"] .jedi-nav-text')
})
