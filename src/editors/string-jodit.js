import EditorString from './string.js'
import { isSet } from '../helpers/utils.js'
import { getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents a EditorStringQuill instance.
 * @extends EditorString
 */
class EditorStringJodit extends EditorString {
  static resolves (schema) {
    const format = getSchemaXOption(schema, 'format')

    return isSet(format) &&
      format === 'jodit' &&
      window.Jodit &&
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
      const joditDefaultOptions = {
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false,
        toolbarAdaptive: false,
        buttons: [
          'bold',
          'italic',
          'underline',
          'strikethrough',
          '|',
          'ul',
          'ol',
          '|',
          'link',
          '|',
          'source',
          'preview'
        ]
      }

      const joditSchemaOptions = getSchemaXOption(this.instance.schema, 'jodit') ?? {}

      const joditOptions = Object.assign({}, joditDefaultOptions, joditSchemaOptions)

      this.jodit = window.Jodit.make(this.control.input, joditOptions)
    } catch (e) {
      console.error('Jodit is not available or not loaded correctly.', e)
    }
  }

  addEventListeners () {
    this.jodit.events.on('change', () => {
      const joditValue = this.jodit.value

      if (joditValue !== this.instance.getValue()) {
        // Save selection before triggering parent refresh which may remove or re adding DOM
        const savedSelection = this.jodit.selection.save()
        this.instance.setValue(joditValue, true, 'user')
        // Restore focus after DOM manipulation completes
        this.jodit.selection.restore(savedSelection)
      }
    })
  }

  refreshDisabledState () {
    if (this.disabled || this.readOnly) {
      this.jodit.setReadOnly(true)
    } else {
      this.jodit.setReadOnly(false)
    }
  }

  refreshUI () {
    super.refreshUI()
    const joditInstanceValue = this.instance.getValue()
    if (this.jodit.value !== joditInstanceValue) {
      this.jodit.value = joditInstanceValue
    }
  }

  destroy () {
    this.jodit.destruct()
    super.destroy()
  }
}

export default EditorStringJodit
