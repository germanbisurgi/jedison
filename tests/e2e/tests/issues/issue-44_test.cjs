/* global Feature Scenario BeforeSuite */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-44'

Feature('issue-44 optional object property with required sub-properties should not produce validation errors when absent')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @issue-44 absent optional property with required sub-properties produces no errors', ({ I }) => {
  // Value is { "id": "a" } — subtype is absent and optional
  // No errors should be reported for #/subtype/prop1
  I.seeInField('#editor-errors', '[]')
})
