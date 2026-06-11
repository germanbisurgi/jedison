import EditorString from './string.js'
import { isSet } from '../helpers/utils.js'
import { getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents a EditorStringFlatpickr instance.
 * @extends EditorString
 */
class EditorStringFlatpickr extends EditorString {
  static resolves (schema) {
    const format = getSchemaXOption(schema, 'format')
    return isSet(format) &&
      format === 'flatpickr' &&
      window.flatpickr &&
      getSchemaType(schema) === 'string'
  }

  build () {
    this.control = this.theme.getInputControl({
      title: this.getTitle(),
      description: this.getDescription(),
      type: 'text',
      id: this.getIdFromPath(this.instance.path),
      titleIconClass: getSchemaXOption(this.instance.schema, 'titleIconClass'),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      info: this.getInfo()
    })

    try {
      const flatpickrOptions = getSchemaXOption(this.instance.schema, 'flatpickr') ?? {}
      this.flatpickr = window.flatpickr(this.control.input, flatpickrOptions)
    } catch (e) {
      console.error('Flatpickr is not available or not loaded correctly.', e)
    }
  }

  adaptForHorizontal (labelCol, inputCol) {
    this.theme.adaptForHorizontalInputControl(this.control, labelCol, inputCol)
  }

  addEventListeners () {
    this.control.input.addEventListener('change', () => {
      this.instance.setValue(this.control.input.value, true, 'user')
    })
  }

  refreshUI () {
    this.refreshDisabledState()
    this.flatpickr.setDate(this.instance.getValue())
  }

  destroy () {
    this.flatpickr.destroy()
    super.destroy()
  }
}

export default EditorStringFlatpickr
