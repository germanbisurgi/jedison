/* global Feature Scenario */
// file generated with AI assistance: Claude Code - 2026-07-01
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'editors/object-radios'
const defaultValue = { q1: { source: 'social_media', score: 4 }, q2: { rating: 'very_satisfied', score: 4 }, q3: { nps: 'promoter', score: 3 } }
const setValue = { q1: { source: 'referral', score: 5 }, q2: { rating: 'very_satisfied', score: 4 }, q3: { nps: 'promoter', score: 3 } }
const invalidValue = { q1: { source: 'unknown', score: 0 }, q2: { rating: 'very_satisfied', score: 4 }, q3: { nps: 'promoter', score: 3 } }

Feature('object-radios')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@editor @object-radios should have @title and @description', ({ I }) => {
  I._waitForText('Quick Survey', 'legend')
  I._waitForText('Object radios allow selecting object enum values via radio buttons.')
})

Scenario('@editor @object-radios should have @infoButton', ({ I }) => {
  I._waitForElement('.jedi-info-button')
  I._click('.jedi-info-button')
  I._waitForText('Info Button title')
  I._waitForText('Info button content')
  I._click('.jedi-modal-close')
  I.waitForInvisible('Info Button title')
  I.waitForInvisible('Info button content')
})

Scenario('@editor @object-radios should have a @default value', ({ I }) => {
  // instance
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(defaultValue))

  // editor
  I.seeCheckboxIsChecked('[id="root-q1-0"]')
  I.seeCheckboxIsChecked('[id="root-q2-0"]')
  I.seeCheckboxIsChecked('[id="root-q3-0"]')
})

Scenario('@editor @object-radios should @setValue and @showValidationErrors', ({ I }) => {
  // instance
  I.fillField('#editor-value', JSON.stringify(setValue))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(setValue))

  // editor: q1 second option selected
  I.dontSeeCheckboxIsChecked('[id="root-q1-0"]')
  I.seeCheckboxIsChecked('[id="root-q1-1"]')

  // set invalid q1 value (not in enum)
  I.fillField('#editor-value', JSON.stringify(invalidValue))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')

  // editor: no q1 radio should be checked
  I.dontSeeCheckboxIsChecked('[id="root-q1-0"]')
  I.dontSeeCheckboxIsChecked('[id="root-q1-1"]')
  I.dontSeeCheckboxIsChecked('[id="root-q1-2"]')
  I.dontSeeCheckboxIsChecked('[id="root-q1-3"]')
  I._waitForText('Must be one of the enumerated values', '.jedi-error-message')
})

Scenario('@editor @object-radios should @disable', ({ I }) => {
  I._click('#disable-editor')
  I._waitForElement('#root-q1-0:disabled')
  I._waitForElement('#root-q1-1:disabled')
  I._waitForElement('#root-q1-2:disabled')
  I._waitForElement('#root-q1-3:disabled')
})

Scenario('@editor @object-radios should @enable', ({ I }) => {
  I._click('#enable-editor')
  I.dontSeeElement('#root-q1-0:disabled')
  I.dontSeeElement('#root-q1-1:disabled')
  I.dontSeeElement('#root-q1-2:disabled')
  I.dontSeeElement('#root-q1-3:disabled')
})

Scenario('@editor @object-radios should @destroy', ({ I }) => {
  I._click('#destroy-editor')
  I.dontSeeElement('[data-schemapath="root"]')
})
