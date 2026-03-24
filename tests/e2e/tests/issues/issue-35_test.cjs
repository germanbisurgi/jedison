/* global Feature Scenario BeforeSuite */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-35'

Feature('issue-35 anyOf embedSwitcher child instances registration')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @issue-35 active branch children should be registered in jedison.instances', async ({ I }) => {
  // Option A is active by default — field_a and field_b must be in instances
  const fieldARegistered = await I.executeScript(() => {
    return window.editor.instances.has('#/switcher_test/field_a')
  })
  I.assertTrue(fieldARegistered)

  const fieldBRegistered = await I.executeScript(() => {
    return window.editor.instances.has('#/switcher_test/field_b')
  })
  I.assertTrue(fieldBRegistered)
})

Scenario('@issue @issue-35 switching branches should update registered instances', async ({ I }) => {
  // Switch to Option B
  I.selectOption('[data-path="#/switcher_test"] select', 'Option B')
  I._waitForElement('.jedi-ready')

  const fieldCRegistered = await I.executeScript(() => {
    return window.editor.instances.has('#/switcher_test/field_c')
  })
  I.assertTrue(fieldCRegistered)

  const fieldDRegistered = await I.executeScript(() => {
    return window.editor.instances.has('#/switcher_test/field_d')
  })
  I.assertTrue(fieldDRegistered)

  // Option A children must be unregistered after switch
  const fieldARegistered = await I.executeScript(() => {
    return window.editor.instances.has('#/switcher_test/field_a')
  })
  I.assertFalse(fieldARegistered)
})
