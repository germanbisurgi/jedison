/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'features/purify-labels'

Feature('purify-labels')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('Should @purify-labels not run scripts from titles', async ({ I }) => {
  I.waitForElement('#editor-value')
  const xss = await I.executeScript(() => window.__xss)
  I.assertEqual(xss, undefined)
})

Scenario('Should @purify-labels not run scripts from property names in the data', async ({ I }) => {
  I.waitForElement('#editor-value')
  I.fillField('#editor-value', '{"name":"a","<img src=x onerror=\\"window.__xss = \'key\'\\">":"b"}')
  I.click('#set-value')
  I.wait(1)
  const xss = await I.executeScript(() => window.__xss)
  I.assertEqual(xss, undefined)
})
