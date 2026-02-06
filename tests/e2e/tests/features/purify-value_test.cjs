/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'features/purify-value'

Feature('purify-value')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('Should @purify-value XSS from direct input', async ({ I }) => {
  I.waitForElement('#root')
  I._fillField('#root', 'bla</script><script>alert(1)</script>')
  I.seeInField('#editor-value', '"bla"')
})

Scenario('Should @purify-value XSS from setValue() via textarea', async ({ I }) => {
  I.waitForElement('#editor-value')
  I.fillField('#editor-value', '"bla</script><script>alert(1)</script>"')
  I.click('#set-value')
  I.seeInField('#editor-value', '"bla"')
})
