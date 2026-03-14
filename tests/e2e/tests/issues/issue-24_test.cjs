/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-24'

Feature('issue-24 x-format choices should trigger when items is a $ref')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @issue-24 should render Choices widget when items is a $ref', ({ I }) => {
  I._waitForElement('.choices')
})
