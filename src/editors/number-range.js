import EditorNumber from './number.js'
import { getSchemaXOption, getSchemaType } from '../helpers/schema.js'
import { isSet } from '../helpers/utils.js'

/**
 * Represents an EditorNumberRange instance.
 * @extends EditorNumber
 */
class EditorNumberRange extends EditorNumber {
  static resolves (schema) {
    const schemaType = getSchemaType(schema)
    const isNumericType = schemaType === 'number' || schemaType === 'integer'

    if (!isNumericType) {
      return false
    }

    // Check for explicit range format
    if (getSchemaXOption(schema, 'format') === 'range') {
      return true
    }

    // Check for min/max constraints (including exclusive variants)
    const hasMin = isSet(schema.minimum) || isSet(schema.exclusiveMinimum)
    const hasMax = isSet(schema.maximum) || isSet(schema.exclusiveMaximum)

    return hasMin && hasMax
  }

  build () {
    // Get min/max from schema constraints
    let optionMin = 0
    let optionMax = 100

    if (isSet(this.instance.schema.minimum)) {
      optionMin = this.instance.schema.minimum
    } else if (isSet(this.instance.schema.exclusiveMinimum)) {
      optionMin = this.instance.schema.exclusiveMinimum + 0.01
    }

    if (isSet(this.instance.schema.maximum)) {
      optionMax = this.instance.schema.maximum
    } else if (isSet(this.instance.schema.exclusiveMaximum)) {
      optionMax = this.instance.schema.exclusiveMaximum - 0.01
    }

    // Determine step based on type and multipleOf
    let optionStep
    const schemaType = getSchemaType(this.instance.schema)
    const multipleOf = this.instance.schema.multipleOf

    if (isSet(multipleOf)) {
      optionStep = multipleOf
    } else if (schemaType === 'integer') {
      optionStep = 1
    } else {
      optionStep = 0.01
    }

    this.control = this.theme.getInputRangeControl({
      title: this.getTitle(),
      description: this.getDescription(),
      type: 'range',
      id: this.getIdFromPath(this.instance.path),
      titleIconClass: getSchemaXOption(this.instance.schema, 'titleIconClass'),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      info: this.getInfo()
    })

    // Set range-specific attributes
    this.control.input.setAttribute('min', optionMin)
    this.control.input.setAttribute('max', optionMax)
    this.control.input.setAttribute('step', optionStep)

    // Apply x-inputAttributes if provided
    const inputAttributes = getSchemaXOption(this.instance.schema, 'inputAttributes')
    if (inputAttributes && typeof inputAttributes === 'object') {
      Object.keys(inputAttributes).forEach(attr => {
        this.control.input.setAttribute(attr, inputAttributes[attr])
      })
    }

    // Set initial value for output
    const currentValue = this.instance.getValue()
    this.control.output.textContent = currentValue !== undefined ? currentValue : optionMin
  }

  adaptForTable () {
    this.theme.adaptForTableInputControl(this.control)
  }

  addEventListeners () {
    // Update output on input
    this.control.input.addEventListener('input', () => {
      this.control.output.textContent = parseFloat(this.control.input.value)
    })

    // Update value on change
    this.control.input.addEventListener('change', () => {
      const value = parseFloat(this.control.input.value)
      this.control.output.textContent = value
      this.instance.setValue(value, true, 'user')
    })
  }

  sanitize (value) {
    const schemaType = getSchemaType(this.instance.schema)
    const numValue = Number(value)

    if (schemaType === 'integer') {
      return Math.round(numValue)
    }

    return numValue
  }

  refreshUI () {
    super.refreshUI()
    const currentValue = this.instance.getValue()
    this.control.input.value = currentValue !== undefined ? currentValue : 0
    if (this.control.output) {
      this.control.output.textContent = currentValue !== undefined ? currentValue : 0
    }
  }
}

export default EditorNumberRange
