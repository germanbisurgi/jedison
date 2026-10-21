/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('type')

Scenario('@constraint @type should display validation errors', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/type')
  I._scrollTo('[data-path="#"]')
  I.fillField('#editor-value', JSON.stringify({
    string: 1,
    number: 'test',
    integer: 'test',
    boolean: 'test',
    null: 'test',
    array: 'test',
    object: 'test'
  }))
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForText('Must be of type string', '[data-path="#/string"]')
  I._waitForText('Must be of type number', '[data-path="#/number"]')
  I._waitForText('Must be of type integer', '[data-path="#/integer"]')
  I._waitForText('Must be of type boolean', '[data-path="#/boolean"]')
  I._waitForText('Must be of type null', '[data-path="#/null"]')
  I._waitForText('Must be of type array', '[data-path="#/array"]')
  I._waitForText('Must be of type object', '[data-path="#/object"]')
})
