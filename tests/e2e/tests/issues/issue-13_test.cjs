/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-13'

Feature('issue-13 InstanceIfThenElse should propagate arrayTemplateData to sub-instances')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @issue-13 InstanceIfThenElse should propagate arrayTemplateData to sub-instances', ({ I }) => {
  I._waitForText('Entry 1')
})
