/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('object')

Scenario('@editor @object @enforceAdditionalProperties should remove all properties that are not listed in `properties` or `patternProperties`', async ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', 'editors/object-enforceAdditionalProperties')
  I._waitForElement('.jedi-ready')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "a": 0,
    "b": 0
  }))

  I.fillField('#editor-value', JSON.stringify({
    "a": 0,
    "b": 0,
    "c": 0
  }))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "a": 0,
    "b": 0
  }))

  I.fillField('#editor-value', JSON.stringify({
    "a": 0,
    "b": 0,
    "id_": "test"
  }))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "a": 0,
    "b": 0,
    "id_": "test"
  }))
})

Scenario('@editor @object @enforceAdditionalProperties `Add property` should only accept a name matching `properties` or `patternProperties`', async ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', 'editors/object-enforceAdditionalProperties')
  I._waitForElement('.jedi-ready')

  I._click('.jedi-quick-add-property-toggle')
  I.fillField('#jedi-quick-add-property-input-root', 'id_test')
  I._click('.jedi-add-property-btn')
  I._waitForElement('[data-path="#/id_test"]')

  I._click('.jedi-quick-add-property-toggle')
  I.fillField('#jedi-quick-add-property-input-root', 'c')
  I._click('.jedi-add-property-btn')
  I._waitForElement('#jedi-quick-add-property-input-root-messages .jedi-error-message')
  I.dontSeeElement('[data-path="#/c"]')
})