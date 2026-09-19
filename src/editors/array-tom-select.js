import Editor from './editor.js'
import { isArray, isObject, isSet, resolveInstancePath } from '../helpers/utils.js'
import { getSchemaItems, getSchemaType, getSchemaUniqueItems, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents a EditorArrayTomSelect instance.
 * @extends Editor
 */
class EditorArrayTomSelect extends Editor {
  static resolves (schema) {
    const hasTomSelectFormat = getSchemaXOption(schema, 'format') === 'tom-select'
    const tomSelectInstalled = window.TomSelect
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

    return hasTomSelectFormat && tomSelectInstalled && isArrayType && isUniqueItems && hasTypes && hasValidItemType
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
    if (!this.tomSelectInstance) return
    const values = this.getEnumSourceValues()
    const currentValue = this.instance.getValue()
    const itemEnumTitles = getSchemaXOption(this.instance.schema.items || {}, 'enumTitles') || []
    const options = values.map((item, index) => ({
      value: item,
      text: itemEnumTitles[index] || item
    }))
    this.tomSelectInstance.clearOptions()
    this.tomSelectInstance.addOptions(options)
    this.tomSelectInstance.setValue(isArray(currentValue) ? currentValue : [], true)
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
      const tomSelectOptions = getSchemaXOption(this.instance.schema, 'tomSelectOptions') ?? {}

      if (this.tomSelectInstance) {
        this.tomSelectInstance.destroy()
      }

      this.options = itemEnum.map((item, index) => ({
        value: item,
        text: itemEnumTitles[index] || item
      }))

      this.tomSelectInstance = new window.TomSelect(this.control.input, {
        plugins: ['drag_drop', 'remove_button', 'caret_position'],
        options: this.options,
        items: isArray(value) ? value : [],
        ...tomSelectOptions
      })
    } catch (e) {
      console.error('Tom Select is not available or not loaded correctly.', e)
    }
  }

  adaptForHorizontal (labelCol, inputCol) {
    this.theme.adaptForHorizontalSelectControl(this.control, labelCol, inputCol)
  }

  addEventListeners () {
    this.tomSelectInstance.on('change', (value) => {
      if (JSON.stringify(value) !== JSON.stringify(this.instance.getValue())) {
        this.instance.setValue(value, true, 'user')
      }
    })
  }

  refreshDisabledState () {
    if (this.disabled || this.readOnly) {
      this.tomSelectInstance.disable()
    } else {
      this.tomSelectInstance.enable()
    }
  }

  refreshUI () {
    super.refreshUI()

    const value = this.instance.getValue()
    this.tomSelectInstance.setValue(isArray(value) ? value : [], true)
  }

  destroy () {
    this.tomSelectInstance.destroy()
    super.destroy()
  }
}

export default EditorArrayTomSelect
