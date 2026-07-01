import Editor from './editor.js'
import { equal, isSet } from '../helpers/utils.js'
import { getSchemaEnum, getSchemaType, getSchemaXOption } from '../helpers/schema.js'

class EditorObjectRadios extends Editor {
  static resolves (schema) {
    const format = getSchemaXOption(schema, 'format')
    return getSchemaType(schema) === 'object' &&
      (format === 'radios' || format === 'radios-inline') &&
      isSet(getSchemaEnum(schema))
  }

  build () {
    const enumValues = getSchemaEnum(this.instance.schema)
    const enumTitles = getSchemaXOption(this.instance.schema, 'enumTitles') ||
      enumValues.map(v => JSON.stringify(v))
    const inline = getSchemaXOption(this.instance.schema, 'format') === 'radios-inline'

    this.control = this.theme.getRadiosControl({
      title: this.getTitle(),
      description: this.getDescription(),
      values: enumTitles,
      titles: enumTitles,
      id: this.getIdFromPath(this.instance.path),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      inline: inline,
      info: this.getInfo()
    })

    this.control.radios.forEach((radio, index) => {
      radio._enumValue = enumValues[index]
    })
  }

  addEventListeners () {
    this.control.radios.forEach((radio) => {
      radio.addEventListener('change', () => {
        this.instance.setValue(radio._enumValue, true, 'user')
      })
    })
  }

  refreshUI () {
    this.refreshDisabledState()
    const currentValue = this.instance.getValue()
    this.control.radios.forEach((radio) => {
      radio.checked = equal(radio._enumValue, currentValue)
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

  adaptForTable () {
    this.theme.adaptForTableRadiosControl(this.control)
  }

  adaptForHorizontal (labelCol, inputCol) {
    this.theme.adaptForHorizontalRadiosControl(this.control, labelCol, inputCol)
  }
}

export default EditorObjectRadios
