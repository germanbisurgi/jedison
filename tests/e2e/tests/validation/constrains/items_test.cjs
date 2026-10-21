/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('items')

Scenario('@constraint @items should edit items', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/items')
  I.dontSee('[id="root-0"]')
  I._click('.jedi-array-add')
  I._waitForElement('[id="root-0"]')
  I._waitForElement('.jedi-array-delete')
  I._click('.jedi-array-delete')
  I.dontSee('[id="root-0"]')
})
