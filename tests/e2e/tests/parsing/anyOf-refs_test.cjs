/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'parsing/anyOf-refs'

Feature('markdown-annotation')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
});

Scenario('Should use @expand @anyOfRefs schemas', ({I}) => {
  I._waitForText('Data as Object')
  I._waitForElement('[data-path="#/data"] .jedi-switcher')
  I._waitForElement('[data-path="#/data"][data-type="object"]')
  I.fillField('#editor-value', JSON.stringify({
    "data": []
  }))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._waitForText('Data as Array')
  I._waitForElement('[data-path="#/data"][data-type="array"]')
})
