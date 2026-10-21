/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'editors/array'

Feature('array')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
});

Scenario('@editor @array should have @title and @description', ({ I }) => {
  I._scrollTo('[data-path="#"]')
  I._waitForText('Array', '[data-type="array"] legend')
  I._waitForText('Arrays are used for ordered elements. In JSON, each element in an array may be of a different type.')
})

Scenario('@editor @array should have @infoButton', ({I}) => {
  I._waitForElement('.jedi-info-button')
  I._click('.jedi-info-button')
  I._waitForText('Info Button title')
  I._waitForText('Info button content')
  I._click('.jedi-modal-close')
  I.waitForInvisible('Info Button title')
  I.waitForInvisible('Info button content')
})

Scenario('@array-object @enableCollapseToggle should collapse and expand contents', ({ I }) => {
  I._click('.jedi-collapse-toggle')
  I.waitForInvisible('.jedi-editor-card-body')
  I._click('.jedi-collapse-toggle')
  I.waitForVisible('.jedi-editor-card-body')
})

Scenario('@editor @array @array-nav-vertical', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample('editors/array-nav-vertical')

  if (theme === 'barebones') {
    I._waitForElement('.jedi-nav-list')
    I.seeNumberOfVisibleElements('.jedi-nav-link', 2)
    I._click('.jedi-nav-list [href="#tab-pane-root-1"] .jedi-nav-text')
    I._waitForVisible('[id="root-1-name"]')
  }

  if (theme === 'bootstrap3') {
    I._waitForElement('.nav-pills')
    I.seeNumberOfVisibleElements('.nav-pills li', 2)
    I._click('.nav-pills [href="#tab-pane-root-1"] .jedi-nav-text')
    I._waitForValue('[id="root-1-name"]', 'Betti')
  }

  if (theme === 'bootstrap4' || theme === 'bootstrap5') {
    I._waitForElement('.nav-pills')
    I.seeNumberOfVisibleElements('.nav-link', 2)
    I._click('.nav-pills [href="#tab-pane-root-1"] .jedi-nav-text')
    I._waitForValue('[id="root-1-name"]', 'Betti')
  }
})

Scenario('@editor @array @array-nav-horizontal', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample('editors/array-nav-horizontal')

  if (theme === 'barebones') {
    I._waitForElement('.jedi-nav-list')
    I.seeNumberOfVisibleElements('.jedi-nav-link', 2)
    I._click('.jedi-nav-list [href="#tab-pane-root-1"] .jedi-nav-text')
    I._waitForValue('[id="root-1-name"]', 'Betti')
  }

  if (theme === 'bootstrap3') {
    I._waitForElement('.nav-tabs')
    I.seeNumberOfVisibleElements('.nav-tabs li', 2)
    I._click('.nav-tabs [href="#tab-pane-root-1"] .jedi-nav-text')
    I._waitForValue('[id="root-1-name"]', 'Betti')
  }

  if (theme === 'bootstrap4' || theme === 'bootstrap5') {
    I._waitForElement('.nav-tabs')
    I.seeNumberOfVisibleElements('.nav-link', 2)
    I._click('.nav-tabs [href="#tab-pane-root-1"] .jedi-nav-text')
    I._waitForValue('[id="root-1-name"]', 'Betti')
  }
})
