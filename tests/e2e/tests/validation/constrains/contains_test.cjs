/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('contains')

Scenario('@constraint @contains should display validation errors', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/contains')
  I._selectShowErrors('always')
  I._scrollTo('[data-path="#"]')
  I._waitForText('Must contain at least one item matching the provided schema')
  I._click('.jedi-array-add')
  I.dontSee('Must contain at least one item matching the provided schema')
})

Scenario('@constraint @minContains should display validation errors', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/minContains')
  I._selectShowErrors('always')
  I._scrollTo('[data-path="#"]')
  I.dontSee('Must contain at least one item matching the provided schema')
  I._waitForText('Must contain at least 2 items matching the provided schema. It currently contains 0')
  I._click('.jedi-array-add')
  I.dontSee('Must contain at least one item matching the provided schema')
  I._waitForText('Must contain at least 2 items matching the provided schema. It currently contains 1')
  I._click('.jedi-array-add')
  I.dontSee('Must contain at least one item matching the provided schema')
  I.dontSee('minimum contains count of 2')
})

Scenario('@constraint @maxContains should display validation errors', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/maxContains')
  I._selectShowErrors('always')
  I._scrollTo('[data-path="#"]')
  I._waitForText('Must contain at least one item matching the provided schema')
  I._click('.jedi-array-add')
  I.dontSee('Must contain at least one item matching the provided schema')
  I._click('.jedi-array-add')
  I.dontSee('Must contain at least one item matching the provided schema')
  I._click('.jedi-array-add')
  I._waitForText('Must contain at most 2 items matching the provided schema. It currently contains 3')
})
