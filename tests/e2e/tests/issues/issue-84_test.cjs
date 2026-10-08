/* global Feature Scenario BeforeSuite */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-84'

Feature('issue-84 nullable object with default null crashes the editor')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @issue-84 renders and starts as null', ({ I }) => {
  I._waitForElement('[data-path="#/rating"]')
  I._waitForElement('[data-path="#/review"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({ rating: null, review: null }))
})

Scenario('@issue @issue-84 switching the type array variant to Object shows its field', ({ I }) => {
  I.selectOption('[data-path="#/rating"] select', 'Object')
  I._waitForElement('[data-path="#/rating/field"]')
})

Scenario('@issue @issue-84 switching the oneOf variant to the object option shows its field', ({ I }) => {
  I.selectOption('[data-path="#/review"] select', 'Option-2')
  I._waitForElement('[data-path="#/review/comment"]')
})
