import EditorNumberInput from './number-input.js'
import {
  isArray,
  isNumber,
  isSet
} from '../helpers/utils.js'
import {
  getSchemaXOption,
  getSchemaType
} from '../helpers/schema.js'

/**
 * Represents a EditorNumberInputNullable instance.
 * @extends Editor
 */
class EditorNumberInputNullable extends EditorNumberInput {
  static resolves (schema) {
    const schemaType = getSchemaType(schema)
    const format = getSchemaXOption(schema, 'format')
    return isSet(format) &&
      format === 'number-nullable' &&
      isSet(schemaType) &&
      isArray(schemaType) &&
      schemaType.length === 2 &&
      schemaType.includes('null') &&
      (schemaType.includes('number') || schemaType.includes('integer'))
  }

  addEventListeners () {
    const eventType = this.getValidationEventType()
    this.control.input.addEventListener(eventType, () => {
      const value = this.sanitize(this.control.input.value)
      this.instance.setValue(value, true, 'user')
    })
  }

  sanitize (value) {
    if (value === '') {
      return null
    }

    const schemaType = getSchemaType(this.instance.schema)

    if (schemaType.includes('integer')) {
      return Math.floor(Number(value))
    } else {
      return Number(value)
    }
  }

  refreshUI () {
    super.refreshUI()
    const value = this.instance.getValue()

    if (value === null) {
      this.control.input.value = ''
    }

    if (isNumber(value)) {
      const schemaType = getSchemaType(this.instance.schema)

      if (schemaType.includes('integer')) {
        this.control.input.value = Math.floor(Number(value))
      } else {
        this.control.input.value = value
      }
    }
  }
}

export default EditorNumberInputNullable
