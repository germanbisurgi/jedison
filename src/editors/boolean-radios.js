import EditorBoolean from './boolean.js'
import { getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents an EditorRadios instance.
 * @extends EditorBooleanCheckbox
 */
class EditorRadios extends EditorBoolean {
  static resolves (schema) {
    return getSchemaType(schema) === 'boolean' && (getSchemaXOption(schema, 'format') === 'radios' || getSchemaXOption(schema, 'format') === 'radios-inline')
  }

  build () {
    this.control = this.theme.getRadiosControl({
      title: this.getTitle(),
      description: this.getDescription(),
      values: ['false', 'true'],
      titles: getSchemaXOption(this.instance.schema, 'enumTitles') || ['false', 'true'],
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
        const radioValue = radio.value === 'true'
        this.instance.setValue(radioValue, true, 'user')
      })
    })
  }

  refreshUI () {
    this.refreshDisabledState()
    this.control.radios.forEach((radio) => {
      const radioValue = radio.value === 'true'
      radio.checked = radioValue === this.instance.getValue()
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

export default EditorRadios
