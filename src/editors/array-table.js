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

    this.addJsonDataEventListeners()
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

    // table header

    if (this.instance.children.length) {
      const schemaItems = getSchemaItems(this.instance.schema)

      const thTitle = this.theme.getTableHeader()

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
          this.theme.infoAsModal(info, this.getIdFromPath(this.instance.path), infoContent)
        }

        thTitle.appendChild(info.container)
      }

      table.thead.appendChild(thTitle)
    }

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

      // child
      const td = this.theme.getTableDefinition()
      child.ui.adaptForTable(child, td)
      td.appendChild(child.ui.control.container)
      tbodyRow.appendChild(td)

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

export default EditorArrayTable
