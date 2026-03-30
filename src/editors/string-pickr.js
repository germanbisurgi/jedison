import EditorString from './string.js'
import { isSet } from '../helpers/utils.js'
import { getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents an EditorStringPickr instance.
 * @extends EditorString
 */
class EditorStringPickr extends EditorString {
  static resolves (schema) {
    const format = getSchemaXOption(schema, 'format')
    return isSet(format) &&
      format === 'pickr' &&
      window.Pickr &&
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

    const pickrOptions = getSchemaXOption(this.instance.schema, 'pickr') ?? {}

    try {
      this.pickr = window.Pickr.create({
        el: this.control.placeholder,
        default: this.instance.getValue() || '#000000',
        comparison: false,
        ...pickrOptions
      })

      const updateValue = (color) => {
        const value = color ? color.toHEXA().toString() : ''
        this.updatingFromPickr = true
        this.instance.setValue(value, true, 'user')
        this.updatingFromPickr = false
      }

      this.pickr.on('change', (color) => {
        updateValue(color)
        this.pickr.applyColor(true)
      })

      this.pickr.on('save', updateValue)
      this.pickr.on('hide', () => updateValue(this.pickr.getColor()))

      this.refreshUI()
    } catch (e) {
      console.error('Pickr is not available or not loaded correctly.', e)
    }
  }

  addEventListeners () {}

  refreshUI () {
    if (!this.pickr) return

    this.refreshTemplates()

    if (this.disabled) {
      this.pickr.disable()
    } else {
      this.pickr.enable()
    }

    if (!this.updatingFromPickr) {
      const value = this.instance.getValue()
      if (value) {
        this.pickr.setColor(value, true)
      }
    }
  }

  destroy () {
    if (this.pickr) {
      this.pickr.destroyAndRemove()
    }
    super.destroy()
  }
}

export default EditorStringPickr
