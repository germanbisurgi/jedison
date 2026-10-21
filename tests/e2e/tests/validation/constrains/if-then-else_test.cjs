/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'

Feature('if-then-else')

Scenario('@constraint @if-then-else validate against @if-then-else-deeply-nested-and-unselected', async ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/if-then-else-deeply-nested-and-unselected')
  I._scrollTo('[data-path="#"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "occurrence": "",
    "huntingBag": {
      "harvest": 0,
      "accidentGame": 0,
      "foundDead": 0
    },
    "total": 0
  }))

  I.click('label[for="root-occurrence-0"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "occurrence": "Resident game",
    "huntingBag": {
      "harvest": 0,
      "accidentGame": 0,
      "foundDead": 0,
      "unknown": 0
    },
    "total": 0
  }))

  I.fillField('[id="root-huntingBag-harvest"]', 1)
  I.pressKey('Tab')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "occurrence": "Resident game",
    "huntingBag": {
      "harvest": 1,
      "accidentGame": 0,
      "foundDead": 0,
      "unknown": 0
    },
    "total": 0
  }))

  I.click('label[for="root-occurrence-4"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "occurrence": "No information",
    "huntingBag": {
      "harvest": 0,
      "accidentGame": 0,
      "foundDead": 0
    },
    "total": 0
  }))

  I.click('label[for="root-occurrence-0"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "occurrence": "Resident game",
    "huntingBag": {
      "harvest": 0,
      "accidentGame": 0,
      "foundDead": 0,
      "unknown": 0
    },
    "total": 0
  }))
})

Scenario('@constraint @if-then-else validate against @if-then-else-nested-simple', async ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/if-then-else-nested-simple')
  I._scrollTo('[data-path="#"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "occurrence": "yes",
    "count": 4
  }))

  I.click('label[for="root-occurrence-1"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "occurrence": "no",
    "count": 0,
    "something": ""
  }))

  I.fillField('[id="root-something"]', 'test')
  I.pressKey('Tab')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "occurrence": "no",
    "count": 0,
    "something": "test"
  }))

  I.click('label[for="root-occurrence-0"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "occurrence": "yes",
    "count": 4
  }))
})

Scenario('@constraint @if-then-else validate against @if-then-else-nested-complex', async ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/if-then-else-nested-complex')
  I._scrollTo('[data-path="#"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "grayGoose": {
      "presence": "unknown",
      "nesting": "unknown",
      "pairCount": null
    }
  }))

  I.click('label[for="root-grayGoose-presence-1"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "grayGoose": {
      "presence": "no",
      "nesting": "no",
      "pairCount": 0
    }
  }))

  I.click('label[for="root-grayGoose-presence-0"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "grayGoose": {
      "presence": "yes",
      "nesting": "unknown",
      "pairCount": null
    }
  }))

  I.click('label[for="root-grayGoose-nesting-1"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "grayGoose": {
      "presence": "yes",
      "nesting": "no",
      "pairCount": 0
    }
  }))

  I.click('label[for="root-grayGoose-nesting-0"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "grayGoose": {
      "presence": "yes",
      "nesting": "yes",
      "pairCount": 0
    }
  }))

  I.fillField('[id="root-grayGoose-pairCount"]', 5)
  I.pressKey('Tab')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "grayGoose": {
      "presence": "yes",
      "nesting": "yes",
      "pairCount": 5
    }
  }))

  I.click('label[for="root-grayGoose-nesting-1"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "grayGoose": {
      "presence": "yes",
      "nesting": "no",
      "pairCount": 0
    }
  }))

  I.click('label[for="root-grayGoose-nesting-2"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "grayGoose": {
      "presence": "yes",
      "nesting": "unknown",
      "pairCount": null
    }
  }))

  I.click('label[for="root-grayGoose-presence-1"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "grayGoose": {
      "presence": "no",
      "nesting": "no",
      "pairCount": 0
    }
  }))

  I.click('label[for="root-grayGoose-presence-0"]')
  I.click('label[for="root-grayGoose-nesting-0"]')


  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "grayGoose": {
      "presence": "yes",
      "nesting": "yes",
      "pairCount": 0
    }
  }))
})

