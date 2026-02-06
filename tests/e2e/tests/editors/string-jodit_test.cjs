/* global Feature Scenario */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'plugins/jodit'
const valueDefault = '<p>Jodit default</p>'
const valueWithErrors = '<p>xz</p>'

Feature('Jodit')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
  I._waitForElement('.jodit-container')
});

Scenario('@plugin @string-jodit should have @title and @description', ({I}) => {
  I._waitForText('Jodit', 'label.jedi-title')
  I._waitForText('Jodit - Best WYSIWYG Editor for You.', '.jedi-description')
})

Scenario('@plugin @string-jodit should have @infoButton', ({I}) => {
  I._waitForElement('.jedi-info-button')
  I._click('.jedi-info-button')
  I._waitForText('Info Button title')
  I._waitForText('Info button content')
  I._click('.jedi-modal-close')
  I.waitForInvisible('Info Button title')
  I.waitForInvisible('Info button content')
})

Scenario('@plugin @string-jodit should have a @default value', ({I}) => {
  // instance
  I._waitForValue('[id="jedi-hidden-input"]', valueDefault)

  // editor
  I._waitForText('default', '.jodit-wysiwyg')
})

Scenario('@plugin @string-jodit should @setValue and @showValidationErrors', ({I}) => {
  // instance
  I.fillField('#editor-value', JSON.stringify(valueWithErrors))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(valueWithErrors))

  // editor
  I._waitForText('xz', '.jodit-wysiwyg')
  I._waitForText('Must be at least 20 characters long.', '.jedi-error-message')
})

Scenario('@plugin @string-jodit should @disable', ({I}) => {
  I._click('#disable-editor')
  I.dontSeeElement('.jodit-wysiwyg[contenteditable="true"]')
})

Scenario('@plugin @string-jodit should @enable', ({I}) => {
  I._click('#enable-editor')
  I._waitForElement('.jodit-wysiwyg[contenteditable="true"]')
})

Scenario('@plugin @string-jodit should @destroy', ({I}) => {
  I._click('#destroy-editor')
  I.dontSeeElement('[data-schemapath="root"]')
})
