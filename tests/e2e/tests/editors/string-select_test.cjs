/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'editors/string-select'
const invalidValue = ''
const defaultValue = 'betti'

Feature('boolean')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
});

Scenario('@editor @string-select should have @title and @description', ({ I }) => {
  I._waitForText('String select', '[data-path="#"] label')
  I._waitForText('The string type is used for strings of text. It may contain Unicode characters.')
})

Scenario('@editor @string-select should have @infoButton', ({I}) => {
  I._waitForElement('.jedi-info-button')
  I._click('.jedi-info-button')
  I._waitForText('Info Button title')
  I._waitForText('Info button content')
  I._click('.jedi-modal-close')
  I.waitForInvisible('Info Button title')
  I.waitForInvisible('Info button content')
})

Scenario('@editor @string-select should have a @default value', ({I}) => {
  // instance
  I._waitForValue('[id="jedi-hidden-input"]', defaultValue)

  // editor
  I._waitForValue('[id="root"]', defaultValue)
})

Scenario('@editor @string-select should @setValue and @showValidationErrors', ({I}) => {
  // instance
  I.fillField('#editor-value', JSON.stringify(invalidValue))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', invalidValue)

  // editor
  I._waitForValue('[id="root"]', "")
  I._waitForText('Must be one of the enumerated values: ["albert","betti","carl"].')
})

Scenario('@editor @string-select should @disable', ({I}) => {
  I._click('#disable-editor')
  I._waitForElement('#root:disabled')
})

Scenario('@editor @string-select should @enable', ({I}) => {
  I._click('#enable-editor')
  I.dontSeeElement('#root:disabled')
})

Scenario('@editor @string-select should @destroy', ({I}) => {
  I._click('#destroy-editor')
  I.dontSeeElement('[data-schemapath="root"]')
})
