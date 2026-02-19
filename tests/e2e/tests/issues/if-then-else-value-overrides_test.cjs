/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'issue/if-then-else-value-overrides'

Feature('if-then-else-value-overrides')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@issue @if-then-else-value-overrides should be fixed', ({ I }) => {
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    test: {
      propA: '',
      propB: null
    }
  }))

  I.click('yes')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "test": {
      "propA": "yes",
      "propB": 0
    }
  }))

  I.click('no')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "test": {
      "propA": "no",
      "propB": 0
    }
  }))

  I.click('unknown')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "test": {
      "propA": "unknown",
      "propB": null
    }
  }))

  I.click('none')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "test": {
      "propA": "none",
      "propB": null
    }
  }))

  I.click('yes')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "test": {
      "propA": "yes",
      "propB": 0
    }
  }))

  I.click('no')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "test": {
      "propA": "no",
      "propB": 0
    }
  }))

  I.click('unknown')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "test": {
      "propA": "unknown",
      "propB": null
    }
  }))

  I.click('none')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "test": {
      "propA": "none",
      "propB": null
    }
  }))
})