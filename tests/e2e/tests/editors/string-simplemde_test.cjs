/* global Feature Scenario BeforeSuite */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'plugins/simplemde'
const valueWithErrors = 'a'
const valueDefault = 'SimpleMDE default'

Feature('SimpleMDE')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
  I._waitForElement('.CodeMirror')
})

Scenario('@plugin @string-simplemde should have @title and @description', ({ I }) => {
  I._waitForText('SimpleMDE', 'label.jedi-title')
  I._waitForText('A simple, beautiful, and embeddable JavaScript Markdown editor. Delightful editing for beginners and experts alike. Features built-in autosaving and spell checking.', '.jedi-description')
})

Scenario('@plugin @string-simplemde should have @infoButton', ({ I }) => {
  I._waitForElement('.jedi-info-button')
  I._click('.jedi-info-button')
  I._waitForText('Info Button title')
  I._waitForText('Info button content')
  I._click('.jedi-modal-close')
  I.waitForInvisible('Info Button title')
  I.waitForInvisible('Info button content')
})

Scenario('@plugin @string-simplemde should have a @default value', ({ I }) => {
  // instance
  I._waitForValue('[id="jedi-hidden-input"]', valueDefault)

  // editor
  I._waitForText(valueDefault, '.CodeMirror-line')
})

Scenario('@plugin @string-simplemde should @setValue and @showValidationErrors', ({ I }) => {
  // instance
  I.fillField('#editor-value', JSON.stringify(valueWithErrors))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(valueWithErrors))

  // editor
  I._waitForText(valueWithErrors, '.CodeMirror-line')
  I._waitForText('Must be at least 3 characters long.', '.jedi-error-message')
})

Scenario('@plugin @string-simplemde should @disable', ({ I }) => {
  I._click('#disable-editor')
  I._waitForElement('.editor-preview-active')
})

Scenario('@plugin @string-simplemde should @enable', ({ I }) => {
  I._click('#enable-editor')
  I.dontSeeElement('.editor-preview-active')
})

Scenario('@plugin @string-simplemde should @destroy', ({ I }) => {
  I._click('#destroy-editor')
  I.dontSeeElement('[data-schemapath="root"]')
})
