/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'editors/editor-containerAttributes'

Feature('array-checkboxes')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
});

Scenario('@editor should add @containerAttributes', ({I}) => {
  I._waitForElement('.a-class')
  I._waitForElement('.another-class')
  I._waitForElement('[data-custom="custom-data"]')
})