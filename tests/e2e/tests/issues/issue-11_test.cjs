/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-11'

Feature('issue @constraint-attributes')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @constraint-attributes', ({ I }) => {
  I._waitForElement('#root-textarea[minlength="5"][maxlength="10"]')
  I._waitForElement('#root-input[minlength="5"][maxlength="10"][pattern="^[a-z]*$"]')
})
