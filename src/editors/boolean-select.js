import EditorBoolean from './boolean.js'
import { getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents an EditorBooleanSelect instance.
 * @extends EditorBooleanCheckbox
 */
class EditorBooleanSelect extends EditorBoolean {
  static resolves (schema) {
    return getSchemaType(schema) === 'boolean'
  }

  build () {
    this.control = this.theme.getSelectControl({
      title: this.getTitle(),
      description: this.getDescription(),
      values: ['false', 'true'],
      titles: getSchemaXOption(this.instance.schema, 'enumTitles') || ['false', 'true'],
      id: this.getIdFromPath(this.instance.path),
      titleIconClass: getSchemaXOption(this.instance.schema, 'titleIconClass'),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      info: this.getInfo()
    })
  }

  adaptForTable () {
    this.theme.adaptForTableSelectControl(this.control)
  }

  adaptForHorizontal (labelCol, inputCol) {
    this.theme.adaptForHorizontalSelectControl(this.control, labelCol, inputCol)
  }

  addEventListeners () {
    this.control.input.addEventListener('change', () => {
      const value = this.control.input.value === 'true'
      this.instance.setValue(value, true, 'user')
    })
  }

  refreshUI () {
    this.refreshDisabledState()
    this.control.input.value = this.instance.getValue() === true ? 'true' : 'false'
  }
}

export default EditorBooleanSelect
