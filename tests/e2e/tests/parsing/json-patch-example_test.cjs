/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'parsing/json-patch'

Feature('markdown-annotation')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
});

Scenario('Should use @expand allOf and oneOf schemas and @mergeAllOf in @jsonPatchExample', ({I}) => {
  I._checkOption('[id="mergeAllOf"]')
  I._click('.jedi-array-add')
  I._waitForElement('#root-0-path')
  I._waitForElement('#root-0-op')
  I._waitForElement('[data-path="#/0/value"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify([
    {
      "path": "",
      "op": "add",
      "value": "",
      "from": ""
    }
  ]))
})
