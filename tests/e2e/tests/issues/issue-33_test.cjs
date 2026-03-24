/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-33'

Feature('issue-33 allOf multiple if/then/else independence')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @issue-33 when size is not large both element_b and element_d should be hidden', ({ I }) => {
  // Default is "medium" — both elements must be hidden
  I._waitForInvisible('[data-path="#/element_b"]')
  I._waitForInvisible('[data-path="#/element_d"]')
})

Scenario('@issue @issue-33 when size is large both element_b and element_d should be visible', ({ I }) => {
  I.selectOption('[data-path="#/size"] select', 'large')
  I._waitForVisible('[data-path="#/element_b"]')
  I._waitForVisible('[data-path="#/element_d"]')
})

Scenario('@issue @issue-33 switching back to medium hides both elements again', ({ I }) => {
  I.selectOption('[data-path="#/size"] select', 'medium')
  I._waitForInvisible('[data-path="#/element_b"]')
  I._waitForInvisible('[data-path="#/element_d"]')
})
