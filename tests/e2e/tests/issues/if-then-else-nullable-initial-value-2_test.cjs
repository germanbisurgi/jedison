/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/if-then-else-nullable-initial-value-2'
const data = {
  "rotfuchs": {
    "vk": "ja",
    "anzahl": 0,
    "grossestrecke": {
      "erlegung": 1,
      "fangjagd": 2,
      "unfallwild": 3,
      "fallwild": 4,
      "klassifiziert": 5,
      "summe": 4
    }
  }
}

Feature('issue if-then-else-nullable-initial-value-2')

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