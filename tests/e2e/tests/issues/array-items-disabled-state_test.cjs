/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/array-items-disabled-state'

Feature('issue if-then-else-initial-value-enforceConst')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @array-items-disabled-state', ({ I }) => {
  I._waitForElement('#root-array-0-prop[readonly]')
})