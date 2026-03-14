import Instance from './instance.js'
import EditorIfThenElse from '../editors/if-then-else.js'

import {
  isSet,
  mergeDeep,
  clone,
  isObject,
  overwriteExistingProperties,
  hasOwn
} from '../helpers/utils.js'

import {
  getSchemaElse,
  getSchemaIf,
  getSchemaThen
} from '../helpers/schema.js'

/**
 * Represents a InstanceIfThenElse instance.
 * @extends Instance
 */
class InstanceIfThenElse extends Instance {
  setUI () {
    this.ui = new EditorIfThenElse(this)
  }

  prepare () {
    this.instances = []
    this.instanceStartingValues = []
    this.instanceWithoutIf = null
    this.activeInstance = null
    this.index = 0
    this.schemas = []
    this.ifThenElseSchemas = []

    this.traverseSchema(this.schema)

    delete this.schema.if
    delete this.schema.then
    delete this.schema.else

    this.ifThenElseSchemas.forEach((item) => {
      if (isSet(item.then)) {
        this.schemas.push(mergeDeep({}, clone(this.schema), item.then))
      }

      if (isSet(item.else)) {
        this.schemas.push(mergeDeep({}, clone(this.schema), item.else))
      }
    })

    const schemaClone = clone(this.schema)
    delete schemaClone.if
    delete schemaClone.then
    delete schemaClone.else

    this.instanceWithoutIf = this.jedison.createInstance({
      jedison: this.jedison,
      schema: schemaClone,
      originalSchema: this.originalSchema,
      path: this.path,
      parent: this.parent,
      arrayTemplateData: this.arrayTemplateData
    })

    this.schemas.forEach((schema) => {
      const instance = this.jedison.createInstance({
        jedison: this.jedison,
        schema: schema,
        originalSchema: this.originalSchema,
        path: this.path,
        parent: this.parent,
        arrayTemplateData: this.arrayTemplateData
      })

      this.instanceStartingValues.push(instance.getValue())

      this.instances.push(instance)
    })

    this.on('set-value', (value, initiator) => {
      this.changeValue(value, initiator)
    })

    const ifValue = this.instanceWithoutIf.getValueRaw()
    this.changeValue(ifValue)
  }

  changeValue (value, initiator = 'api') {
    // Strip keys belonging to if/then/else branches so only "base" properties
    // are used when evaluating which branch applies.
    const withoutIf = this.getWithoutIfValueFromValue(value)
    const fittestIndex = this.getFittestIndex(withoutIf)
    const indexChanged = fittestIndex !== this.index
    this.index = fittestIndex
    this.activeInstance = this.instances[fittestIndex]
    this.activeInstance.register()

    // All instances are kept in sync so that switching back to a previously
    // active branch shows up-to-date values instead of stale schema defaults.
    this.instances.forEach((instance, index) => {
      // Re-register listener each cycle to avoid stacking duplicate handlers.
      instance.off('notifyParent')

      // When a child instance is itself a "multiple" (anyOf/oneOf), pass its
      // slice of the value directly so it can pick the right sub-schema.
      if (instance.children && isObject(value)) {
        instance.children.forEach((child) => {
          const shouldUpdateValue = child.isMultiple && hasOwn(value, child.getKey())

          if (shouldUpdateValue) {
            child.setValue(value[child.getKey()], true, 'api')
          }
        })
      }

      const startingValue = this.instanceStartingValues[index]
      let instanceValue = value

      if (isObject(startingValue) && isObject(value)) {
        // When the user switches branches (not an API call), reset to the
        // branch's schema defaults merged with the base (non-conditional) data
        // so that branch-specific fields don't carry over stale user input.
        // Otherwise, merge incoming data onto the instance's current values to
        // preserve anything the user has already entered.
        if (indexChanged && initiator !== 'api') {
          instanceValue = overwriteExistingProperties(startingValue, withoutIf)
        } else {
          const audacity = this.jedison.options.audacity

          if (audacity && initiator === 'api' && index === fittestIndex) {
            // Pre-pass (active instance only): trigger nested ITE branch switches
            // so currentValue reflects the correct branch types before the merge.
            // Merge existing values with incoming to prevent property deactivation
            // when the incoming value is a partial object.
            const prePassValue = mergeDeep({}, instance.getValue(), value)
            instance.setValue(prePassValue, false, 'api')
          }
          const currentValue = instance.getValue()
          instanceValue = overwriteExistingProperties(currentValue, value)
        }
      }

      // Notify watched-data subscribers that the active branch changed.
      if (indexChanged) {
        this.jedison.updateInstancesWatchedData()
      }

      instance.setValue(instanceValue, false, initiator)

      // When a child field changes, re-evaluates which branch is active because
      // the change may affect the if-condition (e.g., a select that drives the
      // conditional).
      instance.on('notifyParent', (initiator) => {
        const value = instance.getValueRaw()
        this.changeValue(value, initiator)
        this.emit('notifyParent', initiator)
        this.emit('change', initiator)
      })
    })

    // Ensure active instance processes the value again for nullable editors
    // Only apply secondary setValue if we have nullable fields that might need it
    if (initiator === 'api' && this.hasNullableFields(this.activeInstance)) {
      this.activeInstance.setValue(value, false, 'secondary')
    }

    this.value = this.activeInstance.getValueRaw()
  }

