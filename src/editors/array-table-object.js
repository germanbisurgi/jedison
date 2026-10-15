import EditorArray from './array.js'
import { isArray, isSet } from '../helpers/utils.js'
import { getSchemaItems, getSchemaProperties, getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents an EditorArrayTableObject instance.
 * @extends EditorArray
 */
class EditorArrayTableObject extends EditorArray {
  static resolves (schema, refParser) {
    let schemaItems = getSchemaItems(schema)

    if (!schemaItems) {
      return false
    }

    if (refParser) {
      schemaItems = refParser.expand(schemaItems)
    }

    const itemType = getSchemaType(schemaItems)

    if (!itemType) {
      return false
    }

    return getSchemaType(schema) === 'array' && itemType === 'object' && getSchemaXOption(schema, 'format') === 'table-object'
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

  getRenderedInstances () {
    return this.instance.children.flatMap((child) => [child, ...child.children])
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

    const value = this.instance.getValue()
    if (!isArray(value) || value.length === 0) {
      table.table.removeChild(table.thead)
    }

    let schemaItems = getSchemaItems(this.instance.schema)

    if (this.instance.jedison.refParser) {
      schemaItems = this.instance.jedison.refParser.expand(schemaItems)
    }
    const itemProperties = getSchemaProperties(schemaItems)

    Object.entries(itemProperties).forEach(([propertyKey, propertySchema]) => {
      const th = this.theme.getTableHeader()

      if (propertySchema.title) {
        const fakeLabel = this.theme.getFakeLabel({
          content: propertySchema.title
        })

        th.appendChild(fakeLabel.label)
      }

      const schemaXInfo = getSchemaXOption(propertySchema, 'info')

      if (isSet(schemaXInfo)) {
        const infoContent = this.getInfo(propertySchema)
        const info = this.theme.getInfo(infoContent)

        if (schemaXInfo.variant === 'modal') {
          this.theme.infoAsModal(info, this.getIdFromPath(this.instance.path) + '-' + propertyKey, infoContent)
        }

        th.appendChild(info.container)
      }

      theadRow.appendChild(th)
    })

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

      // editors
      if (child.children.length) {
        child.children.forEach((grandchild) => {
          const td = this.theme.getTableDefinition()
          grandchild.ui.adaptForTable(td)
          grandchild.ui.control.info?.container?.remove() // info lives once in the header (#64)
          td.appendChild(grandchild.ui.control.container)
          tbodyRow.appendChild(td)
        })
      } else {
        const td = this.theme.getTableDefinition()
        child.ui.adaptForTable(td)
        child.ui.control.info?.container?.remove() // info lives once in the header (#64)
        td.appendChild(child.ui.control.container)
        tbodyRow.appendChild(td)
      }

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

export default EditorArrayTableObject
