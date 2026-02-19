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
    this.control = this.theme.getMultipleControl({
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      id: this.getIdFromPath(this.instance.path),
      switcherOptionValues: this.instance.switcherOptionValues,
      switcherOptionsLabels: this.instance.switcherOptionsLabels,
      switcher: this.switcherInput,
      readOnly: this.instance.isReadOnly()
    })
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
