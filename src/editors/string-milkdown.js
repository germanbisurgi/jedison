import EditorString from './string.js'
import { isSet } from '../helpers/utils.js'
import { getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents a EditorStringMilkdown instance.
 * @extends EditorString
 */
class EditorStringMilkdown extends EditorString {
  static resolves (schema) {
    const format = getSchemaXOption(schema, 'format')

    return isSet(format) &&
      format === 'milkdown' &&
      window.Milkdown &&
      window.Milkdown.Crepe &&
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

    this.mounted = false

    try {
      const milkdownOptions = getSchemaXOption(this.instance.schema, 'milkdown') ?? {}
      const { Crepe } = window.Milkdown

      this.crepe = new Crepe({
        ...milkdownOptions,
        root: this.control.placeholder,
        defaultValue: this.instance.getValue() ?? ''
      })

      this.crepe.on((api) => {
        api.markdownUpdated((ctx, markdown) => {
          if (markdown !== this.instance.getValue()) {
            this.syncingFromEditor = true
            this.instance.setValue(markdown, true, 'user')
            this.syncingFromEditor = false
          }
        })
      })

      this.crepe.create()
        .then(() => {
          this.mounted = true
          this.refreshDisabledState()
        })
        .catch((e) => console.error('Milkdown failed to mount.', e))
    } catch (e) {
      console.error('Milkdown is not available or not loaded correctly.', e)
    }
  }

  adaptForHorizontal (labelCol, inputCol) {
    this.theme.adaptForHorizontalInputControl(this.control, labelCol, inputCol)
  }

  addEventListeners () {}

  refreshDisabledState () {
    if (this.crepe && this.mounted) {
      this.crepe.setReadonly(this.disabled || this.readOnly)
    }
  }

  refreshUI () {
    super.refreshUI()

    if (!this.crepe || !this.mounted || this.syncingFromEditor) {
      return
    }

    const value = this.instance.getValue() ?? ''

    if (value !== this.crepe.getMarkdown()) {
      try {
        const { replaceAll } = window.Milkdown
        this.crepe.editor.action(replaceAll(value))
      } catch (e) {
        console.error('Milkdown could not apply the updated value.', e)
      }
    }
  }

  destroy () {
    if (this.crepe) {
      this.crepe.destroy().catch(() => {})
    }

    super.destroy()
  }
}

export default EditorStringMilkdown
