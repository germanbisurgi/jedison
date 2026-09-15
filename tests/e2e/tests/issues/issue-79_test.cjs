/* global Feature Scenario BeforeSuite */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-79'

Feature('issue-79 x-buttons on an array editor keeps firing after refreshUI()')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @issue-79 the button fires on the very first click', async ({ I }) => {
  I.executeScript(() => {
    window.__fillCount = 0
    window.editor.on('jedison:fill', () => { window.__fillCount += 1 })
  })

  I._waitForElement('[data-path="#/rows"] button.jedi-x-button')
  I._click('[data-path="#/rows"] button.jedi-x-button')

  const count = await I.executeScript(() => window.__fillCount)
  I.assertEqual(count, 1, 'jedison:fill should fire on the first click')
})

// refreshUI() runs again after every array mutation (add/delete/move). The button's
// click handler must survive that, not just the initial render.
Scenario('@issue @issue-79 the button keeps firing after the array editor re-renders', async ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')

  I.executeScript(() => {
    window.__fillCount = 0
    window.editor.on('jedison:fill', () => { window.__fillCount += 1 })
  })

  I._click('[data-path="#/rows"] .jedi-array-add')
  I._waitForElement('[data-path="#/rows/0"]')

  I._click('[data-path="#/rows"] button.jedi-x-button')

  const count = await I.executeScript(() => window.__fillCount)
  I.assertEqual(count, 1, 'jedison:fill should still fire after refreshUI() ran again')
})
