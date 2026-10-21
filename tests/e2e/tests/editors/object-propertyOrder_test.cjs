/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('object')

Scenario('@editor @object should sort by @propertyOrder', async ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample('editors/object-propertyOrder')

  let labelTexts

  labelTexts = await I.executeScript(() => {
    const labels = document.querySelectorAll('.jedi-children-slot label')
    return Array.from(labels).map(label => label.textContent.trim())
  })

  I.assertEqual(labelTexts[0], 'c')
  I.assertEqual(labelTexts[1], 'b')
  I.assertEqual(labelTexts[2], 'a')

  I._click('.jedi-properties-toggle')
  I._click('[id="root-a-activator"]')
  I.dontSee('[data-path="#/a"')
  I._click('[id="root-b-activator"]')
  I.dontSee('[data-path="#/b"')
  I._click('[id="root-c-activator"]')
  I.dontSee('[data-path="#/c"')

  I._click('[id="root-a-activator"]')
  I._click('[id="root-b-activator"]')
  I._click('[id="root-c-activator"]')

  labelTexts = await I.executeScript(() => {
    const labels = document.querySelectorAll('.jedi-children-slot label')
    return Array.from(labels).map(label => label.textContent.trim())
  })

  I.assertEqual(labelTexts[0], 'c')
  I.assertEqual(labelTexts[1], 'b')
  I.assertEqual(labelTexts[2], 'a')
})