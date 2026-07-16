import EditorObject from './object.js'
import { isSet } from '../helpers/utils.js'
import { getSchemaTitle, getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents a EditorObjectAccordion instance.
 * Renders each child property wrapped in an accordion item,
 * making the object's childrenSlot the accordion container.
 * @extends EditorObject
 */
class EditorObjectAccordion extends EditorObject {
  static resolves (schema) {
    return getSchemaType(schema) === 'object' && getSchemaXOption(schema, 'format') === 'accordion'
  }

  static providesChildHeading () {
    return true
  }

  getObjectControlConfig () {
    return { ...super.getObjectControlConfig(), isAccordionProperties: true }
  }

  refreshAccordionWarnings () {
    if (!this.accordionToggles) return
    const navWarning = getSchemaXOption(this.instance.schema, 'navWarning') ?? true
    const navWarningMessage = getSchemaXOption(this.instance.schema, 'navWarningMessage')

    this.instance.children.forEach((child) => {
      if (!child.isActive) return
      const toggle = this.accordionToggles[child.getKey()]
      if (!toggle) return

      const existing = toggle.querySelector('.jedi-legend-warning')
      if (existing) existing.parentNode.removeChild(existing)

      if (navWarning && child.hasNestedValidationErrors()) {
        const warning = document.createElement('span')
        warning.classList.add('jedi-legend-warning')
        warning.textContent = '⚠'
        if (navWarningMessage) warning.setAttribute('title', navWarningMessage)
        this.theme.styleLegendWarning(warning)
        toggle.appendChild(warning)
      }
    })
  }

  refreshEditors () {
    this.control.childrenSlot.replaceChildren()
    this.accordionToggles = {}
    const accordionId = this.control.childrenSlot.id

    this.instance.children.forEach((child) => {
      if (!child.isActive) return

      const schemaTitle = getSchemaTitle(child.schema)
      const title = isSet(schemaTitle) ? schemaTitle : child.getKey()
      const id = this.getIdFromPath(child.path)

      const accordionItem = this.theme.getAccordionItem({ title, id, accordionId })
      accordionItem.body.appendChild(child.ui.control.container)
      this.control.childrenSlot.appendChild(accordionItem.container)
      this.accordionToggles[child.getKey()] = accordionItem.toggle

      if (this.disabled || this.instance.isReadOnly()) {
        child.ui.disable()
      } else {
        child.ui.enable()
      }
    })

    this.refreshAccordionWarnings()
  }

  showValidationErrors (errors, force = false) {
    super.showValidationErrors(errors, force)
    this.refreshAccordionWarnings()
  }
}

export default EditorObjectAccordion
