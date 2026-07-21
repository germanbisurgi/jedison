/* global Feature Scenario BeforeSuite */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-64'

Feature('issue-64 x-info not duplicated per row in table-object arrays')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @issue-64 info button appears once per column header, never inside rows', ({ I }) => {
  I._waitForElement('.jedi-info-button')

  // One info button per column, rendered in the table header only
  I.seeNumberOfElements('thead .jedi-info-button', 2)
  I.dontSeeElement('tbody .jedi-info-button')

  // Header buttons still open their own per-column modal (regression guard for #42)
  I.click('thead th:nth-child(2) .jedi-info-button')
  I._waitForText('Info A')
  I._waitForText('Info content for Field A')
  I._waitForVisible('#root-field-a-modal .jedi-modal-close')
  I._click('#root-field-a-modal .jedi-modal-close')
  I._waitForInvisible('#root-field-a-modal .jedi-modal-close')

  I.click('thead th:nth-child(3) .jedi-info-button')
  I._waitForText('Info B')
  I._waitForText('Info content for Field B')
  I._waitForVisible('#root-field-b-modal .jedi-modal-close')
  I._click('#root-field-b-modal .jedi-modal-close')
  I._waitForInvisible('#root-field-b-modal .jedi-modal-close')
})
