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

  getObjectControlConfig () {
    return { ...super.getObjectControlConfig(), isAccordionProperties: true }
  }

  refreshEditors () {
    this.control.childrenSlot.replaceChildren()
    const accordionId = this.control.childrenSlot.id

    this.instance.children.forEach((child) => {
      if (!child.isActive) return

      const schemaTitle = getSchemaTitle(child.schema)
      const title = isSet(schemaTitle) ? schemaTitle : child.getKey()
      const id = this.getIdFromPath(child.path)

      const accordionItem = this.theme.getAccordionItem({ title, id, accordionId })
      accordionItem.body.appendChild(child.ui.control.container)
      this.control.childrenSlot.appendChild(accordionItem.container)

      if (this.disabled || this.instance.isReadOnly()) {
        child.ui.disable()
      } else {
        child.ui.enable()
      }
    })
  }
}

export default EditorObjectAccordion
