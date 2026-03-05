import EditorString from './string.js'
import { getSchemaEnum, getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents a EditorStringRadios instance.
 * @extends EditorString
 */
class EditorStringRadios extends EditorString {
  static resolves (schema) {
    return getSchemaType(schema) === 'string' && (getSchemaXOption(schema, 'format') === 'radios' || getSchemaXOption(schema, 'format') === 'radios-inline')
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
        this.instance.setValue(radio.value, true, 'user')
      })
    })
  }

  refreshUI () {
    this.refreshDisabledState()
    this.control.radios.forEach((radio) => {
      radio.checked = (radio.value === this.instance.getValue())
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

export default EditorStringRadios
