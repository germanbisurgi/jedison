/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('validator')

Scenario('should display @messages-by-constraint validation error', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}&example=validator/messages-by-constraint&showErrors=always`)
  I._waitForElement('.jedi-ready')
  I._waitForText('Need at least 5 sparks of brilliance.', '[data-path="#/string"]')
  I._waitForText('Only \'locoloco\' unlocks the magic here.', '[data-path="#/string"]')
})
