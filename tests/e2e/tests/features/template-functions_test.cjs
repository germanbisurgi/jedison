/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'features/template-functions'
const value = [
  {
    route_length: 0.05
  },
  {
    segments: [
      {
        segment_length: 0.5
      },
      {
        segment_length: 0.5
      }
    ]
  }
]

Feature('template-functions')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('Should parse @template-functions', ({ I }) => {
  I.fillField('#editor-value', JSON.stringify(value))
  I._scrollTo('#set-value')
  I._click('#set-value')
  I._scrollTo('[data-path="#"]')

  // Test main company title with default data
  I._waitForText('1 – Route 0.05 km')
  I._waitForText('2 – Route 1 km')
})
