import EditorString from './string.js'
import { isArray, isObject, isSet, resolveInstancePath } from '../helpers/utils.js'
import { getSchemaEnum, getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents a EditorStringRadios instance.
 * @extends EditorString
 */
class EditorStringRadios extends EditorString {
  static resolves (schema) {
    return getSchemaType(schema) === 'string' && (getSchemaXOption(schema, 'format') === 'radios' || getSchemaXOption(schema, 'format') === 'radios-inline')
  }

  init () {
    super.init()
    this.setupEnumSource()
  }

  setupEnumSource () {
    const enumSourceRaw = getSchemaXOption(this.instance.schema, 'enumSource')
    if (!isSet(enumSourceRaw)) return
    const enumSource = resolveInstancePath(this.instance.path, enumSourceRaw)
    const src = this.instance.jedison.getInstance(enumSource)
    if (src) this.enumSourceValues = src.getValue()
    this.instance.jedison.watch(enumSource, () => {
      if (!this.control) return
      const s = this.instance.jedison.getInstance(enumSource)
      if (s) {
        this.enumSourceValues = s.getValue()
        this.refreshOptions()
      }
    })
  }

  getEnumSourceValues () {
    if (this.enumSourceValues !== undefined) {
      if (isArray(this.enumSourceValues)) return this.enumSourceValues
      if (isObject(this.enumSourceValues)) return Object.keys(this.enumSourceValues)
      return []
    }
    return getSchemaEnum(this.instance.schema) || []
  }

  build () {
    const values = this.getEnumSourceValues()
    this.control = this.theme.getRadiosControl({
      title: this.getTitle(),
      description: this.getDescription(),
      values: values,
      titles: getSchemaXOption(this.instance.schema, 'enumTitles') || values,
      id: this.getIdFromPath(this.instance.path),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      inline: getSchemaXOption(this.instance.schema, 'format') === 'radios-inline',
      info: this.getInfo()
    })
  }

  refreshOptions () {
    const values = this.getEnumSourceValues()
    const titles = getSchemaXOption(this.instance.schema, 'enumTitles') || values
    const id = this.getIdFromPath(this.instance.path)
    const messagesId = id + '-messages'
    const descriptionId = id + '-description'
    const describedBy = messagesId + ' ' + descriptionId

    this.control.radioControls.forEach(rc => {
      if (rc.parentNode) rc.parentNode.removeChild(rc)
    })

    this.control.radios = []
    this.control.labels = []
    this.control.radioControls = []
    this.control.labelTexts = []

    values.forEach((value, index) => {
      const radioControl = document.createElement('div')
      const radio = document.createElement('input')
      const label = document.createElement('label')
      const labelText = document.createElement('span')

      radio.setAttribute('type', 'radio')
      radio.setAttribute('id', id + '-' + index)
      radio.setAttribute('name', id)
      radio.setAttribute('value', value)
      radio.setAttribute('aria-describedby', describedBy)

      label.setAttribute('for', id + '-' + index)
      label.classList.add('jedi-title')
      label.classList.add('jedi-label')

      labelText.textContent = (titles && titles[index] !== undefined) ? titles[index] : value

      radioControl.appendChild(radio)
      radioControl.appendChild(label)
      label.appendChild(labelText)

      this.control.radios.push(radio)
      this.control.labels.push(label)
      this.control.labelTexts.push(labelText)
      this.control.radioControls.push(radioControl)

      this.control.fieldset.insertBefore(radioControl, this.control.description)
    })

    this.addEventListeners()
    this.refreshUI()
  }

  adaptForTable () {
    this.theme.adaptForTableRadiosControl(this.control)
  }

  addEventListeners () {
    this.control.radios.forEach((radio) => {
      radio.addEventListener('change', () => {
        this.instance.setValue(radio.value, true, 'user')
      })
    })
  }

  refreshUI () {
    this.refreshDisabledState()
    this.control.radios.forEach((radio) => {
      radio.checked = (radio.value === this.instance.getValue())
    })
  }

  setAriaInvalid (invalid) {
    this.control.radios.forEach(radio => {
      if (invalid) {
        radio.setAttribute('aria-invalid', 'true')
      } else {
        radio.removeAttribute('aria-invalid')
      }
    })
  }
}

export default EditorStringRadios
