/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'editors/array-table-no-buttons'

Feature('array-table-no-buttons')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
})

Scenario('@editor @array-table-no-buttons should not render an empty buttons column', ({ I }) => {
  I.seeNumberOfElements('[data-path="#"] table thead th', 1)
  I.seeNumberOfElements('[data-path="#"] table tbody tr:first-child td', 1)
})
