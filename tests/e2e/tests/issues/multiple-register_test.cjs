/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/multiple-register'

Feature('issue multiple-register')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @multiple-register should not show validation errors of inactive instance', ({ I }) => {
  I.seeInField('#editor-errors', '[]')
})
