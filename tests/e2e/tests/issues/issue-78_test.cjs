/* global Feature Scenario BeforeSuite */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-78'

Feature('issue-78 x-defaultProperties acts as a whitelist for optional properties')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

// firstName/lastName are required but absent from x-defaultProperties - required must win regardless.
Scenario('@issue @issue-78 required properties are shown even though they are not listed in x-defaultProperties', ({ I }) => {
  I._waitForElement('[data-path="#/firstName"]')
  I._waitForElement('[data-path="#/lastName"]')
})

Scenario('@issue @issue-78 properties listed in x-defaultProperties are shown without opting in', ({ I }) => {
  I._waitForElement('[data-path="#/email"]')
  I._waitForElement('[data-path="#/phone"]')
})

Scenario('@issue @issue-78 properties not listed in x-defaultProperties stay hidden until opted in', ({ I }) => {
  I.dontSeeElement('[data-path="#/company"]')
  I.dontSeeElement('[data-path="#/notes"]')

  I._click('.jedi-properties-toggle')
  I._waitForElement('[id="root-company-activator"]:not(:disabled)')
  I._click('[id="root-company-activator"]')
  I._waitForElement('[data-path="#/company"]')

  // notes is still untouched - opting one property in must not opt others in too
  I.dontSeeElement('[data-path="#/notes"]')

  I._waitForElement('[id="root-notes-activator"]:not(:disabled)')
  I._click('[id="root-notes-activator"]')
  I._waitForElement('[data-path="#/notes"]')
})
