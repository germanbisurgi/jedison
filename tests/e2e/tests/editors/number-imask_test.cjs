/* global Feature Scenario */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'plugins/number-imask'
const valueWithErrors = ''
const valueDefault = 0.5

Feature('IMask')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
})

Scenario('@plugin @number-imask should have @title and @description', ({ I }) => {
  I._waitForText('IMask', 'label.jedi-title')
  I._waitForText('IMask is vanilla javascript input mask.', '.jedi-description')
})

Scenario('@plugin @number-imask should have @infoButton', ({ I }) => {
  I._waitForElement('.jedi-info-button')
  I._click('.jedi-info-button')
  I._waitForText('Info Button title')
  I._waitForText('Info button content')
  I._click('.jedi-modal-close')
  I.waitForInvisible('Info Button title')
  I.waitForInvisible('Info button content')
})

Scenario('@plugin @number-imask should have a @default value', ({ I }) => {
  // instance
  I._waitForValue('[id="jedi-hidden-input"]', valueDefault)

  // editor
  I.seeInField('#root', '0,50')
})

Scenario('@plugin @number-imask should @setValue and @showValidationErrors', ({ I }) => {
  // No decimals
  I._setEditorValue(JSON.stringify(1234)) // instance
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(1234))
  I.seeInField('#root', '1.234,00') // editor

  // Decimals
  I._setEditorValue(JSON.stringify(1234.56)) // instance
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(1234.56))
  I.seeInField('#root', '1.234,56') // editor

  // Multiple thousand separators
  I._setEditorValue(JSON.stringify(1234567.89)) // instance
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(1234567.89))
  I.seeInField('#root', '1.234.567,89') // editor

  // zero
  I._setEditorValue(JSON.stringify(0)) // instance
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(0))
  I.seeInField('#root', '0,00') // editor
})

Scenario('@plugin @number-imask should @disable', ({ I }) => {
  I._click('#disable-editor')
  I._waitForElement('#root:disabled')
})

Scenario('@plugin @number-imask should @enable', ({ I }) => {
  I._click('#enable-editor')
  I.dontSeeElement('#root:disabled')
})

Scenario('@plugin @number-imask should @destroy', ({ I }) => {
  I._click('#destroy-editor')
  I.dontSeeElement('[data-schemapath="root"]')
})
