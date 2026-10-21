/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'parsing/allOf-refs'

Feature('markdown-annotation')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
});

Scenario('Should use @expand allOf schemas and @mergeAllOf', ({I}) => {
  I._waitForElement('[data-path="#/combinedAllOf"] .jedi-switcher')
  I._checkOption('[id="mergeAllOf"]')
  I.waitForInvisible('[data-path="#/combinedAllOf"] .jedi-switcher')
  I._waitForElement('select#root-combinedAllOf')
  I._waitForElement('select#root-combinedAllOf option[value="a"]')
  I._waitForElement('select#root-combinedAllOf option[value="b"]')
})
