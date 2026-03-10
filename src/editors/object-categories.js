import EditorObject from './object.js'
import { isSet, pathToAttribute } from '../helpers/utils.js'
import { getSchemaTitle, getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents a EditorObjectCategories instance.
 * @extends EditorObject
 */
class EditorObjectCategories extends EditorObject {
  static resolves (schema) {
    const format = getSchemaXOption(schema, 'format')
    const regex = /^categories-(horizontal|vertical(?:-\d+)?)$/
    return getSchemaType(schema) === 'object' && regex.test(format)
  }

  init () {
    super.init()
    this.activeCategoryName = null
  }

  navigateTo (path) {
    const nextChildPath = this.getNextChildPath(path)
    if (nextChildPath) {
      const child = this.instance.children.find(c => c.path === nextChildPath)
      if (child) {
        const defaultLabel = getSchemaXOption(this.instance.schema, 'categoriesDefaultLabel') ?? 'Basic'
        const childSchemaType = getSchemaType(child.schema)
        const xCategory = getSchemaXOption(child.schema, 'category')
        let categoryName
        if (isSet(xCategory)) {
          categoryName = xCategory
        } else if (childSchemaType === 'object' || childSchemaType === 'array') {
          const schemaTitle = getSchemaTitle(child.schema)
          categoryName = isSet(schemaTitle) ? schemaTitle : child.getKey()
        } else {
          categoryName = defaultLabel
        }
        this.activeCategoryName = categoryName
        this.refreshUI()
      }
    }
    super.navigateTo(path)
  }

  refreshEditors () {
    while (this.control.childrenSlot.firstChild) {
      this.control.childrenSlot.removeChild(this.control.childrenSlot.lastChild)
    }

    const format = getSchemaXOption(this.instance.schema, 'format')
    const formatParts = format.split('-')
    // format is: categories-horizontal or categories-vertical or categories-vertical-N
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

    const navWarning = getSchemaXOption(this.instance.schema, 'navWarning') ?? true
    const navWarningMessage = getSchemaXOption(this.instance.schema, 'navWarningMessage')
    const defaultLabel = getSchemaXOption(this.instance.schema, 'categoriesDefaultLabel') ?? 'Basic'

    // Build ordered Map<categoryName, { children[], id }>
    const categoriesMap = new Map()

    this.instance.children.forEach((child) => {
      if (!child.isActive) return
      const hidden = getSchemaXOption(child.schema, 'hidden')
      if (isSet(hidden) && hidden === true) return

      const childSchemaType = getSchemaType(child.schema)
      const xCategory = getSchemaXOption(child.schema, 'category')

      let categoryName
      if (isSet(xCategory)) {
        categoryName = xCategory
      } else if (childSchemaType === 'object' || childSchemaType === 'array') {
        const schemaTitle = getSchemaTitle(child.schema)
        categoryName = isSet(schemaTitle) ? schemaTitle : child.getKey()
      } else {
        categoryName = defaultLabel
      }

      if (!categoriesMap.has(categoryName)) {
        categoriesMap.set(categoryName, { children: [], id: pathToAttribute(child.path) })
      }
      categoriesMap.get(categoryName).children.push(child)
    })

    // Resolve active category
    if (!categoriesMap.has(this.activeCategoryName)) {
      this.activeCategoryName = categoriesMap.keys().next().value
    }

    categoriesMap.forEach((category, categoryName) => {
      const active = categoryName === this.activeCategoryName
      const { children, id } = category

      const hasErrors = navWarning && children.some((child) => child.hasNestedValidationErrors())

      const tab = this.theme.getTab({
        hasErrors: hasErrors,
        navWarningMessage: navWarningMessage,
        title: categoryName,
        id: id,
        active: active
      })

      tab.list.addEventListener('click', () => {
        this.activeCategoryName = categoryName
      })

      const pane = document.createElement('div')
      this.theme.setTabPaneAttributes(pane, active, id)

      children.forEach((child) => {
        pane.appendChild(child.ui.control.container)
        if (this.disabled || this.instance.isReadOnly()) {
          child.ui.disable()
        } else {
          child.ui.enable()
        }
      })

      tabList.appendChild(tab.list)
      tabContent.appendChild(pane)
    })
  }
}

export default EditorObjectCategories
