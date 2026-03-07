import Editor from './editor.js'
import { isArray, isObject, isSet, resolveInstancePath } from '../helpers/utils.js'
import { getSchemaItems, getSchemaType, getSchemaUniqueItems, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents a EditorArrayChoices instance.
 * @extends EditorString
 */
class EditorArrayChoices extends Editor {
  static resolves (schema) {
    const hasChoicesFormat = getSchemaXOption(schema, 'format') === 'choices'
    const choicesInstalled = window.Choices
    const schemaType = getSchemaType(schema)
    const schemaItems = getSchemaItems(schema)
    const schemaItemsType = isSet(schemaItems) && getSchemaType(schemaItems)
    const isArrayType = isSet(schemaType) && schemaType === 'array'
    const isUniqueItems = getSchemaUniqueItems(schema) === true
    const hasTypes = isSet(schemaItems) && isSet(schemaItemsType)

    const validTypes = ['string', 'number', 'integer']

    const hasValidItemType = isSet(schemaItems) &&
      isSet(schemaItemsType) &&
      (validTypes.includes(schemaItemsType) ||
        (isArray(schemaItemsType) && schemaItemsType.some(type => validTypes.includes(type))))

    return hasChoicesFormat && choicesInstalled && isArrayType && isUniqueItems && hasTypes && hasValidItemType
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
    return (this.instance.schema.items && this.instance.schema.items.enum) || []
  }

  refreshOptions () {
    if (!this.choicesInstance) return
    const values = this.getEnumSourceValues()
    const currentValue = this.instance.getValue()
    const itemEnumTitles = getSchemaXOption(this.instance.schema.items || {}, 'enumTitles') || []
    const choices = values.map((item, index) => ({
      value: item,
      label: itemEnumTitles[index] || item,
      selected: isArray(currentValue) && currentValue.includes(item)
    }))
    this.choicesInstance.setChoices(choices, 'value', 'label', true)
  }

  build () {
    this.control = this.theme.getSelectControl({
      title: this.getTitle(),
      description: this.getDescription(),
      values: [],
      titles: [],
      id: this.getIdFromPath(this.instance.path),
      titleIconClass: getSchemaXOption(this.instance.schema, 'titleIconClass'),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      info: this.getInfo()
    })

    this.control.input.setAttribute('multiple', '')

    try {
      const value = this.instance.getValue()
      const itemEnum = this.getEnumSourceValues()
      const itemEnumTitles = getSchemaXOption(this.instance.schema.items || {}, 'enumTitles') || []
      const choicesOptions = getSchemaXOption(this.instance.schema, 'choicesOptions') ?? {}

      if (this.choicesInstance) {
        this.choicesInstance.destroy()
      }

      this.choices = itemEnum.map((item, index) => ({
        value: item,
        label: itemEnumTitles[index] || item,
        selected: isArray(value) && value.includes(item)
      }))

      this.choicesInstance = new window.Choices(this.control.input, {
        duplicateItemsAllowed: false,
        removeItemButton: true,
        choices: this.choices,
        ...choicesOptions
      })
    } catch (e) {
      console.error('Choices is not available or not loaded correctly.', e)
    }
  }

  addEventListeners () {
    this.control.input.addEventListener('change', () => {
      const value = this.choicesInstance.getValue(true)

      if (value !== this.instance.getValue()) {
        this.instance.setValue(value, true, 'user')
      }
    })
  }

  refreshDisabledState () {
    if (this.disabled || this.readOnly) {
      this.choicesInstance.disable()
    } else {
      this.choicesInstance.enable()
    }
  }

  refreshUI () {
    super.refreshUI()

    const value = this.instance.getValue()

    this.choicesInstance.removeActiveItems()

    if (Array.isArray(value)) {
      value.forEach(val => {
        this.choicesInstance.setChoiceByValue(val)
      })
    }
  }

  destroy () {
    this.choicesInstance.destroy()
    super.destroy()
  }
}

export default EditorArrayChoices
