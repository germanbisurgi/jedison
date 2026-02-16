import EditorString from './string.js'
import { isSet } from '../helpers/utils.js'
import { getSchemaXOption, getSchemaType, getSchemaMinLength, getSchemaMaxLength } from '../helpers/schema.js'

/**
 * Represents a EditorStringTextarea instance.
 * @extends EditorString
 */
class EditorStringTextarea extends EditorString {
  static resolves (schema) {
    return getSchemaType(schema) === 'string' && getSchemaXOption(schema, 'format') === 'textarea'
  }

  build () {
    this.control = this.theme.getTextareaControl({
      title: this.getTitle(),
      description: this.getDescription(),
      id: this.getIdFromPath(this.instance.path),
      titleIconClass: getSchemaXOption(this.instance.schema, 'titleIconClass'),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      info: this.getInfo()
    })

    const useConstraintAttributes = getSchemaXOption(this.instance.schema, 'useConstraintAttributes') ?? this.instance.jedison.options.useConstraintAttributes

    if (useConstraintAttributes === true) {
      const schemaMinLength = getSchemaMinLength(this.instance.schema)
      const schemaMaxLength = getSchemaMaxLength(this.instance.schema)

      if (isSet(schemaMinLength)) {
        this.control.input.setAttribute('minlength', schemaMinLength)
      }

      if (isSet(schemaMaxLength)) {
        this.control.input.setAttribute('maxlength', schemaMaxLength)
      }
    }
  }

  adaptForTable () {
    this.theme.adaptForTableTextareaControl(this.control)
  }

  addEventListeners () {
    const eventType = this.getValidationEventType()
    this.control.input.addEventListener(eventType, () => {
      this.instance.setValue(this.control.input.value, true, 'user')
    })
  }

  refreshUI () {
    this.refreshDisabledState()
    this.control.input.value = this.instance.getValue()
  }
}

export default EditorStringTextarea
