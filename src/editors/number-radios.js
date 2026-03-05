import EditorNumber from './number.js'
import { isSet } from '../helpers/utils.js'
import { getSchemaEnum, getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents an EditorNumberRadios instance.
 * @extends EditorNumber
 */
class EditorNumberRadios extends EditorNumber {
  static resolves (schema) {
    const schemaType = getSchemaType(schema)
    const schemaEnum = getSchemaEnum(schema)
    const optionFormat = getSchemaXOption(schema, 'format')
    const typeIsNumeric = schemaType === 'number' || schemaType === 'integer'
    return typeIsNumeric && isSet(schemaEnum) && (optionFormat === 'radios' || optionFormat === 'radios-inline')
  }

  build () {
    this.control = this.theme.getRadiosControl({
      title: this.getTitle(),
      description: this.getDescription(),
      values: getSchemaEnum(this.instance.schema),
      titles: getSchemaXOption(this.instance.schema, 'enumTitles') || getSchemaEnum(this.instance.schema),
      id: this.getIdFromPath(this.instance.path),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      inline: getSchemaXOption(this.instance.schema, 'format') === 'radios-inline',
      info: this.getInfo()
    })
  }

  adaptForTable () {
    this.theme.adaptForTableRadiosControl(this.control)
  }

  addEventListeners () {
    this.control.radios.forEach((radio) => {
      radio.addEventListener('change', () => {
        const value = this.sanitize(radio.value)
        this.instance.setValue(value, true, 'user')
      })
    })
  }

  refreshUI () {
    this.refreshDisabledState()
    this.control.radios.forEach((radio) => {
      radio.checked = (Number(radio.value) === Number(this.instance.getValue()))
    })
  }

  setAriaInvalid (invalid) {
    this.control.radios.forEach(radio => {
      if (invalid) {
        radio.setAttribute('aria-invalid', 'true')
      } else {
        radio.removeAttribute('aria-invalid')
      }
    })
  }
}

export default EditorNumberRadios
