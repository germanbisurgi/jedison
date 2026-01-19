import EditorArray from './array.js'
import { compileTemplate, isSet, pathToAttribute } from '../helpers/utils.js'
import { getSchemaTitle, getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents an EditorArrayNav instance.
 * @extends EditorArray
 */
class EditorArrayNav extends EditorArray {
  static resolves (schema) {
    const format = getSchemaXOption(schema, 'format')
    const regex = /^nav-(horizontal|vertical(?:-\d+)?)$/
    const hasNavFormat = regex.test(format)
    return getSchemaType(schema) === 'array' && hasNavFormat
  }

  addEventListeners () {
    this.control.addBtn.addEventListener('click', () => {
      this.activeItemIndex = this.instance.value.length
      this.instance.addItem('user')
    })

    this.addJsonDataEventListeners()
  }

  refreshUI () {
    this.control.childrenSlot.innerHTML = ''

    this.clearStoredEventListeners()

    const format = getSchemaXOption(this.instance.schema, 'format')
    const formatParts = format.split('-')
    const variant = formatParts[1]
    const columns = formatParts[2]
    const navColumns = variant === 'horizontal' ? 12 : columns ?? 4
    const row = this.theme.getRow()
    const tabListCol = this.theme.getCol(12, 12, navColumns, navColumns)
    const tabContentCol = this.theme.getCol(12, 12, (12 - navColumns), (12 - navColumns))
    const tabContent = this.theme.getTabContent()
    const tabList = this.theme.getTabList({
      variant: variant
    })

    const arrayDelete = getSchemaXOption(this.instance.schema, 'arrayDelete') ?? this.instance.jedison.options.arrayDelete
    const arrayMove = getSchemaXOption(this.instance.schema, 'arrayMove') ?? this.instance.jedison.options.arrayMove

    this.control.childrenSlot.appendChild(row)
    row.appendChild(tabListCol)
    row.appendChild(tabContentCol)
    tabListCol.appendChild(tabList)
    tabContentCol.appendChild(tabContent)

    this.instance.children.forEach((child, index) => {
      const { deleteBtn, moveUpBtn, moveDownBtn, btnGroup } = this.getButtons(index)

      if (isSet(arrayDelete) && arrayDelete === true) {
        btnGroup.appendChild(deleteBtn)
      }

      if (isSet(arrayMove) && arrayMove === true) {
        btnGroup.appendChild(moveUpBtn)
        btnGroup.appendChild(moveDownBtn)
      }

      this.control.childrenSlot.appendChild(child.ui.control.container)
      const schemaTitle = getSchemaTitle(child.schema)

      const childTitle = isSet(schemaTitle) ? schemaTitle + ' ' + (index + 1) : child.getKey()
      let titleTemplate

      const schemaOptionTitleTemplate = getSchemaXOption(this.instance.schema, 'titleTemplate')

      if (schemaOptionTitleTemplate) {
        const template = schemaOptionTitleTemplate
        const data = child.getTemplateData(template)

        titleTemplate = compileTemplate(template, data) ?? childTitle
      }

      const active = index === this.activeItemIndex
      const id = pathToAttribute(child.path)

      const { list, arrayActions } = this.theme.getTab({
        hasErrors: child.children.some((grandChild) => grandChild.ui.showingValidationErrors),
        title: titleTemplate?.length ? titleTemplate : childTitle,
        id: id,
        active: active
      })

      arrayActions.appendChild(btnGroup)

      const clickHandler = () => {
        this.activeItemIndex = index
      }

      list.addEventListener('click', clickHandler)

      // Store listener for cleanup
      this.storedEventListeners.push({
        element: list,
        handler: clickHandler,
        eventType: 'click'
      })

      this.theme.setTabPaneAttributes(child.ui.control.container, active, id)
      tabList.appendChild(list)
      tabContent.appendChild(child.ui.control.container)

      if (this.disabled || this.instance.isReadOnly()) {
        child.ui.disable()
      } else {
        child.ui.enable()
      }

      if (index === 0) {
        moveUpBtn.setAttribute('disabled', '')
      }

      if ((this.instance.value.length - 1) === index) {
        moveDownBtn.setAttribute('disabled', '')
      }
    })

    this.refreshDisabledState()
    this.refreshAddBtn()
    this.refreshJsonData()
  }
}

export default EditorArrayNav
