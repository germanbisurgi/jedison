/* global Feature Scenario */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'plugins/ace'
const valueWithErrors = 'a'
const valueDefault = ''

Feature('Ace')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
});

Scenario('@plugin @string-ace should have @title and @description', ({I}) => {
  I._waitForText('Ace', 'label.jedi-title')
})

Scenario('@plugin @string-ace should have @infoButton', ({I}) => {
  I._waitForElement('.jedi-info-button')
  I._click('.jedi-info-button')
  I._waitForText('Info Button title')
  I._waitForText('Info button content')
  I._click('.jedi-modal-close')
  I.waitForInvisible('Info Button title')
  I.waitForInvisible('Info button content')
})

Scenario('@plugin @string-ace should have a @default value', ({I}) => {
  // instance
  I._waitForValue('[id="jedi-hidden-input"]', valueDefault)

  // editor - ace editor should be present and empty by default
  I._waitForElement('.ace_editor')
})

Scenario('@plugin @string-ace should @setValue and @showValidationErrors', ({I}) => {
  // instance
  I.fillField('#editor-value', JSON.stringify(valueWithErrors))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(valueWithErrors))

  // editor - check ace editor content
  I._waitForElement('.ace_editor')
  I._waitForText('Must be at least 3 characters long.', '.jedi-error-message')
})

Scenario('@plugin @string-ace should @disable', ({I}) => {
  I._click('#disable-editor')
  I._waitForElement('.ace-disabled')
})

Scenario('@plugin @string-ace should @enable', ({I}) => {
  I._click('#enable-editor')
  I.dontSeeElement('.ace-disabled')
})

Scenario('@plugin @string-ace should @destroy', ({I}) => {
  I._click('#destroy-editor')
  I.dontSeeElement('[data-schemapath="root"]')
})