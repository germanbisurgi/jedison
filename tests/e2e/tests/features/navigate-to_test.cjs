/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'features/navigate-to'

Feature('navigate-to')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('navigateTo activates correct ancestor tabs for a deeply nested path @navigate-to', ({ I }) => {
  I.executeScript(() => {
    window.editor.navigateTo('#/organization/departments/1/teams/1')
  })

  I._waitForElement('.jedi-ready')
  I._waitForVisible('[data-path="#/organization/departments/1/teams/1/lead"]')
})
