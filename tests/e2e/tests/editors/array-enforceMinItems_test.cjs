/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'editors/array-enforceMinItems'

Feature('array-checkboxes')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
});

Scenario('@editor @array-enforceMinItems should have as many items as declared in "x-enforceMinItems', ({I}) => {
  I._waitForElement('#root-0')
  I._waitForElement('#root-1')
})