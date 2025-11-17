/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'features/templates'

Feature('templates')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('Should parse title @templates', ({ I }) => {
  // Test main company title with default data
  I._waitForText('Company 1 - Tech Corp', '[data-path="#/0"] .jedi-title')
  I._waitForText('Company 1 has name: Tech Corp', '[data-path="#/0"] .jedi-description')
})

Scenario('Should parse parent templates @templates', ({ I }) => {
  // Test existing departments with parent template
  I._waitForText('Tech Corp - Engineering', '[data-path="#/0/departments"] .jedi-nav-text')
  I._waitForText('Tech Corp - Engineering', '[data-path="#/0/departments/0"] .jedi-title')
})
