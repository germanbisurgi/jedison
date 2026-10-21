/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'editors/boolean-select'
const invalidValue = false
const defaultValue = true

Feature('boolean')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
});

Scenario('@editor @boolean-select should have @title and @description', ({ I }) => {
  I._waitForText('Boolean', '[data-path="#"] label')
  I._waitForText('The boolean type matches only two special values: true and false. Note that values that evaluate to true or false, such as 1 and 0, are not accepted by the schema.')
})

Scenario('@editor @boolean-select should have @infoButton', ({I}) => {
  I._waitForElement('.jedi-info-button')
  I._click('.jedi-info-button')
  I._waitForText('Info Button title')
  I._waitForText('Info button content')
  I._click('.jedi-modal-close')
  I.waitForInvisible('Info Button title')
  I.waitForInvisible('Info button content')
})

Scenario('@editor @boolean-select should have a @default value', ({I}) => {
  // instance
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(defaultValue))

  // editor
  I._waitForValue('[id="root"]', JSON.stringify(defaultValue))
})

Scenario('@editor @boolean-select should @setValue and @showValidationErrors', ({I}) => {
  // instance
  I.fillField('#editor-value', JSON.stringify(invalidValue))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(invalidValue))

  // editor
  I._waitForValue('[id="root"]', "false")
  I._waitForText('Must have value of: true.', '.jedi-error-message')
})

Scenario('@editor @boolean-select should @disable', ({I}) => {
  I._click('#disable-editor')
  I._waitForElement('#root:disabled')
})

Scenario('@editor @boolean-select should @enable', ({I}) => {
  I._click('#enable-editor')
  I.dontSeeElement('#root:disabled')
})

Scenario('@editor @boolean-select should @destroy', ({I}) => {
  I._click('#destroy-editor')
  I.dontSeeElement('[data-schemapath="root"]')
})