  getWithoutIfValueFromValue (value) {
    let withoutIf = this.instanceWithoutIf.getValue()

    if (isObject(withoutIf) && isObject(value)) {
      withoutIf = overwriteExistingProperties(withoutIf, value)
      return withoutIf
    }

    return value
  }

  traverseSchema (schema) {
    const schemaIf = getSchemaIf(schema)

    if (isSet(schemaIf)) {
      const schemaThen = getSchemaThen(schema)
      const schemaElse = getSchemaElse(schema)

      this.ifThenElseSchemas.push({
        if: schemaIf,
        then: isSet(schemaThen) ? schemaThen : {}
      })

      this.ifThenElseSchemas.push({
        if: schemaIf,
        else: isSet(schemaElse) ? schemaElse : {}
      })
    }
  }

  /**
   * Check if an instance has nullable fields in its schema or children
   */
  hasNullableFields (instance) {
    if (!instance) return false

    // Check if the instance itself has a nullable schema
    if (this.isNullableSchema(instance.schema)) {
      return true
    }

    // Check if any child instances have nullable schemas
    if (instance.children) {
      return instance.children.some(child => this.hasNullableFields(child))
    }

    return false
  }

  /**
   * Check if a schema is nullable (has x-format: 'number-nullable' or similar nullable formats)
   */
  isNullableSchema (schema) {
    if (!schema) return false

    // Check for x-format nullable indicators
    if (schema['x-format'] && schema['x-format'].includes('nullable')) {
      return true
    }

    // Check for type array containing null
    if (Array.isArray(schema.type) && schema.type.includes('null')) {
      return true
    }

    // Recursively check properties
    if (schema.properties) {
      return Object.values(schema.properties).some(prop => this.isNullableSchema(prop))
    }

    return false
  }

  /**
   * Returns the index of the instance that has less validation errors
   */
  getFittestIndex (value) {
    let fittestIndex = this.index
    const key = this.getKey()

    this.ifThenElseSchemas.forEach((schema, index) => {
      if (schema.if === true) {
        fittestIndex = 0
      } else if (schema.if === false) {
        fittestIndex = 1
      } else {
        const testSchema = isSet(this.schema.type)
          ? { ...schema.if, type: this.schema.type }
          : schema.if

        const ifErrors = this.jedison.validator.getErrors(value, testSchema, key, this.path)

        if (ifErrors.length === 0 && schema.then) {
          fittestIndex = index
        }

        if (ifErrors.length > 0 && schema.else) {
          fittestIndex = index
        }
      }
    })

    return fittestIndex
  }

  hasNestedValidationErrors () {
    return this.activeInstance ? this.activeInstance.hasNestedValidationErrors() : false
  }

  destroy () {
    this.instances.forEach((instance) => {
      instance.destroy()
    })

    super.destroy()
  }
}

export default InstanceIfThenElse
