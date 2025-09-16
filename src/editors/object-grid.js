import EditorObject from './object.js'
import { getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents a EditorObjectGrid instance.
 * @extends EditorObject
 */
class EditorObjectGrid extends EditorObject {
  static resolves (schema) {
    return getSchemaType(schema) === 'object' && getSchemaXOption(schema, 'format') === 'grid'
  }

  refreshEditors () {
    while (this.control.childrenSlot.firstChild) {
      this.control.childrenSlot.removeChild(this.control.childrenSlot.lastChild)
    }

    let row = this.theme.getRow()
    this.control.childrenSlot.appendChild(row)

    this.instance.children.forEach((child) => {
      if (child.isActive) {
        const childGridOptions = getSchemaXOption(child.schema, 'grid') || {}
        const gridColumns = getSchemaXOption(child.schema, 'gridColumns') ?? undefined
        const gridOffset = getSchemaXOption(child.schema, 'gridOffset') ?? 0

        // Retro base: in the last release "columns" was columnsMd
        const columnsMdRetro = childGridOptions.columns ?? undefined

        // Breakpoints with cascade fallback
        const columnsXs = childGridOptions.columnsXs ?? gridColumns ?? 12
        const columnsSm = childGridOptions.columnsSm ?? gridColumns ?? columnsXs
        const columnsMd = childGridOptions.columnsMd ?? columnsMdRetro ?? gridColumns ?? columnsSm
        const columnsLg = childGridOptions.columnsLg ?? gridColumns ?? columnsMd

        const offset = childGridOptions.offset ?? gridOffset
        const col = this.theme.getCol(columnsXs, columnsSm, columnsMd, columnsLg, offset)
        const newRow = childGridOptions.newRow || false

        if (newRow) {
          row = this.theme.getRow()
          this.control.childrenSlot.appendChild(row)
        }

        row.appendChild(col)
        col.appendChild(child.ui.control.container)

        if (this.disabled || this.instance.isReadOnly()) {
          child.ui.disable()
        } else {
          child.ui.enable()
        }
      }
    })
  }
}

export default EditorObjectGrid
