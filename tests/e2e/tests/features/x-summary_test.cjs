/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'features/x-summary'

Feature('x-summary')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
})

Scenario('@feature @x-summary should show x-summary instead of description', ({ I }) => {
  I._waitForText('Short summary shown in the form.', '[data-path="#/name"]')
  I.dontSee('Long description for the API documentation', '[data-path="#/name"]')
})

Scenario('@feature @x-summary should fall back to description', ({ I }) => {
  I._waitForText('Without x-summary the description is shown.', '[data-path="#/email"]')
})
