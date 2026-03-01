import Instance from './instance.js'
import { isSet, clone, isArray } from '../helpers/utils.js'
import {
  getSchemaDefault,
  getSchemaItems,
  getSchemaMinItems,
  getSchemaPrefixItems,
  getSchemaXOption
} from '../helpers/schema.js'

/**
 * Represents an InstanceArray instance.
 * @extends Instance
 */
class InstanceArray extends Instance {
  prepare () {
    const schemaMinItems = getSchemaMinItems(this.schema, 'minItems')
    const schemaEnforceMinItems = getSchemaXOption(this.schema, 'enforceMinItems')
    const enforceMinItems = isSet(schemaEnforceMinItems) ? schemaEnforceMinItems : this.jedison.options.enforceMinItems
    const isEditor = this.jedison.isEditor
    const hasEnforceMinItems = isSet(enforceMinItems) && enforceMinItems === true
    const hasMinItems = isSet(schemaMinItems)

    if (isEditor && hasEnforceMinItems && hasMinItems) {
      for (let i = 0; i < schemaMinItems; i++) {
        this.addItem()
      }
    }

    this.refreshChildren()

    this.on('set-value', () => {
      this.refreshChildren()
    })
  }

  createItemInstance (index) {
    let schema
    const itemsCount = this.children.length
    const schemaItems = getSchemaItems(this.schema)
    const schemaPrefixItems = getSchemaPrefixItems(this.schema)
    schema = isSet(schemaItems) ? schemaItems : {}

    const hasPrefixItemsSchema = isSet(schemaPrefixItems) && isSet(schemaPrefixItems[itemsCount])

    if (hasPrefixItemsSchema) {
      schema = schemaPrefixItems[itemsCount]
    }

    return this.jedison.createInstance({
      jedison: this.jedison,
      schema: schema,
      path: this.path + this.jedison.pathSeparator + itemsCount,
      parent: this,
      arrayTemplateData: {
        i0: index,
        i1: (index + 1)
      }
    })
  }

  setDefaultValue () {
    const schemaDefault = getSchemaDefault(this.schema)

    if (isSet(schemaDefault)) {
      this.setValue(schemaDefault)
    }
  }

  move (fromIndex, toIndex, initiator) {
    const value = clone(this.getValueRaw())

    if (!isArray(value)) {
      return
    }

    const item = value[fromIndex]
    value.splice(fromIndex, 1)
    value.splice(toIndex, 0, item)
    this.setValue(value, true, initiator)
    this.emit('item-move', initiator)
    this.jedison.emit('item-move', initiator)
  }

  addItem (initiator) {
    const tempEditor = this.createItemInstance()
    let value = clone(this.getValueRaw())

    if (!isArray(value)) {
      value = []
    }

    value.push(tempEditor.getValue())
    tempEditor.destroy()
    this.setValue(value, true, initiator)
    const instance = this.children[this.children.length - 1]
    this.emit('item-add', initiator, instance)
    this.jedison.emit('item-add', initiator, instance)
  }

  deleteItem (itemIndex, initiator) {
    const currentValue = clone(this.getValueRaw())

    if (!isArray(currentValue)) {
      return
    }

    const newValue = currentValue.filter((item, index) => index !== itemIndex)
    this.setValue(newValue, true, initiator)
    this.emit('item-delete', initiator)
    this.jedison.emit('item-delete', initiator)
  }

  onChildChange (initiator) {
    const value = []

    this.children.forEach((child) => {
      value.push(child.getValueRaw())
    })

    this.value = value
    this.jedison.emit('instance-change', this, initiator)
    this.emit('change', initiator)
    this.emit('notifyParent', initiator)
  }

  refreshChildren () {
    this.children = []

    const value = this.getValueRaw()

    if (!isArray(value)) {
      return
    }

    const correctedValues = []
    value.forEach((itemValue, index) => {
      const child = this.createItemInstance(index)
      this.children.push(child)
      const finalValue = child.setValue(itemValue, false)
      correctedValues.push(finalValue)
    })

    // Update the array's value with constraint-enforced values
    this.value = correctedValues
  }
}

export default InstanceArray
