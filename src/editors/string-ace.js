import EditorString from './string.js'
import { isSet } from '../helpers/utils.js'
import { getSchemaType, getSchemaXOption } from '../helpers/schema.js'

class EditorStringAce extends EditorString {
  static resolves (schema) {
    const format = getSchemaXOption(schema, 'format')

    return isSet(format) &&
      format === 'ace' &&
      window.ace &&
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
      const aceOptions = getSchemaXOption(this.instance.schema, 'ace') ?? {}
      const mode = aceOptions.mode || 'text'

      // Create container for Ace editor
      this.aceContainer = document.createElement('div')

      // Apply size configurations
      const height = aceOptions.height || '300px'
      const width = aceOptions.width || '100%'
      const minHeight = aceOptions.minHeight
      const maxHeight = aceOptions.maxHeight
      const minWidth = aceOptions.minWidth
      const maxWidth = aceOptions.maxWidth

      this.aceContainer.style.height = height
      this.aceContainer.style.width = width

      if (minHeight) this.aceContainer.style.minHeight = minHeight
      if (maxHeight) this.aceContainer.style.maxHeight = maxHeight
      if (minWidth) this.aceContainer.style.minWidth = minWidth
      if (maxWidth) this.aceContainer.style.maxWidth = maxWidth

      // Replace textarea with Ace container
      this.control.input.style.display = 'none'
      this.control.input.parentNode.insertBefore(this.aceContainer, this.control.input)

      // Initialize Ace editor
      this.aceEditor = window.ace.edit(this.aceContainer)
      this.aceEditor.setTheme(aceOptions.theme || 'ace/theme/chrome')
      try {
        this.aceEditor.session.setMode(`ace/mode/${mode}`)
      } catch {
        console.warn(`Ace mode "${mode}" not loaded`)
      }

      // Set initial value - ensure it's a string
      const initialValue = this.instance.getValue()
      this.aceEditor.setValue(typeof initialValue === 'string' ? initialValue : '')
      this.aceEditor.clearSelection()
    } catch (e) {
      console.error('Ace editor is not available or not loaded correctly.', e)
    }
  }

  addEventListeners () {
    if (!this.aceEditor) return

    this.aceEditor.on('blur', () => {
      const aceText = this.aceEditor.getValue()
      const currentValue = this.instance.getValue()

      if (aceText !== currentValue) {
        this.instance.setValue(aceText, true, 'user')
      }
    })
  }

  refreshDisabledState () {
    if (this.disabled || this.readOnly) {
      this.aceEditor.setReadOnly(true)
      this.aceContainer.style.opacity = '0.6'
      this.aceContainer.classList.add('ace-disabled')
    } else {
      this.aceEditor.setReadOnly(false)
      this.aceContainer.style.opacity = '1'
      this.aceContainer.classList.remove('ace-disabled')
    }
  }

  refreshUI () {
    super.refreshUI()

    // Ensure we always pass a string to Ace editor
    const value = this.instance.getValue()
    const stringValue = typeof value === 'string' ? value : String(value || '')

    if (this.aceEditor.getValue() !== stringValue) {
      this.aceEditor.setValue(stringValue)
      this.aceEditor.clearSelection()
    }
  }
}

export default EditorStringAce
