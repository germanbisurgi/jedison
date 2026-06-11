import Editor from './editor.js'
import {
  getSchemaType,
  getSchemaXOption
} from '../helpers/schema.js'

/**
 * Represents a EditorNull instance.
 * @extends Editor
 */
class EditorNull extends Editor {
  static resolves (schema) {
    return getSchemaType(schema) === 'null'
  }

  build () {
    this.control = this.theme.getNullControl({
      title: this.getTitle(),
      description: this.getDescription(),
      id: this.getIdFromPath(this.instance.path),
      titleIconClass: getSchemaXOption(this.instance.schema, 'titleIconClass'),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden') || getSchemaXOption(this.instance.schema, 'format') === 'hidden',
      info: this.getInfo()
    })
  }

  adaptForHorizontal (labelCol, inputCol) {
    this.theme.adaptForHorizontalInputControl(this.control, labelCol, inputCol)
  }

  sanitize () {
    return null
  }
}

export default EditorNull
