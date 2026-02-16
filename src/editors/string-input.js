import EditorString from './string.js'
import { isSet } from '../helpers/utils.js'
import { getSchemaXOption, getSchemaType, getSchemaMinLength, getSchemaMaxLength, getSchemaPattern } from '../helpers/schema.js'

/**
 * Represents a EditorString instance.
 * @extends Editor
 */
class EditorStringInput extends EditorString {
  static resolves (schema) {
    return getSchemaType(schema) === 'string'
  }

  static getTypes () {
    return ['hidden', 'color', 'date', 'datetime-local', 'email', 'number', 'month', 'password', 'search', 'time', 'tel', 'text', 'url', 'week']
  }

  build () {
    const optionFormat = getSchemaXOption(this.instance.schema, 'format')

    this.control = this.theme.getInputControl({
      title: this.getTitle(),
      description: this.getDescription(),
      type: EditorStringInput.getTypes().includes(optionFormat) ? optionFormat : 'text',
      id: this.getIdFromPath(this.instance.path),
      titleIconClass: getSchemaXOption(this.instance.schema, 'titleIconClass'),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden') || optionFormat === 'hidden',
      info: this.getInfo()
    })

    // fix color picker bug
    if (optionFormat === 'color' && this.instance.value.length === 0) {
      this.instance.setValue('#000000', false, 'user')
    }

    const useConstraintAttributes = getSchemaXOption(this.instance.schema, 'useConstraintAttributes') ?? this.instance.jedison.options.useConstraintAttributes

    if (useConstraintAttributes === true) {
      const schemaMinLength = getSchemaMinLength(this.instance.schema)
      const schemaMaxLength = getSchemaMaxLength(this.instance.schema)
      const schemaPattern = getSchemaPattern(this.instance.schema)

      if (isSet(schemaMinLength)) {
        this.control.input.setAttribute('minlength', schemaMinLength)
      }

      if (isSet(schemaMaxLength)) {
        this.control.input.setAttribute('maxlength', schemaMaxLength)
      }

      if (isSet(schemaPattern)) {
        this.control.input.setAttribute('pattern', schemaPattern)
      }
    }
  }

  adaptForTable () {
    this.theme.adaptForTableInputControl(this.control)
  }

  addEventListeners () {
    const eventType = this.getValidationEventType()
    this.control.input.addEventListener(eventType, () => {
      this.instance.setValue(this.control.input.value, true, 'user')
    })
  }

  sanitize (value) {
    return String(value)
  }

  refreshUI () {
    super.refreshUI()
    this.control.input.value = this.instance.getValue()
  }
}

export default EditorStringInput
