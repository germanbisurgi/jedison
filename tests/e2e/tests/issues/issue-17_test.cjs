/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-17'
const value = {
  "object": {
    "key": "test",
    "details": [
      "A",
      "B"
    ]
  }
}

Feature('issue-17 should set correct data when using additionalProperties')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @issue-17 should set correct data when using additionalProperties', ({ I }) => {
  I.fillField('#editor-value', JSON.stringify(value))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(value))
  I._waitForValue('#root-object-key', 'test')
})

Scenario('@issue @issue-17 should initialize nested array values from data option', ({ I }) => {
  I.fillField('#data', JSON.stringify(value))
  I._scrollTo('#set-data')
  I._click('#set-data')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('#root-object-details-0', 'A')
  I._waitForValue('#root-object-details-1', 'B')
})