Scenario('@constraint @if-then-else validate against @if-then-else-nested-complex-2', async ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/if-then-else-nested-complex-2')
  I._scrollTo('[data-path="#"]')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "hare": {
      "presence": "",
      "number": null
    },
    "rabbit": {
      "presence": "",
      "number": null
    },
    "partridge": {
      "presence": "",
      "number": null
    },
    "pheasant": {
      "presence": "",
      "number": null
    }
  }))

  I.fillField('#editor-value', JSON.stringify({
    "hare": {
      "presence": "no information",
      "number": null
    },
    "rabbit": {
      "presence": "no information",
      "number": null
    },
    "partridge": {
      "presence": "yes",
      "number": 11
    },
    "pheasant": {
      "presence": "no",
      "number": 0
    }
  }))
  I._scrollTo('#set-value')
  I._click('#set-value')

  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "hare": {
      "presence": "no information",
      "number": null
    },
    "rabbit": {
      "presence": "no information",
      "number": null
    },
    "partridge": {
      "presence": "yes",
      "number": 11
    },
    "pheasant": {
      "presence": "no",
      "number": 0
    }
  }))

  I.seeCheckboxIsChecked('[id="root-hare-presence-3"]')
  I.seeCheckboxIsChecked('[id="root-rabbit-presence-3"]')
  I.seeCheckboxIsChecked('[id="root-partridge-presence-0"]')
  I._waitForValue('[id="root-partridge-number"]', 11)
  I.seeCheckboxIsChecked('[id="root-pheasant-presence-1"]')
  I._waitForValue('[id="root-pheasant-number"]', 0)
})

Scenario('@constraint @if-then-else validate against @if-then-else-nested-basic', async ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/if-then-else-nested')
  I._scrollTo('[data-path="#"]')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "vehicleType": "motorcycle",
    "numWheels": 0
  }))

  I.selectOption('[id="root-vehicleType"]', 'bicycle')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "vehicleType": "bicycle",
    "numPedals": 0
  }))

  I.selectOption('[id="root-vehicleType"]', 'other')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "vehicleType": "other",
    "make": "",
    "model": ""
  }))

  I.selectOption('[id="root-vehicleType"]', 'car')
  I._waitForValue('[id="jedi-hidden-input"]', JSON.stringify({
    "vehicleType": "car",
    "numDoors": 0
  }))
})

Scenario('@constraint @if-then-else validate against @if-then-else ', async ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/if-then-else')
  I._scrollTo('[data-path="#"]')

  I.selectOption('[id="root-country"]', 'America')
  I.fillField('[id="root-postal_code"]', 'K1M 1M4')
  I.pressKey('Tab')
  I._waitForText('Must match the pattern: "[0-9]{5}(-[0-9]{4})?"')

  I.selectOption('[id="root-country"]', 'Canada')
  I.fillField('[id="root-postal_code"]', '10000')
  I.pressKey('Tab')
  I._waitForText('Must match the pattern: "[A-Z][0-9][A-Z] [0-9][A-Z][0-9]"')

  I.selectOption('[id="root-country"]', 'America')
  I.fillField('[id="root-postal_code"]', '10000')
  I.pressKey('Tab')
  I.dontSee('.invalid-feedback')

  I.selectOption('[id="root-country"]', 'Canada')
  I.fillField('[id="root-postal_code"]', 'K1M 1M4')
  I.pressKey('Tab')
  I.dontSee('.invalid-feedback')
})

Scenario('@constraint @if-then-else validate against @if-then', async ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/if-then')
  I._scrollTo('[data-path="#"]')

  I.selectOption('[id="root-country"]', 'America')
  I.fillField('[id="root-postal_code"]', 'K1M 1M4')
  I.pressKey('Tab')
  I._waitForText('Must match the pattern: "[0-9]{5}(-[0-9]{4})?"')

  I.selectOption('[id="root-country"]', 'Canada')
  I.fillField('[id="root-postal_code"]', '10000')
  I.pressKey('Tab')
  I.dontSee('.invalid-feedback')

  I.selectOption('[id="root-country"]', 'America')
  I.fillField('[id="root-postal_code"]', '10000')
  I.pressKey('Tab')
  I.dontSee('.invalid-feedback')

  I.selectOption('[id="root-country"]', 'Canada')
  I.fillField('[id="root-postal_code"]', 'K1M 1M4')
  I.pressKey('Tab')
  I.dontSee('.invalid-feedback')
})

Scenario('@constraint @if-then-else validate against @if-else', async ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._waitForElement('.jedi-ready')
  I._selectExample('validator/if-else')
  I._scrollTo('[data-path="#"]')

  I.selectOption('[id="root-country"]', 'America')
  I.fillField('[id="root-postal_code"]', 'K1M 1M4')
  I.pressKey('Tab')
  I.dontSee('.invalid-feedback')

  I.selectOption('[id="root-country"]', 'Canada')
  I.fillField('[id="root-postal_code"]', '10000')
  I.pressKey('Tab')
  I._waitForText('Must match the pattern: "[A-Z][0-9][A-Z] [0-9][A-Z][0-9]"')

  I.selectOption('[id="root-country"]', 'America')
  I.fillField('[id="root-postal_code"]', '10000')
  I.pressKey('Tab')
  I.dontSee('.invalid-feedback')

  I.selectOption('[id="root-country"]', 'Canada')
  I.fillField('[id="root-postal_code"]', 'K1M 1M4')
  I.pressKey('Tab')
  I.dontSee('.invalid-feedback')
})
