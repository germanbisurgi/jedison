/* global Feature Scenario */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'plugins/tom-select'
const valueWithErrors = []
const valueDefault = [
  "US"
]

Feature('Tom Select')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
});

Scenario('@plugin @array-tom-select should have @title and @description', ({I}) => {
  I._waitForText('Tom Select', 'label.jedi-title')
  I._waitForText('A vanilla JS select box/text input plugin with drag-and-drop reordering of selected items.', '.jedi-description')
})

Scenario('@plugin @array-tom-select should have @infoButton', ({I}) => {
  I._waitForElement('.jedi-info-button')
  I._click('.jedi-info-button')
  I._waitForText('Info Button title')
  I._waitForText('Info button content')
  I._click('.jedi-modal-close')
  I.waitForInvisible('Info Button title')
  I.waitForInvisible('Info button content')
})

Scenario('@plugin @array-tom-select should have a @default value', ({I}) => {
  // instance
  I._waitForValue('[id="jedi-hidden-input"]', valueDefault)

  // editor
  I._waitForText(valueDefault, '.ts-wrapper .item')
})

Scenario('@plugin @array-tom-select should @setValue and @showValidationErrors', ({I}) => {
  I.fillField('#editor-value', JSON.stringify(valueWithErrors))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(valueWithErrors))

  // editor
  I.dontSeeElement('.ts-wrapper .item')
  I._waitForText('Must have at least 1 items', '.jedi-error-message')
})

Scenario('@plugin @array-tom-select should @disable', ({I}) => {
  I._click('#disable-editor')
  I._waitForElement('.ts-wrapper.disabled')
})

Scenario('@plugin @array-tom-select should @enable', ({I}) => {
  I._click('#enable-editor')
  I.dontSeeElement('.ts-wrapper.disabled')
})

Scenario('@plugin @array-tom-select should @destroy', ({I}) => {
  I._click('#destroy-editor')
  I.dontSeeElement('[data-schemapath="root"]')
})
