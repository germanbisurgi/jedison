/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('patternProperties')

Scenario('@constraint @patternProperties should display validation errors', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/patternProperties')
  I._selectShowErrors('always')
  I.fillField('#editor-value', JSON.stringify({
    S: '',
    I: 0
  }))
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForText('Must have value of: "test"', '[data-path="#"]')
  I._waitForText('Must have value of: 21', '[data-path="#"]')
  I.fillField('#editor-value', JSON.stringify({
    S: 'test',
    I: 21
  }))
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I.dontSee('Must have value of: "test"', '[data-path="#"]')
  I.dontSee('Must have value of: 21', '[data-path="#"]')
})
