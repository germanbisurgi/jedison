import EditorArray from './array.js'
import { isSet } from '../helpers/utils.js'
import { getSchemaItems, getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents an EditorArrayTable instance.
 * @extends EditorArray
 */
class EditorArrayTable extends EditorArray {
  static resolves (schema, refParser) {
    return getSchemaType(schema) === 'array' && getSchemaXOption(schema, 'format') === 'table'
  }

  addEventListeners () {
    this.control.addBtn.addEventListener('click', () => {
      this.activeItemIndex = this.instance.value.length
      this.instance.addItem('user')
    })

    this.control.footerAddBtn.addEventListener('click', () => {
      this.activeItemIndex = this.instance.value.length
      this.instance.addItem('user')
    })

    if (this.control.deleteAllBtn) {
      this.control.deleteAllBtn.addEventListener('click', () => {
        this.deleteAllItems()
      })
    }

    if (this.control.footerDeleteAllBtn) {
      this.control.footerDeleteAllBtn.addEventListener('click', () => {
        this.deleteAllItems()
      })
    }

    this.addJsonDataEventListeners()
  }

  isSortable () {
    return window.Sortable && isSet(getSchemaXOption(this.instance.schema, 'sortable'))
  }

  refreshUI () {
    if (this.isRenderCurrent()) {
      this.refreshAddBtn()
      this.refreshDeleteAllBtn()
      this.refreshJsonData()
      return
    }

    this.control.childrenSlot.innerHTML = ''

    const table = this.theme.getTable()

    this.control.childrenSlot.appendChild(table.container)

    // Header cells need a row of their own: a <th> directly inside <thead>
    // is invalid HTML, and CSS like `thead > tr > th` would not match it.
    const theadRow = document.createElement('tr')
    table.thead.appendChild(theadRow)

    const readOnly = this.instance.isReadOnly()
    const arrayDelete = getSchemaXOption(this.instance.schema, 'arrayDelete') ?? this.instance.jedison.getOption('arrayDelete')
    const arrayMove = getSchemaXOption(this.instance.schema, 'arrayMove') ?? this.instance.jedison.getOption('arrayMove')
    const arrayButtonsPosition = getSchemaXOption(this.instance.schema, 'arrayButtonsPosition') ?? this.instance.jedison.getOption('arrayButtonsPosition')
    const arrayAddAfter = getSchemaXOption(this.instance.schema, 'arrayAddAfter') ?? this.instance.jedison.getOption('arrayAddAfter')
    const showButtons = !readOnly && (arrayDelete === true || arrayMove === true || arrayAddAfter === true || this.isSortable())

    // thead labels
    const th = this.theme.getTableHeader()
    const { label } = this.theme.getFakeLabel({
      content: 'Controls',
      visuallyHidden: true
    })

    th.appendChild(label)

    // Add controls header at the beginning (left) or end (right)
    if (arrayButtonsPosition === 'left' && showButtons) {
      theadRow.appendChild(th)
    }

    // table header

    if (this.instance.children.length) {
      const schemaItems = getSchemaItems(this.instance.schema)

      const thTitle = this.theme.getTableHeader()

      if (schemaItems) {
        if (schemaItems.title) {
          const fakeLabel = this.theme.getFakeLabel({
            content: schemaItems.title
          })

          thTitle.appendChild(fakeLabel.label)
        }

        const schemaXInfo = getSchemaXOption(schemaItems, 'info')

        if (isSet(schemaXInfo)) {
          const infoContent = this.getInfo(schemaItems)
          const info = this.theme.getInfo(infoContent)

          if (schemaXInfo.variant === 'modal') {
            this.theme.infoAsModal(info, this.getIdFromPath(this.instance.path) + '-item', infoContent)
          }

          thTitle.appendChild(info.container)
        }
      }

      theadRow.appendChild(thTitle)
    }

    // Add controls header at the end if position is right
    if (arrayButtonsPosition === 'right' && showButtons) {
      theadRow.appendChild(th)
    }

    // tbody rows
    this.instance.children.forEach((child, index) => {
      const tbodyRow = document.createElement('tr')

      // buttons
      const buttonsTd = this.theme.getTableDefinition({ isButtonColumn: true })
      const { deleteBtn, moveUpBtn, moveDownBtn, dragBtn, btnGroup, addAfterBtn } = this.getButtons(index)

      if (this.isSortable() && !readOnly) {
        btnGroup.appendChild(dragBtn)
      }

      if (isSet(arrayDelete) && arrayDelete === true && !readOnly) {
        btnGroup.appendChild(deleteBtn)
      }

      if (isSet(arrayMove) && arrayMove === true && !readOnly) {
        btnGroup.appendChild(moveUpBtn)
        btnGroup.appendChild(moveDownBtn)
      }

      if (isSet(arrayAddAfter) && arrayAddAfter === true && !readOnly) {
        btnGroup.appendChild(addAfterBtn)
      }

      buttonsTd.appendChild(btnGroup)

      // Add buttons column at the beginning (left) or end (right)
      if (arrayButtonsPosition === 'left' && showButtons) {
        tbodyRow.appendChild(buttonsTd)
      }

      // child
      const td = this.theme.getTableDefinition()
      child.ui.adaptForTable(child, td)
      child.ui.control.info?.container?.remove() // info lives once in the header (#64)
      td.appendChild(child.ui.control.container)
      tbodyRow.appendChild(td)

      // Add buttons column at the end if position is right
      if (arrayButtonsPosition === 'right' && showButtons) {
        tbodyRow.appendChild(buttonsTd)
      }

      table.tbody.appendChild(tbodyRow)
    })

    this.refreshSortable(table.tbody)
    this.refreshAddBtn()
    this.refreshDeleteAllBtn()
    this.refreshJsonData()
    this.refreshDisabledState()
    this.refreshScrollPosition(table.container)
    this.markRendered()

    table.container.addEventListener('scroll', () => {
      this.lastScrollTop = table.container.scrollTop
      this.lastScrollLeft = table.container.scrollLeft
    })
  }

  refreshScrollPosition (element) {
    element.scroll({
      top: this.lastScrollTop,
      left: this.lastScrollLeft
    })
  }
}

export default EditorArrayTable
