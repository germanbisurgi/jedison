/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'editors/number-input-nullable'
const invalidValue = -1
const defaultValue = null
const defaultValueUI = ''
const emptyValueUI = ''
const emptyValue = null

Feature('number nullable')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
})

Scenario('@editor @number-input-nullable should have @title and @description', ({ I }) => {
  I._waitForText('Nullable input number', '[data-path="#"] label')
  I._waitForText('Value is null, When the input is considered empty.')
})

Scenario('@editor @number-input-nullable should have @infoButton', ({I}) => {
  I._waitForElement('.jedi-info-button')
  I._click('.jedi-info-button')
  I._waitForText('Info Button title')
  I._waitForText('Info button content')
  I._click('.jedi-modal-close')
  I.waitForInvisible('Info Button title')
  I.waitForInvisible('Info button content')
})

Scenario('@editor @number-input-nullable should have a @default value', ({I}) => {
  // instance
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(defaultValue))

  // editor
  I._waitForValue('[id="root"]', defaultValueUI)
})

Scenario('@editor @number-input-nullable should @setValue and @showValidationErrors', ({I}) => {
  // instance
  I.fillField('#editor-value', JSON.stringify(invalidValue))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(invalidValue))

  // editor
  I._waitForValue('[id="root"]', JSON.stringify(invalidValue))
  I._waitForText('Must be at least 0.', '.jedi-error-message')
})

Scenario('@editor @number-input-nullable should have value null when empty', ({I}) => {
  // instance
  I.fillField('#editor-value', JSON.stringify(emptyValue))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(emptyValue))

  // editor
  I._waitForValue('[id="root"]', emptyValueUI)
})

Scenario('@editor @number-input-nullable should @disable', ({I}) => {
  I._click('#disable-editor')
  I._waitForElement('#root:disabled')
})

Scenario('@editor @number-input-nullable should @enable', ({I}) => {
  I._click('#enable-editor')
  I.dontSeeElement('#root:disabled')
})

Scenario('@editor @number-input-nullable should @destroy', ({I}) => {
  I._click('#destroy-editor')
  I.dontSeeElement('[data-schemapath="root"]')
})
