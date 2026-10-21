/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/if-then-else-initial-value'
const data = {
  "rotfuchs": {
    "vk": "keine_angabe",
    "jungtiere": "",
    "gehecke": ""
  },
  "dachs": {
    "vk": "keine_angabe",
    "jungtiere": "",
    "gehecke": ""
  },
  "baummarder": {
    "vk": ""
  },
  "iltis": {
    "vk": "keine_angabe"
  }
}

Feature('issue if-then-else-initial-value')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
})

Scenario('@issue @if-then-else-initial-value should set initial value correctly', ({ I }) => {
  I.fillField('#data', JSON.stringify(data))
  I._scrollTo('#set-data')
  I._click('#set-data')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(data))
})