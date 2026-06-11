import EditorString from './string.js'
import { isSet } from '../helpers/utils.js'
import { getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents a EditorStringQuill instance.
 * @extends EditorString
 */
class EditorStringQuill extends EditorString {
  static resolves (schema) {
    const format = getSchemaXOption(schema, 'format')

    return isSet(format) &&
      format === 'quill' &&
      window.Quill &&
      getSchemaType(schema) === 'string'
  }

  build () {
    this.control = this.theme.getPlaceholderControl({
      title: this.getTitle(),
      description: this.getDescription(),
      id: this.getIdFromPath(this.instance.path),
      titleIconClass: getSchemaXOption(this.instance.schema, 'titleIconClass'),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      info: this.getInfo()
    })

    try {
      const quillOptions = getSchemaXOption(this.instance.schema, 'quill') ?? {}
      this.quill = new window.Quill(this.control.placeholder, quillOptions)
    } catch (e) {
      console.error('Quill is not available or not loaded correctly.', e)
    }
  }

  adaptForHorizontal (labelCol, inputCol) {
    this.theme.adaptForHorizontalInputControl(this.control, labelCol, inputCol)
  }

  addEventListeners () {
    this.quill.root.addEventListener('blur', () => {
      const quillText = this.quill.getText()

      if (quillText !== this.instance.getValue()) {
        this.instance.setValue(quillText, true, 'user')
      }
    })
  }

  refreshDisabledState () {
    if (this.disabled || this.readOnly) {
      this.quill.disable()
    } else {
      this.quill.enable()
    }
  }

  refreshUI () {
    super.refreshUI()
    this.quill.setText(this.instance.getValue())
  }
}

export default EditorStringQuill
