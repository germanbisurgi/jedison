/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'

// Editing one cell must not rebuild the other rows: the wrapper (item or table
// row) of another row has to still be the same DOM element afterwards.
const editOneCellKeepsOtherRows = async (I) => {
  const result = await I.executeScript(() => {
    const selector = '#jedison-container input[type=text], #jedison-container input:not([type])'
    const rowOf = (input) => input.closest('.jedi-array-item, tr')
    const inputs = document.querySelectorAll(selector)
    const keeper = rowOf(inputs[10])
    const edited = inputs[0]

    edited.value = 'typed'
    edited.dispatchEvent(new Event('input', { bubbles: true }))
    edited.dispatchEvent(new Event('change', { bubbles: true }))

    return {
      keptSameElement: rowOf(document.querySelectorAll(selector)[10]) === keeper,
      valueUpdated: JSON.stringify(window.editor.getValue()[0]).includes('typed')
    }
  })

  I.assertEqual(result.keptSameElement, true)
  I.assertEqual(result.valueUpdated, true)
}

// Sortable moves the dragged row in the DOM itself and then calls onEnd. The
// screen must still show the same order as the value afterwards.
const dropFirstRowAtEnd = async (I) => {
  const result = await I.executeScript(() => {
    const selector = '#jedison-container input[type=text], #jedison-container input:not([type])'
    const editor = window.editor.root.ui
    const rows = document.querySelectorAll('#jedison-container .jedi-array-item, #jedison-container tbody tr')
    const last = rows.length - 1

    rows[0].parentElement.appendChild(rows[0])
    editor.sortable.options.onEnd({ oldIndex: 0, newIndex: last })

    const first = window.editor.getValue()[0]
    return {
      expected: typeof first === 'string' ? first : first.name,
      shown: document.querySelectorAll(selector)[0].value
    }
  })

  I.assertEqual(result.shown, result.expected)
}

const ensureSortable = (I) => {
  I.executeScript(() => {
    window.Sortable = window.Sortable || { create: (container, options) => ({ options, destroy () {} }) }
  })
}

Feature('large-array-rendering')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}`)
})

Scenario('editing one item does not rebuild the other items @large-array-rendering @array', async ({ I }) => {
  I.selectOption('#examples', 'examples/large-array')
  I.waitForElement('.jedi-ready', 60)
  await editOneCellKeepsOtherRows(I)
})

Scenario('editing one row does not rebuild the other rows @large-array-rendering @array-table', async ({ I }) => {
  I.selectOption('#examples', 'examples/large-table')
  I.waitForElement('.jedi-ready', 60)
  await editOneCellKeepsOtherRows(I)
})

Scenario('editing one row does not rebuild the other rows @large-array-rendering @array-table-object', async ({ I }) => {
  I.selectOption('#examples', 'examples/large-table-object')
  I.waitForElement('.jedi-ready', 60)
  await editOneCellKeepsOtherRows(I)
})

Scenario('dropping a dragged item keeps the screen in sync @large-array-rendering @array', async ({ I }) => {
  ensureSortable(I)
  I.selectOption('#examples', 'examples/large-array')
  I.waitForElement('.jedi-ready', 60)
  await dropFirstRowAtEnd(I)
})

Scenario('dropping a dragged row keeps the screen in sync @large-array-rendering @array-table', async ({ I }) => {
  ensureSortable(I)
  I.selectOption('#examples', 'examples/large-table')
  I.waitForElement('.jedi-ready', 60)
  await dropFirstRowAtEnd(I)
})

Scenario('dropping a dragged row keeps the screen in sync @large-array-rendering @array-table-object', async ({ I }) => {
  ensureSortable(I)
  I.selectOption('#examples', 'examples/large-table-object')
  I.waitForElement('.jedi-ready', 60)
  await dropFirstRowAtEnd(I)
})
