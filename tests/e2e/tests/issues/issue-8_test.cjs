/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-8'

Feature('issue-8 array nav-vertical readonly buttons')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @issue-8 array nav-vertical readonly should disable array item buttons', ({ I }) => {
  I.dontSeeElement('.jedi-ready input:not(:disabled):not([always-enabled])')
  I.dontSeeElement('.jedi-ready textarea:not(:disabled):not([always-enabled])')
  I.dontSeeElement('.jedi-ready select:not(:disabled):not([always-enabled])')
  I.dontSeeElement('.jedi-ready button:not(:disabled):not([always-enabled])')
})