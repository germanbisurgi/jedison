import EditorObject from './object.js'
import { isSet, isArray } from '../helpers/utils.js'
import { getSchemaTitle, getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents a EditorObjectCategories instance.
 * @extends EditorObject
 */
class EditorObjectCategories extends EditorObject {
  static resolves (schema) {
    const format = getSchemaXOption(schema, 'format')
    const regex = /^categories-(horizontal|vertical)$/
    return getSchemaType(schema) === 'object' && regex.test(format)
  }

  init () {
    super.init()
    this.activeCategoryName = null
    this.userSelectedCategory = false
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
        this.userSelectedCategory = true
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
    // format is: categories-horizontal or categories-vertical
    const variant = formatParts[1]
    const navMinWidth = getSchemaXOption(this.instance.schema, 'navMinWidth')
    const navMaxWidth = getSchemaXOption(this.instance.schema, 'navMaxWidth')
    const { row, tabListCol, tabContentCol } = this.theme.getNavRow(variant, { minWidth: navMinWidth, maxWidth: navMaxWidth })
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
        categoriesMap.set(categoryName, { children: [], id: this.getIdFromPath(child.path) })
      }
      categoriesMap.get(categoryName).children.push(child)
    })

    // Sort categories based on x-categoryOrder
    const categoryOrder = getSchemaXOption(this.instance.schema, 'categoryOrder')
    const allNames = Array.from(categoriesMap.keys())

    let orderedCategoryNames = allNames

    if (isSet(categoryOrder) && isArray(categoryOrder)) {
      const specifiedFirst = categoryOrder.filter(name => categoriesMap.has(name))
      const unspecified = allNames.filter(name => !categoryOrder.includes(name))
      orderedCategoryNames = [...specifiedFirst, ...unspecified]
    }

    // Resolve active category (respecting x-categoryOrder, so the first displayed tab is also the default active one).
    // Keep re-deferring to the top of x-categoryOrder until the user explicitly picks a tab, since categories can
    // gain their first active child after the initial render (e.g. once example data finishes loading).
    if (!this.userSelectedCategory || !categoriesMap.has(this.activeCategoryName)) {
      this.activeCategoryName = orderedCategoryNames[0]
    }

    orderedCategoryNames.forEach((categoryName) => {
      const category = categoriesMap.get(categoryName)
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
        this.userSelectedCategory = true
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
