/* global Feature Scenario */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'plugins/milkdown'
const valueWithErrors = 'a'
const titleDefault = 'Hello Milkdown'

Feature('Milkdown')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
  I._waitForElement('.milkdown .ProseMirror')
});

Scenario('@plugin @string-milkdown should have @title and @description', ({I}) => {
  I._waitForText('Milkdown', 'label.jedi-title')
  I._waitForText('Milkdown is a WYSIWYG markdown editor built on ProseMirror and Remark.', '.jedi-description')
})

Scenario('@plugin @string-milkdown should have @infoButton', ({I}) => {
  I._waitForElement('.jedi-info-button')
  I._click('.jedi-info-button')
  I._waitForText('Info Button title')
  I._waitForText('Info button content')
  I._click('.jedi-modal-close')
  I.waitForInvisible('Info Button title')
  I.waitForInvisible('Info button content')
})

Scenario('@plugin @string-milkdown should have a @default value', ({I}) => {
  // instance
  I._waitForValue('[id="jedi-hidden-input"]', '# Hello Milkdown')

  // editor
  I._waitForText(titleDefault, '.milkdown')
})

Scenario('@plugin @string-milkdown should @setValue and @showValidationErrors', ({I}) => {
  // instance
  I.fillField('#editor-value', JSON.stringify(valueWithErrors))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  // Milkdown's markdown serializer always terminates a block with a trailing
  // newline, so the round-tripped value is "a\n", not "a".
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(valueWithErrors + '\n'))

  // editor
  I._waitForText(valueWithErrors, '.milkdown')
  I._waitForText('Must be at least 3 characters long.', '.jedi-error-message')
})

Scenario('@plugin @string-milkdown should @disable', ({I}) => {
  I._click('#disable-editor')
  I._waitForElement('.milkdown .ProseMirror[contenteditable="false"]')
})

Scenario('@plugin @string-milkdown should @enable', ({I}) => {
  I._click('#enable-editor')
  I.dontSeeElement('.milkdown .ProseMirror[contenteditable="false"]')
})

Scenario('@plugin @string-milkdown should @destroy', ({I}) => {
  I._click('#destroy-editor')
  I.dontSeeElement('[data-path="#"]')
})
