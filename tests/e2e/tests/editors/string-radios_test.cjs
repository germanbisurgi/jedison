/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'editors/string-radios'
const invalidValue = 'false'
const defaultValue = 'betti'

Feature('boolean')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
});

Scenario('@editor @string-radios should have @title and @description', ({ I }) => {
  I._waitForText('String radios', 'legend')
  I._waitForText('The string type is used for strings of text. It may contain Unicode characters.')
})

Scenario('@plugin @string-radios should have @infoButton', ({I}) => {
  I._waitForElement('.jedi-info-button')
  I._click('.jedi-info-button')
  I._waitForText('Info Button title')
  I._waitForText('Info button content')
  I._click('.jedi-modal-close')
  I.waitForInvisible('Info Button title')
  I.waitForInvisible('Info button content')
})

Scenario('@editor @string-radios should have a @default value', ({I}) => {
  // instance
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(defaultValue))

  // editor
  I.seeCheckboxIsChecked('[id="root-1"]')
})

Scenario('@editor @string-radios should @setValue and @showValidationErrors', ({I}) => {
  // instance
  I.fillField('#editor-value', JSON.stringify(invalidValue))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(invalidValue))

  // editor
  I.dontSeeCheckboxIsChecked('[id="root-0"]')
  I.dontSeeCheckboxIsChecked('[id="root-1"]')
  I.dontSeeCheckboxIsChecked('[id="root-2"]')
  I._waitForText('Must be one of the enumerated values: ["albert","betti","carl"].', '.jedi-error-message')
})

Scenario('@editor @string-radios should @disable', ({I}) => {
  I._click('#disable-editor')
  I._waitForElement('#root-0:disabled')
  I._waitForElement('#root-1:disabled')
})

Scenario('@editor @string-radios should @enable', ({I}) => {
  I._click('#enable-editor')
  I.dontSeeElement('#root-0:disabled')
  I.dontSeeElement('#root-1:disabled')
})

Scenario('@editor @string-radios should @destroy', ({I}) => {
  I._click('#destroy-editor')
  I.dontSeeElement('[data-schemapath="root"]')
})