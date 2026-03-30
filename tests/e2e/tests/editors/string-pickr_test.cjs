/* global Feature Scenario BeforeSuite */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'plugins/pickr'
const valueDefault = '#1a73e8ff'
const valueWithErrors = 'a'

Feature('Pickr')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@plugin @string-pickr should have @title and @description', ({ I }) => {
  I._waitForText('Pickr', 'label.jedi-title')
  I._waitForText('Pickr is a flat, simple, hackable color-picker.', '.jedi-description')
})

Scenario('@plugin @string-pickr should have a @default value', ({ I }) => {
  I._waitForElement('.pickr')
})

Scenario('@plugin @string-pickr should @disable', ({ I }) => {
  I._click('#disable-editor')
  I._waitForElement('.pcr-button.disabled')
})

Scenario('@plugin @string-pickr should @enable', ({ I }) => {
  I._click('#enable-editor')
  I.dontSeeElement('.pcr-button.disabled')
})

Scenario('@plugin @string-pickr should @setValue', ({ I }) => {
  const value = '#ff0000ff'
  I.fillField('#editor-value', JSON.stringify(value))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForElement('.pickr')
})

Scenario('@plugin @string-pickr should @destroy', ({ I }) => {
  I._click('#destroy-editor')
  I.dontSeeElement('[data-schemapath="root"]')
})
