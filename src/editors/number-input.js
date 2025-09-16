import EditorNumber from './number.js'
import { isNumber, isSet } from '../helpers/utils.js'
import {
  getSchemaXOption,
  getSchemaType, getSchemaMinimum, getSchemaMaximum
} from '../helpers/schema.js'

/**
 * Represents a EditorNumber instance.
 * @extends EditorNumber
 */
class EditorNumberInput extends EditorNumber {
  static resolves (schema) {
    const schemaType = getSchemaType(schema)
    return schemaType === 'number' || schemaType === 'integer'
  }

  build () {
    this.control = this.theme.getInputControl({
      title: this.getTitle(),
      description: this.getDescription(),
      type: 'number',
      id: this.getIdFromPath(this.instance.path),
      titleIconClass: getSchemaXOption(this.instance.schema, 'titleIconClass'),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden') || getSchemaXOption(this.instance.schema, 'format') === 'hidden',
      info: this.getInfo()
    })

    this.control.input.setAttribute('step', 'any')

    const useConstraintAttributes = getSchemaXOption(this.instance.schema, 'useConstraintAttributes') ?? this.instance.jedison.options.useConstraintAttributes

    if (useConstraintAttributes === true) {
      const schemaMinimum = getSchemaMinimum(this.instance.schema)
      const schemaMaximum = getSchemaMaximum(this.instance.schema)

      if (isSet(schemaMinimum)) {
        this.control.input.setAttribute('min', schemaMinimum)
      }

      if (isSet(schemaMaximum)) {
        this.control.input.setAttribute('max', schemaMaximum)
      }
    }
  }

  adaptForTable () {
    this.theme.adaptForTableInputControl(this.control)
  }

  addEventListeners () {
    const eventType = this.getValidationEventType()
    this.control.input.addEventListener(eventType, () => {
      const value = this.sanitize(this.control.input.value)
      this.instance.setValue(value, true, 'user')
    })

    this.control.input.addEventListener('focus', () => {
      if (this.control.input.value === '0') {
        this.control.input.value = this.instance.getValue().toString()
      }
    })

    this.control.input.addEventListener('blur', () => {
      this.refreshUI()
    })
  }

  refreshUI () {
    super.refreshUI()
    const value = this.instance.getValue()

    if (isNumber(value)) {
      this.control.input.value = value
    }
  }
}

export default EditorNumberInput
