/* global Feature Scenario BeforeSuite */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/issue-42'

Feature('issue-42 x-info scoped per-column in table-object arrays')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @issue-42 each column info button should open its own modal content', async ({ I }) => {
  I._waitForElement('.jedi-info-button')

  // Field A — first column info button
  await I.executeScript(() => { document.querySelectorAll('thead .jedi-info-button')[0].click() })
  I._waitForText('Info A')
  I._waitForText('Info content for Field A')
  await I.executeScript(() => { document.querySelector('dialog[open] .jedi-modal-close').click() })

  // Field B — second column info button
  await I.executeScript(() => { document.querySelectorAll('thead .jedi-info-button')[1].click() })
  I._waitForText('Info B')
  I._waitForText('Info content for Field B')
  await I.executeScript(() => { document.querySelector('dialog[open] .jedi-modal-close').click() })

  // Field C — third column info button
  await I.executeScript(() => { document.querySelectorAll('thead .jedi-info-button')[2].click() })
  I._waitForText('Info C')
  I._waitForText('Info content for Field C')
  await I.executeScript(() => { document.querySelector('dialog[open] .jedi-modal-close').click() })
})