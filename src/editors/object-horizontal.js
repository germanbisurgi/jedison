import EditorObject from './object.js'
import { getSchemaType, getSchemaXOption } from '../helpers/schema.js'

class EditorObjectHorizontal extends EditorObject {
  static resolves (schema) {
    return getSchemaType(schema) === 'object' &&
           getSchemaXOption(schema, 'format') === 'horizontal'
  }

  build () {
    super.build()
    this.theme.initHorizontalObject(this.control.container)
  }

  refreshEditors () {
    const labelColumns = getSchemaXOption(this.instance.schema, 'labelColumns')
    const inputColumns = getSchemaXOption(this.instance.schema, 'inputColumns')
    super.refreshEditors()
    this.instance.children.forEach(child => {
      if (child.isActive) {
        child.ui.adaptForHorizontal(labelColumns, inputColumns)
      }
    })
  }
}

export default EditorObjectHorizontal
