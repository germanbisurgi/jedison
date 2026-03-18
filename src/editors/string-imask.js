import EditorString from './string.js'
import { getSchemaType, getSchemaXOption } from '../helpers/schema.js'
import { isSet } from '../helpers/utils.js'

/**
 * Represents a EditorStringIMask instance.
 * @extends EditorString
 */
class EditorStringIMask extends EditorString {
  static resolves (schema) {
    const hasSchemaTypeString = getSchemaType(schema) === 'string'
    const imaskAvailable = window.IMask
    const format = getSchemaXOption(schema, 'format')

    return isSet(format) &&
      format === 'imask' &&
      hasSchemaTypeString &&
      imaskAvailable
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
      const schemaImask = getSchemaXOption(this.instance.schema, 'imask') ?? {}
      const schemaImaskSettings = schemaImask['x-settings']
      const settings = schemaImaskSettings && this.instance.jedison.getOption('settings')[schemaImaskSettings] ? this.instance.jedison.getOption('settings')[schemaImaskSettings] : {}
      const imaskOptions = { ...schemaImask, ...settings }
      this.imask = window.IMask(this.control.input, imaskOptions)
      this.useMaskedValue = schemaImask['x-masked'] ?? false
    } catch (e) {
      console.error('IMask is not available or not loaded or configured correctly.', e)
    }
  }

  addEventListeners () {
    this.imask.on('accept', () => {
      const value = this.useMaskedValue ? this.imask.value : this.imask.unmaskedValue
      this.instance.setValue(value, true, 'user')
    })
  }

  refreshUI () {
    this.refreshDisabledState()
    this.imask.value = this.instance.getValue()
  }

  destroy () {
    this.imask.destroy()
    super.destroy()
  }
}

export default EditorStringIMask
