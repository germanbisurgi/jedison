import {
  isArray,
  isObject,
  isSet,
  resolveInstancePath
} from '../helpers/utils.js'

import {
  getSchemaEnum,
  getSchemaItems,
  getSchemaType,
  getSchemaUniqueItems,
  getSchemaXOption
} from '../helpers/schema.js'

import Editor from './editor.js'

/**
 * Represents an EditorArrayCheckboxes instance.
 * @extends Editor
 */
class EditorArrayCheckboxes extends Editor {
  static resolves (schema) {
    const schemaType = getSchemaType(schema)
    const schemaItems = getSchemaItems(schema)
    const schemaItemsType = isSet(schemaItems) && getSchemaType(schemaItems)
    const isArrayType = isSet(schemaType) && schemaType === 'array'
    const isUniqueItems = getSchemaUniqueItems(schema) === true
    const hasEnum = isSet(schemaItems) && isSet(getSchemaEnum(schema.items))
    const hasTypes = isSet(schemaItems) && isSet(schemaItemsType)
    const hasEnumSource = isSet(getSchemaXOption(schema, 'enumSource'))

    const validTypes = ['string', 'number', 'integer']

    const hasValidItemType = isSet(schemaItems) &&
      isSet(schemaItemsType) &&
      (validTypes.includes(schemaItemsType) ||
        (isArray(schemaItemsType) && schemaItemsType.some(type => validTypes.includes(type))))

    return isArrayType && isUniqueItems && (hasEnumSource || (hasEnum && hasTypes && hasValidItemType))
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
    return getSchemaEnum(this.instance.schema.items) || []
  }

  build () {
    const values = this.getEnumSourceValues()
    const schemaItems = this.instance.schema.items || {}
    const titles = getSchemaXOption(schemaItems, 'enumTitles') || values
    this.control = this.theme.getCheckboxesControl({
      title: this.getTitle(),
      description: this.getDescription(),
      values: values,
      titles: titles,
      id: this.getIdFromPath(this.instance.path),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      inline: getSchemaXOption(this.instance.schema, 'format') === 'checkboxes-inline',
      info: this.getInfo()
    })
  }

  refreshOptions () {
    const values = this.getEnumSourceValues()
    const schemaItems = this.instance.schema.items || {}
    const titles = getSchemaXOption(schemaItems, 'enumTitles') || values
    const id = this.getIdFromPath(this.instance.path)
    const messagesId = id + '-messages'
    const descriptionId = id + '-description'
    const describedBy = messagesId + ' ' + descriptionId

    this.control.checkboxControls.forEach(cc => {
      if (cc.parentNode) cc.parentNode.removeChild(cc)
    })

    this.control.checkboxes = []
    this.control.labels = []
    this.control.checkboxControls = []
    this.control.labelTexts = []

    values.forEach((value, index) => {
      const checkboxId = id + '-' + index
      const checkboxControl = document.createElement('div')
      const checkbox = document.createElement('input')
      const label = document.createElement('label')
      const labelText = document.createElement('span')

      checkbox.setAttribute('type', 'checkbox')
      checkbox.setAttribute('id', checkboxId)
      checkbox.setAttribute('name', id)
      checkbox.setAttribute('value', value)
      checkbox.setAttribute('aria-describedby', describedBy)

      label.setAttribute('for', checkboxId)

      labelText.textContent = (titles && titles[index] !== undefined) ? titles[index] : value

      checkboxControl.appendChild(checkbox)
      checkboxControl.appendChild(label)
      label.appendChild(labelText)

      this.control.checkboxes.push(checkbox)
      this.control.labels.push(label)
      this.control.labelTexts.push(labelText)
      this.control.checkboxControls.push(checkboxControl)

      this.control.fieldset.insertBefore(checkboxControl, this.control.description)
    })

    this.addEventListeners()
    this.refreshUI()
  }

  adaptForTable (td) {
    this.theme.adaptForTableCheckboxesControl(this.control, td)
  }

  addEventListeners () {
    this.control.checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        let value = this.instance.getValue()

        if (!isArray(value)) {
          value = []
        }

        if (checkbox.checked) {
          value.push(checkbox.value)
        } else {
          const index = value.indexOf(checkbox.value)
          if (index > -1) {
            value.splice(index, 1)
          }
        }

        this.instance.setValue(value, true, 'user')
      })
    })
  }

  refreshUI () {
    this.refreshDisabledState()

    const value = this.instance.getValue()

    if (!isArray(value)) {
      return
    }

    this.control.checkboxes.forEach((checkbox) => {
      checkbox.checked = value.includes(checkbox.value)
    })
  }

  setAriaInvalid (invalid) {
    this.control.checkboxes.forEach(checkbox => {
      if (invalid) {
        checkbox.setAttribute('aria-invalid', 'true')
      } else {
        checkbox.removeAttribute('aria-invalid')
      }
    })
  }
}

export default EditorArrayCheckboxes
