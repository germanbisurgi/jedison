/* global Feature Scenario BeforeSuite */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-78'

Feature('issue-78 x-defaultProperties acts as a whitelist for optional properties')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

// "name" is required but absent from x-defaultProperties - required must win regardless.
Scenario('@issue @issue-78 required property is shown even though it is not listed in x-defaultProperties', ({ I }) => {
  I._waitForElement('[data-path="#/name"]')
})

Scenario('@issue @issue-78 property listed in x-defaultProperties is shown without opting in', ({ I }) => {
  I._waitForElement('[data-path="#/nickname"]')
})

Scenario('@issue @issue-78 property not listed in x-defaultProperties stays hidden until opted in', ({ I }) => {
  I.dontSeeElement('[data-path="#/bio"]')
  I._click('.jedi-properties-toggle')
  I._waitForElement('[id="root-bio-activator"]:not(:disabled)')
  I._click('[id="root-bio-activator"]')
  I._waitForElement('[data-path="#/bio"]')
})
