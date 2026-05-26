/* global Feature Scenario BeforeSuite */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'plugins/filepond'

Feature('FilePond')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@plugin @string-filepond should have @title and @description', ({ I }) => {
  I._waitForText('FilePond', 'label.jedi-title')
  I._waitForText('FilePond is a flexible and fun JavaScript file upload library.', '.jedi-description')
})

Scenario('@plugin @string-filepond should render FilePond UI', ({ I }) => {
  I._waitForElement('.filepond--root')
})

Scenario('@plugin @string-filepond should @disable', ({ I }) => {
  I._click('#disable-editor')
  I._waitForElement('.filepond--root[data-disabled]')
})

Scenario('@plugin @string-filepond should @enable', ({ I }) => {
  I._click('#enable-editor')
  I.dontSeeElement('.filepond--root[data-disabled]')
})

Scenario('@plugin @string-filepond should @destroy', ({ I }) => {
  I._click('#destroy-editor')
  I.dontSeeElement('[data-schemapath="root"]')
})
