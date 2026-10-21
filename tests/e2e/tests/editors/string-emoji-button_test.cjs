/* global Feature Scenario */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'plugins/emoji-button'
const valueWithErrors = ''
const valueDefault = '😀'

Feature('Emoji button')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
});

Scenario('@plugin @string-emoji-button should have @title and @description', ({I}) => {
  I._waitForText('EmojiButton', 'label.jedi-title')
  I._waitForText('JavaScript emoji picker. Any app, any framework.', '.jedi-description')
})

Scenario('@plugin @string-emoji-button should have @infoButton', ({I}) => {
  I._waitForElement('.jedi-info-button')
  I._click('.jedi-info-button')
  I._waitForText('Info Button title')
  I._waitForText('Info button content')
  I._click('.jedi-modal-close')
  I.waitForInvisible('Info Button title')
  I.waitForInvisible('Info button content')
})

Scenario('@plugin @string-emoji-button should have a @default value', ({I}) => {
  // instance
  I._waitForValue('[id="jedi-hidden-input"]', valueDefault)

  // editor
  I.seeInField('#root', valueDefault)
})

Scenario('@plugin @string-emoji-button should @setValue and @showValidationErrors', ({I}) => {
  // instance
  I.fillField('#editor-value', JSON.stringify(valueWithErrors))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(valueWithErrors))

  // editor
  I._waitForText(valueWithErrors, '.jedi-emoji-button')
  I._waitForText('Must be at least 1 characters long.', '.jedi-error-message')
})

Scenario('@plugin @string-emoji-button should @disable', ({I}) => {
  I._click('#disable-editor')
  I._waitForElement('.jedi-emoji-button:disabled')
})

Scenario('@plugin @string-emoji-button should @enable', ({I}) => {
  I._click('#enable-editor')
  I.dontSeeElement('.jedi-emoji-button:disabled')
})

Scenario('@plugin @string-emoji-button should @destroy', ({I}) => {
  I._click('#destroy-editor')
  I.dontSeeElement('[data-schemapath="root"]')
})