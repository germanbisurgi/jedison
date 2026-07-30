/* global Feature Scenario BeforeSuite */

const theme = process.env.THEME || 'bootstrap5'

Feature('nav rebuild race')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
})

// Plain nav: editing a field then immediately clicking another tab must switch.
Scenario('@nav-race plain nav edit-then-click switches tab @nav-race', ({ I }) => {
  I.selectOption('#examples', 'editors/object-nav-horizontal')
  I._waitForElement('.jedi-ready')
  I._click('a[href$="root-strings"]')
  I.wait(1)
  I.fillField('[data-path="#/strings/string"] input', 'hello')
  I._click('a[href$="root-numbers"]')
  I.wait(1)
  I.seeElement('[data-path="#/numbers"].active')
})

// if/then nav (issue #65): edit a field then click a tab must switch.
Scenario('@nav-race if/then nav edit-then-click switches tab @nav-race', ({ I }) => {
  I.selectOption('#examples', 'issue/issue-65')
  I._waitForElement('.jedi-ready')
  I._checkOption('[data-path="#/service/bgpenabled"] input')
  I._click('a[href$="root-interface"]')
  I._checkOption('[data-path="#/interface/ipv6enabled"] input')
  I._waitForElement('[data-path="#/interface"].active')
  I.fillField('[data-path="#/interface/test"] input', 'hello')
  I._click('a[href$="root-service"]')
  I.wait(1)
  I.seeElement('[data-path="#/service"].active')
  I.dontSeeElement('[data-path="#/interface"].active')
})
