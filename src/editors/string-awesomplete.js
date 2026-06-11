import EditorString from './string.js'
import { isSet } from '../helpers/utils.js'
import { getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents a EditorStringAwesomplete instance.
 * @extends EditorString
 */
class EditorStringAwesomplete extends EditorString {
  static resolves (schema) {
    const format = getSchemaXOption(schema, 'format')

    return isSet(format) &&
      format === 'awesomplete' &&
      window.Awesomplete &&
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
      const awesompleteOptions = getSchemaXOption(this.instance.schema, 'awesomplete') ?? {}
      this.awesomplete = new window.Awesomplete(this.control.input, awesompleteOptions)
      this.control.container.querySelector('.awesomplete').style.display = 'block'
    } catch (e) {
      console.error('Awesomplete is not available or not loaded correctly.', e)
    }
  }

  adaptForHorizontal (labelCol, inputCol) {
    this.theme.adaptForHorizontalInputControl(this.control, labelCol, inputCol)
  }

  addEventListeners () {
    this.control.input.addEventListener('awesomplete-selectcomplete', () => {
      this.instance.setValue(this.control.input.value, true, 'user')
    })
  }

  refreshUI () {
    this.refreshDisabledState()
    this.control.input.value = this.instance.getValue()
  }

  destroy () {
    this.awesomplete.destroy()
    super.destroy()
  }
}

export default EditorStringAwesomplete
