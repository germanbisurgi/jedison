/* global Feature Scenario */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'plugins/imask'
const valueWithErrors = ""
const valueDefault = "DE11111111111111111111"

Feature('IMask')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
});

Scenario('@plugin @string-imask should have @title and @description', ({I}) => {
  I._waitForText('IMask', 'label.jedi-title')
  I._waitForText('IMask is vanilla javascript input mask.', '.jedi-description')
})

Scenario('@plugin @string-imask should have @infoButton', ({I}) => {
  I._waitForElement('.jedi-info-button')
  I._click('.jedi-info-button')
  I._waitForText('Info Button title')
  I._waitForText('Info button content')
  I._click('.jedi-modal-close')
  I.waitForInvisible('Info Button title')
  I.waitForInvisible('Info button content')
})

Scenario('@plugin @string-imask should have a @default value', ({I}) => {
  // instance
  I._waitForValue('[id="jedi-hidden-input"]', valueDefault)

  // editor
  I.seeInField('#root', 'DE11 1111 1111 1111 1111 11')
})

Scenario('@plugin @string-imask should @setValue and @showValidationErrors', ({I}) => {
  // instance
  I.fillField('#editor-value', JSON.stringify(valueWithErrors))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(valueWithErrors))

  // editor
  I.seeInField('#root', '____ ____ ____ ____ ____ __')
  I._waitForText('Must be at least 22 characters long.', '.jedi-error-message')
})

Scenario('@plugin @string-imask should @disable', ({I}) => {
  I._click('#disable-editor')
  I._waitForElement('#root:disabled')
})

Scenario('@plugin @string-imask should @enable', ({I}) => {
  I._click('#enable-editor')
  I.dontSeeElement('#root:disabled')
})

Scenario('@plugin @string-imask should @destroy', ({I}) => {
  I._click('#destroy-editor')
  I.dontSeeElement('[data-schemapath="root"]')
})