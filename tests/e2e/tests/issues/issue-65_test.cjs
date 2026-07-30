/* global Feature Scenario BeforeSuite */

// bootstrap5 is pinned so the active tab pane carries a deterministic `.active`
// class (the barebones theme has no active-class signal to assert on).
const theme = 'bootstrap5'
const pathToSchema = 'issue/issue-65'

Feature('issue-65 nav tab focus must survive an if/then branch swap')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @issue-65 toggling a field in one tab keeps that tab active instead of jumping to the first', ({ I }) => {
  // Service Attributes (first tab) is active on load.
  I._waitForElement('[data-path="#/service"].active')

  // Enable BGP? on the Service Attributes tab — drives an if-condition and
  // rebuilds the nav (adds a BGP tab). The active tab must not change yet.
  I._checkOption('[data-path="#/service/bgpenabled"] input')
  I._waitForElement('[data-path="#/service"].active')

  // Switch to the Interface tab.
  I._click('a[href$="root-interface"]')
  I._waitForVisible('[data-path="#/interface/ipv6enabled"] input')

  // Enable IPv6 — this flips the active if/then branch, swapping in a sibling
  // nav instance. Before the fix its activeTabIndex started at 0, so focus
  // jumped back to Service Attributes.
  I._checkOption('[data-path="#/interface/ipv6enabled"] input')

  // The Interface tab must stay active after the branch swap.
  I._waitForElement('[data-path="#/interface"].active')
  I.dontSeeElement('[data-path="#/service"].active')
})
