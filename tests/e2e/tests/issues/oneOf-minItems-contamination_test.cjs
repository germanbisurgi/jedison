/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/oneOf-minItems-contamination'

Feature('issue oneOf minItems contamination - Dynamic option should not trigger static minItems validation')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @oneOf-minItems-contamination should not show validation errors for valid dynamic option', ({ I }) => {
  // Verify that the editor-errors textarea is empty (no validation errors)
  I.seeInField('#editor-errors', '[]')
})
