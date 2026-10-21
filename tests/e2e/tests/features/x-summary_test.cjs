/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'features/x-summary'

Feature('x-summary')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
})

Scenario('@feature @x-summary should show the summary and collapse the description', ({ I }) => {
  I._waitForText('Short text shown in the form.', '[data-path="#/name"]')
  I.dontSee('Long description for the API documentation', '[data-path="#/name"]')
})

Scenario('@feature @x-summary should expand the description on click', ({ I }) => {
  I.click('[data-path="#/name"] details.jedi-summary > summary')
  I._waitForText('Long description for the API documentation', '[data-path="#/name"]')
})

Scenario('@feature @x-summary should show the description when there is no summary', ({ I }) => {
  I._waitForText('Without x-summary the description is shown as usual.', '[data-path="#/email"]')
})
