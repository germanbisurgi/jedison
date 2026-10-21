/* global Feature Scenario */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'plugins/raty'
const value = 5
const valueWithErrors = 0
const valueDefault = 3

Feature('Raty')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
});

Scenario('@plugin @number-raty should have @title and @description', ({I}) => {
  I._waitForText('Raty', 'label.jedi-title')
  I._waitForText('Raty - A Star Rating Plugin', '.jedi-description')
})

Scenario('@plugin @string-raty should have @infoButton', ({I}) => {
  I._waitForElement('.jedi-info-button')
  I._click('.jedi-info-button')
  I._waitForText('Info Button title')
  I._waitForText('Info button content')
  I._click('.jedi-modal-close')
  I.waitForInvisible('Info Button title')
  I.waitForInvisible('Info button content')
})

Scenario('@plugin @number-raty should have a @default value', ({I}) => {
  I._waitForValue('[id="jedi-hidden-input"]', valueDefault)
})

Scenario('@plugin @number-raty should @disable', ({I}) => {
  I._click('#disable-editor')
  I.wait(1)
  I._waitForElement('[data-read-only="true"]')
})

Scenario('@plugin @number-raty should @enable', ({I}) => {
  I._click('#enable-editor')
  I.dontSee('[data-read-only="false"]')
})

Scenario('@plugin @number-raty should @setValue', ({I}) => {
  I.fillField('#editor-value', JSON.stringify(value))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(value))
})

Scenario('@plugin @number-raty should @showValidationErrors', ({I}) => {
  I.fillField('#editor-value', JSON.stringify(valueWithErrors))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForElement('.jedi-error-message')
})

Scenario('@plugin @number-raty should @destroy', ({I}) => {
  I._click('#destroy-editor')
  I.dontSeeElement('[data-schemapath="root"]')
})
