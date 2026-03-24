/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'editors/object-categories-categoryOrder'

Feature('object-categories')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@editor @object-categories should render @categoryOrder tabs in specified order', ({ I }) => {
  I._waitForText('Contact', '.jedi-nav-list li:nth-child(1) .jedi-nav-link')
  I._waitForText('Address', '.jedi-nav-list li:nth-child(2) .jedi-nav-link')
  I._waitForText('Basic', '.jedi-nav-list li:nth-child(3) .jedi-nav-link')
})

Scenario('@editor @object-categories @categoryOrder should show correct fields per tab', ({ I }) => {
  pause()
  // Switch to Contact tab
  I._click('.jedi-nav-list li:nth-child(1) .jedi-nav-link')
  I._waitForText('Email')
  I._waitForText('Phone')

  // Switch to Address tab
  I._click('.jedi-nav-list li:nth-child(2) .jedi-nav-link')
  I._waitForText('Street')
  I._waitForText('City')

  // Switch to Basic tab
  I._click('.jedi-nav-list li:nth-child(3) .jedi-nav-link')
  I._waitForText('Name')
})
