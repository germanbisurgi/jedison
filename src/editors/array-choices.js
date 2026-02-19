import Editor from './editor.js'
import { isArray, isSet } from '../helpers/utils.js'
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
      const itemEnum = this.instance.schema.items.enum ?? []
      const itemEnumTitles = getSchemaXOption(this.instance.schema.items, 'enumTitles') ?? this.instance.getValue()
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
