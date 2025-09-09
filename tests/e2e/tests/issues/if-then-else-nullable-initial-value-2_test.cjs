/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/if-then-else-nullable-initial-value-2'
const data = {
  "species": {
    "presence": "yes",
    "count": 0,
    "statistics": {
      "adults": 1,
      "juveniles": 2,
      "migrants": 3,
      "observed": 4,
      "unclassified": 5,
      "total": 15
    }
  }
}

Feature('issue if-then-else-nullable-initial-value-2 - Wildlife Survey')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @if-then-else-nullable-initial-value-2 should set initial value correctly', ({ I }) => {
  I.fillField('#data', JSON.stringify(data))
  I._scrollTo('#set-data')
  I._click('#set-data')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(data))
})