/* global Feature Scenario BeforeSuite */

const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/jodit-as-prop'
const value = {
  value: '<p>Some Value</p>'
}

Feature('Jodit')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@plugin @jodit-as-prop should @setValue', ({ I }) => {
  // instance
  I.fillField('#editor-value', JSON.stringify(value))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify(value))

  I.click('.jodit-wysiwyg')
  I.pressKey('Space')
  I.pressKey('H')
  I.pressKey('e')
  I.pressKey('l')
  I.pressKey('l')
  I.pressKey('o')
  I.pressKey('Tab')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    value: '<p>Some Value Hello</p>'
  }))
})
