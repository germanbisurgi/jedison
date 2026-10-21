/* global Feature Scenario */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'editors/array-buttons-content'

Feature('array')

BeforeSuite(({I}) => {
  I.amOnPage(`playground.html?theme=${theme}`)
  I._selectExample(pathToSchema)
});

Scenario('@editor @array-buttons-content should override array buttons content', ({I}) => {
  I._waitForText('ADD', '.jedi-array-add')
  I._waitForText('DELETE', '.jedi-array-delete')
  I._waitForText('UP', '.jedi-array-move-up')
  I._waitForText('DOWN', '.jedi-array-move-down')
  I._waitForText('DRAG', '.jedi-array-drag')
  I._waitForText('COLLAPSE', '.jedi-collapse-toggle')
})
