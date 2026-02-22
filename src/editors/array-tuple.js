import EditorArray from './array.js'
import { isSet } from '../helpers/utils.js'
import {
  getSchemaPrefixItems,
  getSchemaTitle,
  getSchemaType,
  getSchemaX
} from '../helpers/schema.js'

/**
 * Represents an EditorArrayTuple instance.
 * Fixed-length array editor for schemas using prefixItems.
 * @extends EditorArray
 */
class EditorArrayTuple extends EditorArray {
  static resolves (schema) {
    const type = getSchemaType(schema)
    const format = getSchemaX(schema, 'format')
    const prefixItems = getSchemaPrefixItems(schema)
    return type === 'array' && format === 'tuple' && isSet(prefixItems)
  }

  build () {
    super.build()
    this.control.addBtn.style.display = 'none'
  }

  addEventListeners () {
    this.addJsonDataEventListeners()
  }

  refreshUI () {
    this.control.childrenSlot.innerHTML = ''
    const table = this.theme.getTable()
    this.control.childrenSlot.appendChild(table.container)

    // thead — one header per prefixItem
    const schemaPrefixItems = getSchemaPrefixItems(this.instance.schema)
    schemaPrefixItems.forEach((prefixItemSchema) => {
      const th = this.theme.getTableHeader()
      const { label } = this.theme.getFakeLabel({
        content: getSchemaTitle(prefixItemSchema) ?? ''
      })
      th.appendChild(label)
      table.thead.appendChild(th)
    })

    // tbody — single row
    const tbodyRow = document.createElement('tr')
    this.instance.children.forEach((child) => {
      const td = this.theme.getTableDefinition()
      child.ui.adaptForTable(child, td)
      td.appendChild(child.ui.control.container)
      tbodyRow.appendChild(td)
    })
    table.tbody.appendChild(tbodyRow)

    this.refreshJsonData()
    this.refreshDisabledState()
  }
}

export default EditorArrayTuple
