/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'features/title-icon-class'

Feature('title-icon-class')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}&iconLib=fontawesome5`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@feature @title-icon-class string input should show icon in label', ({ I }) => {
  I._waitForElement('[data-path="#/name"] label.jedi-label > i.fas.fa-user')
})

Scenario('@feature @title-icon-class textarea should show icon in label', ({ I }) => {
  I._waitForElement('[data-path="#/comments"] label.jedi-label > i.fas.fa-comment')
})
