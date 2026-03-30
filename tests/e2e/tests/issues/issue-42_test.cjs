/* global Feature Scenario BeforeSuite */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-42'

Feature('issue-42 x-info scoped per-column in table-object arrays')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @issue-42 each column info button should open its own modal content', ({ I }) => {
  I._waitForElement('.jedi-info-button')

  // Field A — first column info button
  I.click('th:nth-child(2) .jedi-info-button')
  I._waitForText('Info A')
  I._waitForText('Info content for Field A')
  I._waitForVisible('#root-field-a-modal .jedi-modal-close')
  I._click('#root-field-a-modal .jedi-modal-close')
  I._waitForInvisible('#root-field-a-modal .jedi-modal-close')

  // Field B — second column info button
  I.click('th:nth-child(3) .jedi-info-button')
  I._waitForText('Info B')
  I._waitForText('Info content for Field B')
  I._waitForVisible('#root-field-b-modal .jedi-modal-close')
  I._click('#root-field-b-modal .jedi-modal-close')
  I._waitForInvisible('#root-field-b-modal .jedi-modal-close')

  // Field C — third column info button
  I.click('th:nth-child(4) .jedi-info-button')
  I._waitForText('Info C')
  I._waitForText('Info content for Field C')
  I._waitForVisible('#root-field-c-modal .jedi-modal-close')
  I._click('#root-field-c-modal .jedi-modal-close')
  I._waitForInvisible('#root-field-c-modal .jedi-modal-close')
})
