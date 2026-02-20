import EditorObject from './object.js'
import { isSet, pathToAttribute } from '../helpers/utils.js'
import { getSchemaTitle, getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents a EditorObjectNav instance.
 * @extends EditorObject
 */
class EditorObjectNav extends EditorObject {
  static resolves (schema) {
    const format = getSchemaXOption(schema, 'format')
    const regex = /^nav-(horizontal|vertical(?:-\d+)?)$/
    const hasNavFormat = regex.test(format)
    return getSchemaType(schema) === 'object' && hasNavFormat
  }

  init () {
    super.init()
    this.activeTabIndex = 0
  }

  refreshEditors () {
    while (this.control.childrenSlot.firstChild) {
      this.control.childrenSlot.removeChild(this.control.childrenSlot.lastChild)
    }

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

    this.control.childrenSlot.appendChild(row)
    row.appendChild(tabListCol)
    row.appendChild(tabContentCol)
    tabListCol.appendChild(tabList)
    tabContentCol.appendChild(tabContent)

    this.instance.children.forEach((child, index) => {
      if (child.isActive) {
        const active = index === this.activeTabIndex
        const id = pathToAttribute(child.path)
        const schemaTitle = getSchemaTitle(child.schema)

        const navWarning = getSchemaXOption(this.instance.schema, 'navWarning') ?? true
        const navWarningMessage = getSchemaXOption(this.instance.schema, 'navWarningMessage')

        const tab = this.theme.getTab({
          hasErrors: navWarning && child.hasNestedValidationErrors(),
          navWarningMessage: navWarningMessage,
          title: isSet(schemaTitle) ? schemaTitle : child.getKey(),
          id: id,
          active: active
        })

        tab.list.addEventListener('click', () => {
          this.activeTabIndex = index
        })

        this.theme.setTabPaneAttributes(child.ui.control.container, active, id)

        tabList.appendChild(tab.list)
        tabContent.appendChild(child.ui.control.container)

        if (this.disabled || this.instance.isReadOnly()) {
          child.ui.disable()
        } else {
          child.ui.enable()
        }
      }
    })
  }
}

export default EditorObjectNav
