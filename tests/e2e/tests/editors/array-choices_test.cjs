/* global Feature Scenario */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'plugins/choices'
const valueWithErrors = []
const valueDefault = [
  "US"
]

Feature('Choices')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
});

Scenario('@plugin @array-choices should have @title and @description', ({I}) => {
  I._waitForText('Choices', 'label.jedi-title')
  I._waitForText('A vanilla JS customisable select box/text input plugin.', '.jedi-description')
})

Scenario('@plugin @array-choices should have @infoButton', ({I}) => {
  I._waitForElement('.jedi-info-button')
  I._click('.jedi-info-button')
  I._waitForText('Info Button title')
  I._waitForText('Info button content')
  I._click('.jedi-modal-close')
  I.waitForInvisible('Info Button title')
  I.waitForInvisible('Info button content')
})

Scenario('@plugin @array-choices should have a @default value', ({I}) => {
  // instance
  I._waitForValue('[id="jedi-hidden-input"]', valueDefault)

  // editor
  I._waitForText(valueDefault, '.choices__item')
})

Scenario('@plugin @array-choices should @setValue and @showValidationErrors', ({I}) => {
  // instance
  I.fillField('#editor-value', JSON.stringify(valueWithErrors))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(valueWithErrors))

  // editor
  I._waitForText(valueWithErrors, '.choices__item')
  I._waitForText('Must have at least 1 items', '.jedi-error-message')
})

Scenario('@plugin @array-choices should @disable', ({I}) => {
  I._click('#disable-editor')
  I._waitForElement('.choices.is-disabled')
})

Scenario('@plugin @array-choices should @enable', ({I}) => {
  I._click('#enable-editor')
  I.dontSeeElement('.choices.is-disabled')
})

Scenario('@plugin @array-choices should @destroy', ({I}) => {
  I._click('#destroy-editor')
  I.dontSeeElement('[data-schemapath="root"]')
})