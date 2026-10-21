/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'features/markdown-annotations'

Feature('markdown-annotation')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
});

Scenario('Should parse @markdown to html', ({I}) => {
  I._waitForText('markdown to html title', 'strong')
  I._uncheckOption('[id="parseMarkdown"]')
  I._waitForText('**markdown to html title**')
})
