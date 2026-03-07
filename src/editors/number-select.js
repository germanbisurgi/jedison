import EditorNumber from './number.js'
import { isArray, isNumber, isObject, isSet, resolveInstancePath } from '../helpers/utils.js'
import { getSchemaEnum, getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents an EditorNumberSelect instance.
 * @extends EditorNumber
 */
class EditorNumberSelect extends EditorNumber {
  static resolves (schema) {
    const schemaType = getSchemaType(schema)
    const typeIsNumeric = schemaType === 'number' || schemaType === 'integer'
    return typeIsNumeric && (isSet(getSchemaEnum(schema)) || isSet(getSchemaXOption(schema, 'enumSource')))
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
    this.control = this.theme.getSelectControl({
      title: this.getTitle(),
      description: this.getDescription(),
      values: values,
      titles: getSchemaXOption(this.instance.schema, 'enumTitles') || values,
      id: this.getIdFromPath(this.instance.path),
      titleIconClass: getSchemaXOption(this.instance.schema, 'titleIconClass'),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      info: this.getInfo()
    })
  }

  refreshOptions () {
    const values = this.getEnumSourceValues()
    const titles = getSchemaXOption(this.instance.schema, 'enumTitles') || values
    const select = this.control.input
    select.innerHTML = ''
    values.forEach((value, i) => {
      const option = document.createElement('option')
      option.setAttribute('value', value)
      option.textContent = (titles && titles[i] !== undefined) ? titles[i] : value
      select.appendChild(option)
    })
    this.refreshUI()
  }

  adaptForTable () {
    this.theme.adaptForTableSelectControl(this.control)
  }

  addEventListeners () {
    this.control.input.addEventListener('change', () => {
      const value = this.sanitize(this.control.input.value)
      this.instance.setValue(value, true, 'user')
    })
  }

  refreshUI () {
    this.refreshDisabledState()
    const value = this.instance.getValue()

    if (isNumber(value)) {
      this.control.input.value = this.instance.getValue()
    }
  }
}

export default EditorNumberSelect
