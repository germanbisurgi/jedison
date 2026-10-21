/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'editors/object-buttons-content'

Feature('object')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
});

Scenario('@editor @object-buttons-content should override object buttons content', ({I}) => {
  I._waitForText('PROPERTIES', '.jedi-properties-toggle')
  I._waitForText('COLLAPSE', '.jedi-collapse-toggle')
  I.click('.jedi-properties-toggle')
  I._waitForText('ADD PROPERTY')
})
