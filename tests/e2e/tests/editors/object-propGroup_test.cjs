/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'editors/object-propGroup'

Feature('object x-propGroup')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
});

Scenario('@editor @object-propGroup should group properties activators', ({ I }) => {
  I._click('.jedi-properties-toggle')
  I.waitForElement('.jedi-properties-group-container:nth-child(1) .jedi-properties-group-name')
  I.waitForElement('.jedi-properties-group-container:nth-child(2) .jedi-properties-group-name')

  I._waitForText('Strings')
  I._waitForText('Numbers')
})
