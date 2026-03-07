import Editor from './editor.js'
import { isArray, isSet, notSet } from '../helpers/utils.js'
import { getSchemaAnyOf, getSchemaOneOf, getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents an EditorMultiple instance.
 * @extends Editor
 */
class EditorMultiple extends Editor {
  static resolves (schema) {
    const schemaType = getSchemaType(schema)
    const schemaOneOf = getSchemaOneOf(schema)
    const schemaAnyOf = getSchemaAnyOf(schema)
    return isSet(schemaAnyOf) || isSet(schemaOneOf) || schemaType === 'any' || isArray(schemaType) || notSet(schemaType)
  }

  build () {
    this.switcherInput = getSchemaXOption(this.instance.schema, 'switcherInput') ?? this.instance.jedison.options.switcherInput
    this.embedSwitcher = getSchemaXOption(this.instance.schema, 'embedSwitcher') ?? this.instance.jedison.options.embedSwitcher
    this.control = this.theme.getMultipleControl({
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      id: this.getIdFromPath(this.instance.path),
      switcherOptionValues: this.instance.switcherOptionValues,
      switcherOptionsLabels: this.instance.switcherOptionsLabels,
      switcher: this.switcherInput,
      readOnly: this.instance.isReadOnly()
    })

    if (this.embedSwitcher) {
      this.control.header.style.display = 'none'
    }
  }

  adaptForTable (td) {
    this.theme.adaptForTableMultipleControl(this.control, td)
  }

  addEventListeners () {
    if (this.switcherInput === 'select') {
      this.control.switcher.input.addEventListener('change', () => {
        const index = Number(this.control.switcher.input.value)
        this.instance.switchInstance(index, undefined, 'user')
      })
    }

    if (this.switcherInput === 'radios' || this.switcherInput === 'radios-inline') {
      this.control.switcher.radios.forEach((radio) => {
        radio.addEventListener('change', () => {
          const index = Number(radio.value)
          this.instance.switchInstance(index, undefined, 'user')
        })
      })
    }
  }

  refreshUI () {
    this.refreshDisabledState()
    this.control.childrenSlot.innerHTML = ''
    this.control.childrenSlot.appendChild(this.instance.activeInstance.ui.control.container)

    if (this.embedSwitcher) {
      const slot = this.instance.activeInstance.ui.control.switcherSlot
      if (slot) {
        slot.innerHTML = ''
        slot.appendChild(this.control.switcher.container)
        this.control.header.style.display = 'none'
      } else {
        this.control.header.style.display = ''
        this.control.header.appendChild(this.control.switcher.container)
      }
    }

    if (this.switcherInput === 'select') {
      this.control.switcher.input.value = this.instance.index
    }

    if (this.switcherInput === 'radios' || this.switcherInput === 'radios-inline') {
      this.control.switcher.radios.forEach((radio) => {
        const radioIndex = Number(radio.value)
        radio.checked = radioIndex === this.instance.index
      })
    }

    if (this.disabled || this.instance.isReadOnly()) {
      this.instance.activeInstance.ui.disable()
    } else {
      this.instance.activeInstance.ui.enable()
    }
  }

  getErrorFeedback (config) {
    return this.theme.getAlert(config)
  }
}

export default EditorMultiple
