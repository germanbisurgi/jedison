import EditorNumber from './number.js'
import { getSchemaType, getSchemaXOption } from '../helpers/schema.js'
import { isSet } from '../helpers/utils.js'

/**
 * Represents a EditorNumberIMask instance.
 * @extends EditorString
 */
class EditorNumberIMask extends EditorNumber {
  static resolves (schema) {
    const schemaType = getSchemaType(schema)
    const imaskAvailable = window.IMask
    const format = getSchemaXOption(schema, 'format')

    return isSet(format) &&
      format === 'imask' &&
      schemaType === 'number' &&
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
      const imaskOptions = {
        mask: Number,
        ...schemaImask,
        ...settings
      }
      this.imask = window.IMask(this.control.input, imaskOptions)
      this.useMaskedValue = schemaImask['x-masked'] ?? false
    } catch (e) {
      console.error('IMask is not available or not loaded or configured correctly.', e)
    }
  }

  addEventListeners () {
    this.imask.on('accept', () => {
      const value = this.imask.typedValue
      this.instance.setValue(value, true, 'user')
    })
  }

  refreshUI () {
    this.refreshDisabledState()
    const val = this.instance.getValue()
    this.imask.value = val != null ? String(val) : ''
  }

  destroy () {
    this.imask.destroy()
    super.destroy()
  }
}

export default EditorNumberIMask
