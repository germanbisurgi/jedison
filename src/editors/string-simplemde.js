import EditorString from './string.js'
import { clone, isSet } from '../helpers/utils.js'
import { getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents a EditorStringSimpleMDE instance.
 * @extends EditorString
 */
class EditorStringSimpleMDE extends EditorString {
  static resolves (schema) {
    const format = getSchemaXOption(schema, 'format')

    return isSet(format) &&
      format === 'simplemde' &&
      window.SimpleMDE &&
      getSchemaType(schema) === 'string'
  }

  build () {
    this.control = this.theme.getTextareaControl({
      title: this.getTitle(),
      description: this.getDescription(),
      id: this.getIdFromPath(this.instance.path),
      titleIconClass: getSchemaXOption(this.instance.schema, 'titleIconClass'),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      info: this.getInfo()
    })

    try {
      const simplemdeOptions = clone(getSchemaXOption(this.instance.schema, 'simplemde') ?? {})
      simplemdeOptions.element = this.control.input
      this.simplemde = new window.SimpleMDE(simplemdeOptions)
    } catch (e) {
      console.error('simpleMDE is not available or not loaded correctly.', e)
    }
  }

  addEventListeners () {
    this.simplemde.codemirror.on('blur', () => {
      const mdeText = this.simplemde.value()

      if (mdeText !== this.instance.getValue()) {
        this.instance.setValue(mdeText, true, 'user')
      }
    })
  }

  refreshDisabledState () {
    if (this.disabled || this.readOnly) {
      if (!this.simplemde.isPreviewActive()) {
        this.simplemde.togglePreview()
        this.control.container.querySelector('.editor-toolbar').style.display = 'none'
      }
    } else {
      if (this.simplemde.isPreviewActive()) {
        this.simplemde.togglePreview()
        this.control.container.querySelector('.editor-toolbar').style.display = 'block'
      }
    }
  }

  refreshUI () {
    super.refreshUI()
    this.simplemde.value(this.instance.getValue())
  }

  destroy () {
    if (this.aceEditor) {
      this.aceEditor.destroy()
      this.aceEditor.container.remove()
    }

    super.destroy()
  }
}

export default EditorStringSimpleMDE
