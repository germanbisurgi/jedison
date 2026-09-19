/* global Feature Scenario BeforeSuite */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-56'

Feature('issue-56 setValue() on a deactivated instance must reactivate it')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @issue-56 setValue() called directly on a deactivated instance reactivates it and its value reaches the root', async ({ I }) => {
  // oneOfExample is non-required under x-deactivateNonRequired - hidden until opted in
  I.dontSeeElement('[data-path="#/oneOfExample"]')

  I._click('.jedi-properties-toggle')
  I._waitForElement('[id="root-oneOfExample-activator"]:not(:disabled)')
  I._click('[id="root-oneOfExample-activator"]')
  I._waitForElement('[data-path="#/oneOfExample"]')

  // uncheck it again - the instance still exists, just deactivated
  I._click('[id="root-oneOfExample-activator"]')
  I.dontSeeElement('[data-path="#/oneOfExample"]')

  I.executeScript(() => {
    window.editor.getInstance('#/oneOfExample').setValue({ radius: 5 }, true, 'api')
  })

  I._waitForElement('[data-path="#/oneOfExample"]')

  const value = await I.executeScript(() => window.editor.getValue())
  I.assertEqual(JSON.stringify(value), JSON.stringify({ oneOfExample: { radius: 5 } }))

  const errors = await I.executeScript(() => window.editor.root.getErrors())
  I.assertEqual(errors.length, 0, 'the reactivated value should validate cleanly')
})
