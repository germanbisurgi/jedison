/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('object')

Scenario('@editor @object @enforceRequired should always shor required properties in editor', async ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample('editors/object-enforceRequired')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "a": 1,
    "b": 0
  }))

  I.fillField('#editor-value', JSON.stringify({
    "a": 1
  }))

  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "a": 1,
    "b": 0
  }))
})