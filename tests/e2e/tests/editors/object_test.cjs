/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'editors/object'

Feature('object')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
});

Scenario('@editor @object should have @title and @description', ({ I }) => {
  I._waitForText('Object', 'legend')
  I._waitForText('Objects are the mapping type in JSON. They map “keys” to “values”. In JSON, the “keys” must always be strings. Each of these pairs is conventionally referred to as a “property”.')
})

Scenario('@editor @object should have @infoButton', ({I}) => {
  I._waitForElement('.jedi-info-button')
  I._click('.jedi-info-button')
  I._waitForText('Info Button title')
  I._waitForText('Info button content')
  I._click('.jedi-modal-close')
  I.waitForInvisible('Info Button title')
  I.waitForInvisible('Info button content')
})

Scenario('@editor @object @enablePropertiesToggle should add properties', ({ I }) => {
  I._click('.jedi-quick-add-property-toggle')
  I.fillField('#jedi-quick-add-property-input-root', 'test')
  I.pressKey('Tab')
  I._click('.jedi-add-property-btn')
  I._waitForElement('[data-path="#/test"')
  I._click('.jedi-properties-toggle')
  I._waitForElement('[id="root-test-activator"]')
  I._click('[id="root-test-activator"]')
  I.dontSee('[data-path="#/test"')
})

Scenario('@editor @object @enablePropertiesToggle should activate and deactivate properties', ({ I }) => {
  I._click('.jedi-properties-toggle')
  I._waitForElement('[id="root-notRequired-activator"]:not(:disabled)')
  I._waitForElement('[id="root-notRequired"]')
  I._click('[id="root-notRequired-activator"]')
  I.dontSee('[data-path="#/notRequired"]')
  I._click('[id="root-notRequired-activator"]')
  I._waitForElement('[data-path="#/notRequired"]')
})

Scenario('@editor @object @enableCollapseToggle should collapse and expand contents', ({ I }) => {
  I._click('.jedi-collapse-toggle')
  I.waitForInvisible('.jedi-editor-card-body')
  I._click('.jedi-collapse-toggle')
  I.waitForVisible('.jedi-editor-card-body')
})

Scenario('@editor @object @object-grid rows and columns', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', 'editors/object-grid')
  I._waitForElement('.jedi-ready')

  if (theme === 'barebones') {
    I.seeNumberOfVisibleElements('.jedi-ready .jedi-row', 13)
    I._waitForElement('.jedi-ready .jedi-col-md-1')
    I._waitForElement('.jedi-ready .jedi-col-md-2')
    I._waitForElement('.jedi-ready .jedi-col-md-3')
    I._waitForElement('.jedi-ready .jedi-col-md-4')
    I._waitForElement('.jedi-ready .jedi-col-md-5')
    I._waitForElement('.jedi-ready .jedi-col-md-6')
    I._waitForElement('.jedi-ready .jedi-col-md-7')
    I._waitForElement('.jedi-ready .jedi-col-md-8')
    I._waitForElement('.jedi-ready .jedi-col-md-9')
    I._waitForElement('.jedi-ready .jedi-col-md-10')
    I._waitForElement('.jedi-ready .jedi-col-md-11')
    I._waitForElement('.jedi-ready .jedi-col-md-12')
    I._waitForElement('.jedi-ready .jedi-col-md-1.jedi-col-md-offset-1')
    I._waitForElement('.jedi-ready .jedi-col-md-1.jedi-col-md-offset-2')
    I._waitForElement('.jedi-ready .jedi-col-md-1.jedi-col-md-offset-3')
    I._waitForElement('.jedi-ready .jedi-col-md-1.jedi-col-md-offset-4')
    I._waitForElement('.jedi-ready .jedi-col-md-1.jedi-col-md-offset-5')
    I._waitForElement('.jedi-ready .jedi-col-md-1.jedi-col-md-offset-6')
    I._waitForElement('.jedi-ready .jedi-col-md-1.jedi-col-md-offset-7')
    I._waitForElement('.jedi-ready .jedi-col-md-1.jedi-col-md-offset-8')
    I._waitForElement('.jedi-ready .jedi-col-md-1.jedi-col-md-offset-9')
    I._waitForElement('.jedi-ready .jedi-col-md-1.jedi-col-md-offset-10')
    I._waitForElement('.jedi-ready .jedi-col-md-1.jedi-col-md-offset-11')
  }

  if (theme === 'bootstrap3') {
    I.seeNumberOfVisibleElements('.jedi-ready .row', 13)
    I.seeElement('.jedi-ready .col-md-1')
    I.seeElement('.jedi-ready .col-md-2')
    I.seeElement('.jedi-ready .col-md-3')
    I.seeElement('.jedi-ready .col-md-4')
    I.seeElement('.jedi-ready .col-md-5')
    I.seeElement('.jedi-ready .col-md-6')
    I.seeElement('.jedi-ready .col-md-7')
    I.seeElement('.jedi-ready .col-md-8')
    I.seeElement('.jedi-ready .col-md-9')
    I.seeElement('.jedi-ready .col-md-10')
    I.seeElement('.jedi-ready .col-md-11')
    I.seeElement('.jedi-ready .col-md-12')
    I.seeElement('.jedi-ready .col-md-1.col-md-offset-1')
    I.seeElement('.jedi-ready .col-md-1.col-md-offset-2')
    I.seeElement('.jedi-ready .col-md-1.col-md-offset-3')
    I.seeElement('.jedi-ready .col-md-1.col-md-offset-4')
    I.seeElement('.jedi-ready .col-md-1.col-md-offset-5')
    I.seeElement('.jedi-ready .col-md-1.col-md-offset-6')
    I.seeElement('.jedi-ready .col-md-1.col-md-offset-7')
    I.seeElement('.jedi-ready .col-md-1.col-md-offset-8')
    I.seeElement('.jedi-ready .col-md-1.col-md-offset-9')
    I.seeElement('.jedi-ready .col-md-1.col-md-offset-10')
    I.seeElement('.jedi-ready .col-md-1.col-md-offset-11')
  }

  if (theme === 'bootstrap4' || theme === 'bootstrap5') {
    I.seeNumberOfVisibleElements('.jedi-ready .row', 13)
    I.seeElement('.jedi-ready .col-md-1')
    I.seeElement('.jedi-ready .col-md-2')
    I.seeElement('.jedi-ready .col-md-3')
    I.seeElement('.jedi-ready .col-md-4')
    I.seeElement('.jedi-ready .col-md-5')
    I.seeElement('.jedi-ready .col-md-6')
    I.seeElement('.jedi-ready .col-md-7')
    I.seeElement('.jedi-ready .col-md-8')
    I.seeElement('.jedi-ready .col-md-9')
    I.seeElement('.jedi-ready .col-md-10')
    I.seeElement('.jedi-ready .col-md-11')
    I.seeElement('.jedi-ready .col-md-12')
    I.seeElement('.jedi-ready .col-md-1.offset-md-1')
    I.seeElement('.jedi-ready .col-md-1.offset-md-2')
    I.seeElement('.jedi-ready .col-md-1.offset-md-3')
    I.seeElement('.jedi-ready .col-md-1.offset-md-4')
    I.seeElement('.jedi-ready .col-md-1.offset-md-5')
    I.seeElement('.jedi-ready .col-md-1.offset-md-6')
    I.seeElement('.jedi-ready .col-md-1.offset-md-7')
    I.seeElement('.jedi-ready .col-md-1.offset-md-8')
    I.seeElement('.jedi-ready .col-md-1.offset-md-9')
    I.seeElement('.jedi-ready .col-md-1.offset-md-10')
    I.seeElement('.jedi-ready .col-md-1.offset-md-11')
  }
})

