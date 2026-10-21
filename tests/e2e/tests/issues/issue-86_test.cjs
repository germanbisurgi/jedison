/* global Feature Scenario BeforeSuite */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-86'

Feature('issue-86 table header cells are wrapped in a <tr>')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
})

Scenario('@issue @issue-86 no <th> is a direct child of <thead>', ({ I }) => {
  I._waitForElement('[data-path="#/table"] thead > tr > th')

  // array-table, array-table-object and array-tuple: header cells sit in a row
  I.seeElement('[data-path="#/table"] thead > tr > th')
  I.seeElement('[data-path="#/tableObject"] thead > tr > th')
  I.seeNumberOfElements('[data-path="#/tuple"] thead > tr > th', 2)

  // and never directly in <thead>
  I.dontSeeElementInDOM('thead > th')
})
