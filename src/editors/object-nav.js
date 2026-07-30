import EditorObject from './object.js'
import { isSet } from '../helpers/utils.js'
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

  static providesChildHeading () {
    return true
  }

  init () {
    super.init()
    this.activeTabIndex = 0
    // Tab elements are cached by child path and reused across refreshes so a
    // re-render never tears down the tab a user may be clicking (issue #65).
    this.navTabs = new Map()
  }

  // Persisted so the tab survives an if/then/else branch swap (issue #65).
  setActiveTabIndex (index) {
    this.activeTabIndex = index
    this.setPersistentState('activeTab', index)
  }

  isChildVisible (child) {
    if (!child.isActive) return false
    const hidden = getSchemaXOption(child.schema, 'hidden')
    return !(isSet(hidden) && hidden === true)
  }

  getVisibleChildIndices () {
    return this.instance.children.reduce((indices, child, index) => {
      if (this.isChildVisible(child)) indices.push(index)
      return indices
    }, [])
  }

  ensureActiveTabIsVisible (visibleIndices) {
    if (!visibleIndices.includes(this.activeTabIndex)) {
      this.setActiveTabIndex(visibleIndices[0] ?? 0)
    }
  }

  navigateTo (path) {
    const nextChildPath = this.getNextChildPath(path)
    if (nextChildPath) {
      const childIndex = this.instance.children.findIndex(c => c.path === nextChildPath)
      if (childIndex !== -1) {
        this.setActiveTabIndex(childIndex)
        this.refreshUI()
      }
    }
    super.navigateTo(path)
  }

  buildNavShell () {
    const format = getSchemaXOption(this.instance.schema, 'format')
    const formatParts = format.split('-')
    const variant = formatParts[1]
    const columns = formatParts[2]
    const navColumns = variant === 'horizontal' ? 12 : columns ?? 4
    const row = this.theme.getRow()
    const tabListCol = this.theme.getCol(12, 12, navColumns, navColumns)
    const tabContentCol = this.theme.getCol(12, 12, (12 - navColumns), (12 - navColumns))

    this.navTabContent = this.theme.getTabContent()
    this.navTabList = this.theme.getTabList({ variant: variant })

    row.appendChild(tabListCol)
    row.appendChild(tabContentCol)
    tabListCol.appendChild(this.navTabList)
    tabContentCol.appendChild(this.navTabContent)
    this.control.childrenSlot.appendChild(row)
  }

  createTab (child) {
    const tab = this.theme.getTab({
      title: this.getChildTitle(child),
      id: this.getIdFromPath(child.path)
    })

    // Resolve the index at click time so reordering can't stale it.
    tab.list.addEventListener('click', () => {
      this.setActiveTabIndex(this.instance.children.indexOf(child))
    })

    return tab
  }

  getChildTitle (child) {
    const schemaTitle = getSchemaTitle(child.schema)
    return isSet(schemaTitle) ? schemaTitle : child.getKey()
  }

  updateTab (tab, child, active) {
    tab.list.classList.toggle('active', active)
    tab.link.classList.toggle('active', active)
    tab.text.textContent = this.getChildTitle(child)

    const navWarning = getSchemaXOption(this.instance.schema, 'navWarning') ?? true
    const navWarningMessage = getSchemaXOption(this.instance.schema, 'navWarningMessage')
    const hasErrors = navWarning && child.hasNestedValidationErrors()

    const existing = tab.link.querySelector('.jedi-nav-warning')
    if (existing) existing.parentNode.removeChild(existing)

    if (hasErrors) {
      const warning = document.createElement('span')
      warning.classList.add('jedi-nav-warning')
      warning.textContent = '⚠ '
      tab.link.appendChild(warning)
      if (navWarningMessage) tab.list.setAttribute('title', navWarningMessage)
    } else {
      tab.list.removeAttribute('title')
    }
  }

  refreshEditors () {
    this.activeTabIndex = this.getPersistentState('activeTab', this.activeTabIndex)

    if (!this.navTabContent) this.buildNavShell()

    const visibleIndices = this.getVisibleChildIndices()
    this.ensureActiveTabIsVisible(visibleIndices)

    const currentPaths = new Set(this.instance.children.map((child) => child.path))

    this.instance.children.forEach((child, index) => {
      let tab = this.navTabs.get(child.path)

      if (!this.isChildVisible(child)) {
        if (tab && tab.list.parentNode) tab.list.parentNode.removeChild(tab.list)
        if (child.ui.control.container.parentNode === this.navTabContent) {
          this.navTabContent.removeChild(child.ui.control.container)
        }
        return
      }

      if (!tab) {
        tab = this.createTab(child)
        this.navTabs.set(child.path, tab)
      }

      const active = index === this.activeTabIndex
      this.updateTab(tab, child, active)
      this.theme.setTabPaneAttributes(child.ui.control.container, active, this.getIdFromPath(child.path))

      if (tab.list.parentNode !== this.navTabList) this.navTabList.appendChild(tab.list)
      if (child.ui.control.container.parentNode !== this.navTabContent) {
        this.navTabContent.appendChild(child.ui.control.container)
      }

      if (this.disabled || this.instance.isReadOnly()) {
        child.ui.disable()
      } else {
        child.ui.enable()
      }
    })

    // Drop cached tabs whose child no longer exists (e.g. removed property).
    this.navTabs.forEach((tab, path) => {
      if (!currentPaths.has(path)) {
        if (tab.list.parentNode) tab.list.parentNode.removeChild(tab.list)
        this.navTabs.delete(path)
      }
    })
  }
}

export default EditorObjectNav
