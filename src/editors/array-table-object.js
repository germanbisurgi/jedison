import EditorArray from './array.js'
import { isSet } from '../helpers/utils.js'
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
    super.addEventListeners()

    this.control.addBtn.addEventListener('click', () => {
      this.activeItemIndex = this.instance.value.length
      this.instance.addItem('user')
    })
  }

  isSortable () {
    return window.Sortable && isSet(getSchemaXOption(this.instance.schema, 'sortable'))
  }

  refreshUI () {
    this.control.childrenSlot.innerHTML = ''

    const table = this.theme.getTable()

    this.control.childrenSlot.appendChild(table.container)

    // thead labels
    const th = this.theme.getTableHeader()
    const { label } = this.theme.getFakeLabel({
      content: 'Controls',
      visuallyHidden: true
    })

    th.appendChild(label)

    table.thead.appendChild(th)

    if (this.instance.getValue().length === 0) {
      table.table.removeChild(table.thead)
    }

    let schemaItems = getSchemaItems(this.instance.schema)

    if (this.instance.jedison.refParser) {
      schemaItems = this.instance.jedison.refParser.expand(schemaItems)
    }
    const itemProperties = getSchemaProperties(schemaItems)

    Object.values(itemProperties).forEach((propertySchema) => {
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
          this.theme.infoAsModal(info, this.getIdFromPath(this.instance.path), infoContent)
        }

        th.appendChild(info.container)
      }

      table.thead.appendChild(th)
    })

    const arrayDelete = getSchemaXOption(this.instance.schema, 'arrayDelete') ?? this.instance.jedison.options.arrayDelete
    const arrayMove = getSchemaXOption(this.instance.schema, 'arrayMove') ?? this.instance.jedison.options.arrayMove

    // tbody rows
    this.instance.children.forEach((child, index) => {
      const tbodyRow = document.createElement('tr')

      // buttons
      const buttonsTd = this.theme.getTableDefinition()
      const { deleteBtn, moveUpBtn, moveDownBtn, dragBtn, btnGroup } = this.getButtons(index)

      if (this.isSortable()) {
        btnGroup.appendChild(dragBtn)
      }

      if (isSet(arrayDelete) && arrayDelete === true) {
        btnGroup.appendChild(deleteBtn)
      }

      if (isSet(arrayMove) && arrayMove === true) {
        btnGroup.appendChild(moveUpBtn)
        btnGroup.appendChild(moveDownBtn)
      }

      buttonsTd.appendChild(btnGroup)
      tbodyRow.appendChild(buttonsTd)

      // editors
      if (child.children.length) {
        child.children.forEach((grandchild) => {
          const td = this.theme.getTableDefinition()
          grandchild.ui.adaptForTable(td)
          td.appendChild(grandchild.ui.control.container)
          tbodyRow.appendChild(td)
        })
      } else {
        const td = this.theme.getTableDefinition()
        child.ui.adaptForTable(td)
        td.appendChild(child.ui.control.container)
        tbodyRow.appendChild(td)
      }

      table.tbody.appendChild(tbodyRow)
    })

    this.refreshSortable(table.tbody)
    this.refreshAddBtn()
    this.refreshJsonData()
    this.refreshDisabledState()
    this.refreshScrollPosition(table.container)

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

  refreshSortable (container) {
    if (this.isSortable()) {
      if (this.sortable) {
        this.sortable.destroy()
      }

      this.sortable = window.Sortable.create(container, {
        animation: 150,
        handle: '.jedi-array-drag',
        disabled: this.disabled || this.readOnly,
        onEnd: (evt) => {
          this.instance.move(evt.oldIndex, evt.newIndex)
        }
      })
    }
  }
}

export default EditorArrayTableObject
