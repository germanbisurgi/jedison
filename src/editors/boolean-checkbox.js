import EditorBoolean from './boolean.js'
import { getSchemaXOption, getSchemaType } from '../helpers/schema.js'

/**
 * Represents a EditorBooleanCheckbox instance.
 * @extends Editor
 */
class EditorBooleanCheckbox extends EditorBoolean {
  static resolves (schema) {
    return getSchemaType(schema) === 'boolean' && getSchemaXOption(schema, 'format') === 'checkbox'
  }

  build () {
    this.control = this.theme.getCheckboxControl({
      title: this.getTitle(),
      description: this.getDescription(),
      id: this.getIdFromPath(this.instance.path),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      titleIconClass: getSchemaXOption(this.instance.schema, 'titleIconClass'),
      info: this.getInfo()
    })
  }

  adaptForTable (td) {
    this.theme.adaptForTableCheckboxControl(this.control, td)
  }

  addEventListeners () {
    this.control.input.addEventListener('change', () => {
      this.instance.setValue(this.control.input.checked, true, 'user')
    })
  }

  sanitize (value) {
    return Boolean(value)
  }

  refreshUI () {
    this.refreshDisabledState()
    this.control.input.checked = this.instance.getValue()
  }
}

export default EditorBooleanCheckbox
