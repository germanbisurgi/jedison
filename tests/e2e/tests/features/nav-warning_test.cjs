/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'features/nav-warning'

Feature('nav-warning')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('Should show nav warning with title attribute @nav-warning', ({ I }) => {
  I._fillField('#root-0-name', 'a')
  I._waitForElement('.jedi-nav-warning[title="has errors"]')
})
