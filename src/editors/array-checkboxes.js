import {
  isArray,
  isSet
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

    const validTypes = ['string', 'number', 'integer']

    const hasValidItemType = isSet(schemaItems) &&
      isSet(schemaItemsType) &&
      (validTypes.includes(schemaItemsType) ||
        (isArray(schemaItemsType) && schemaItemsType.some(type => validTypes.includes(type))))

    return isArrayType && isUniqueItems && hasEnum && hasTypes && hasValidItemType
  }

  build () {
    this.control = this.theme.getCheckboxesControl({
      title: this.getTitle(),
      description: this.getDescription(),
      values: getSchemaEnum(this.instance.schema.items),
      titles: getSchemaXOption(this.instance.schema.items, 'enumTitles') || getSchemaEnum(this.instance.schema.items),
      id: this.getIdFromPath(this.instance.path),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      inline: getSchemaXOption(this.instance.schema, 'format') === 'checkboxes-inline',
      info: this.getInfo()
    })
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
}

export default EditorArrayCheckboxes
