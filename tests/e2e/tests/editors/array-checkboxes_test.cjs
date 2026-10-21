/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'editors/array-checkboxes'
const valueWithErrors = []
const valueDefault = ["value1"]

Feature('array-checkboxes')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
});

Scenario('@editor @array-checkboxes should have @title and @description', ({I}) => {
  I._waitForText('Array', 'legend .jedi-title')
  I._waitForText('Array of unique values wich item types can be string, number or integer', '.jedi-description')
})

Scenario('@editor @array-checkboxes should have @infoButton', ({I}) => {
  I._waitForElement('.jedi-info-button')
  I._click('.jedi-info-button')
  I._waitForText('Info Button title')
  I._waitForText('Info button content')
  I._click('.jedi-modal-close')
  I.waitForInvisible('Info Button title')
  I.waitForInvisible('Info button content')
})

Scenario('@editor @array-checkboxes should have a @default value', ({I}) => {
  // instance
  I._waitForValue('[id="jedi-hidden-input"]', valueDefault)

  // editor
  I.seeCheckboxIsChecked('[id="root-0"]')
  I.dontSeeCheckboxIsChecked('[id="root-1"]')
})

Scenario('@editor @array-checkboxes should @setValue and @showValidationErrors', ({I}) => {
  // instance
  I.fillField('#editor-value', JSON.stringify(valueWithErrors))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(valueWithErrors))

  // editor
  I.dontSeeCheckboxIsChecked('[id="root-0"]')
  I.dontSeeCheckboxIsChecked('[id="root-1"]')

  I._waitForText('Must have at least 1 items.', '.jedi-error-message')
})

Scenario('@editor @array-checkboxes should @disable', ({I}) => {
  I._click('#disable-editor')
  I._waitForElement('#root-0:disabled')
  I._waitForElement('#root-1:disabled')
})

Scenario('@editor @array-checkboxes should @enable', ({I}) => {
  I._click('#enable-editor')
  I.dontSeeElement('#root-0:disabled')
  I.dontSeeElement('#root-1:disabled')
})

Scenario('@editor @array-checkboxes should @destroy', ({I}) => {
  I._click('#destroy-editor')
  I.dontSeeElement('[data-schemapath="root"]')
})
