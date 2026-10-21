/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('patternProperties')

Scenario('@constraint @propertyNames should display validation errors', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/propertyNames')
  I._selectShowErrors('always')
  I.fillField('#editor-value', JSON.stringify({
    "001 invalid": "value"
  }))
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForText('Property name "001 invalid" fails validation', '[data-path="#"]')
  I.fillField('#editor-value', JSON.stringify({
      "_a_proper_token_001": "value"
    }
  ))
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I.dontSee('Property name "001 invalid" fails validation')
})
