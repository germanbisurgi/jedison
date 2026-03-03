/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-17'
const value = {
  ssss: {
    key: 'test',
    details: []
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
  I._waitForValue('#root-ssss-key', 'test')
})