Scenario('@editor @object @object-nav-vertical', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', 'editors/object-nav-vertical')
  I._waitForElement('.jedi-ready')

  if (theme === 'barebones') {
    I._waitForElement('.jedi-nav-list')
    I.seeNumberOfVisibleElements('.jedi-nav-link', 6)
    I._click('.jedi-nav-list [href="#tab-pane-root-arrays"]')
    I._waitForText('Arrays', '#tab-pane-root-arrays legend')
  }

  if (theme === 'bootstrap3') {
    I._waitForElement('.nav-pills')
    I.seeNumberOfVisibleElements('.nav-pills li', 6)
    I._click('.nav-pills [href="#tab-pane-root-arrays"]')
    I._waitForText('Arrays', '#tab-pane-root-arrays fieldset')
  }

  if (theme === 'bootstrap4' || theme === 'bootstrap5') {
    I._waitForElement('.nav-pills')
    I.seeNumberOfVisibleElements('.nav-link', 6)
    I._click('.nav-pills [href="#tab-pane-root-arrays"]')
    I._waitForText('Arrays', '#tab-pane-root-arrays fieldset')
  }
})

Scenario('@editor @object @object-nav-horizontal', ({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I.selectOption('#examples', 'editors/object-nav-horizontal')
  I._waitForElement('.jedi-ready')

  if (theme === 'barebones') {
    I._waitForElement('.jedi-nav-list')
    I.seeNumberOfVisibleElements('.jedi-nav-link', 6)
    I._click('.jedi-nav-list [href="#tab-pane-root-arrays"]')
    I._waitForText('Arrays', '#tab-pane-root-arrays legend')
  }

  if (theme === 'bootstrap3') {
    I._waitForElement('.nav-tabs')
    I.seeNumberOfVisibleElements('.nav-tabs li', 6)
    I._click('.nav-tabs [href="#tab-pane-root-arrays"]')
    I._waitForText('Arrays', '#tab-pane-root-arrays fieldset')
  }

  if (theme === 'bootstrap4' || theme === 'bootstrap5') {
    I._waitForElement('.nav-tabs')
    I.seeNumberOfVisibleElements('.nav-link', 6)
    I._click('.nav-tabs [href="#tab-pane-root-arrays"]')
    I._waitForText('Arrays', '#tab-pane-root-arrays fieldset')
  }
})
