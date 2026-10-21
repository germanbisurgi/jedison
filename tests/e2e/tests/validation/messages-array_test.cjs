/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('validator')

Scenario('should display @messages-array validation error', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}&example=validator/messages-array&showErrors=always`)
  I._waitForElement('.jedi-ready')
  I._waitForText('5 chars please.', '[data-path="#/string"]')
})
