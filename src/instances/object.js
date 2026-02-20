import Instance from './instance.js'
import { different, isSet, notSet, isObject, hasOwn, clone, isNumber } from '../helpers/utils.js'
import {
  getSchemaAdditionalProperties,
  getSchemaDependentRequired,
  getSchemaPatternProperties,
  getSchemaProperties,
  getSchemaRequired,
  getSchemaXOption
} from '../helpers/schema.js'

/**
 * Represents an InstanceObject instance.
 * @extends Instance
 */
class InstanceObject extends Instance {
  prepare () {
    this.properties = {}
    this.requiredProperties = new Set()

    const schemaProperties = getSchemaProperties(this.schema)
    const schemaRequired = getSchemaRequired(this.schema)

    if (isSet(schemaProperties)) {
      Object.keys(schemaProperties).forEach((key) => {
        const schema = schemaProperties[key]
        this.properties[key] = { schema }

        let musstCreateChild = true

        const isRecursive = isSet(schema['x-recursive'])
        const optionsDeactivateNonRequired = this.jedison.options.deactivateNonRequired
        const deactivateNonRequired = getSchemaXOption(this.schema, 'deactivateNonRequired')
        const schemaDeactivateNonRequired = getSchemaXOption(schema, 'deactivateNonRequired')

        if (!this.isRequired(key) && isSet(optionsDeactivateNonRequired) && optionsDeactivateNonRequired === true) {
          musstCreateChild = false
        }

        if (!this.isRequired(key) && isSet(deactivateNonRequired) && deactivateNonRequired === true) {
          musstCreateChild = false
        }

        if (!this.isRequired(key) && isSet(schemaDeactivateNonRequired) && schemaDeactivateNonRequired === true) {
          musstCreateChild = false
        }

        if (!this.isRequired(key) && isRecursive) {
          musstCreateChild = false
        }

        if (musstCreateChild) {
          this.createChild(schema, key)
        }
      })
    }

    // Add properties listed in schema required too if not present in schema properties
    if (isSet(schemaRequired) && this.jedison.isEditor && this.jedison.options.enforceRequired === true) {
      schemaRequired.forEach((requiredProperty) => {
        this.requiredProperties.add(requiredProperty)

        if (!hasOwn(this.properties, requiredProperty)) {
          this.properties[requiredProperty] = {}
          this.createChild({}, requiredProperty)
        }
      })
    }

    this.refreshInstances()

    this.on('set-value', (value, initiator) => {
      this.addMissingRequiredPropertiesToValue(value)
      this.removeNotListedPropertiesFromValue(value)
      this.refreshInstances(initiator)
    })
  }

  removeNotListedPropertiesFromValue (value) {
    const schemaEnforceAdditionalProperties = getSchemaXOption(this.schema, 'enforceAdditionalProperties')
    const enforceAdditionalProperties = isSet(schemaEnforceAdditionalProperties) ? schemaEnforceAdditionalProperties : this.jedison.options.enforceAdditionalProperties
    const schemaAdditionalProperties = getSchemaAdditionalProperties(this.schema)
    const schemaPatternProperties = getSchemaPatternProperties(this.schema) || {}

    if (this.jedison.isEditor && enforceAdditionalProperties && isSet(schemaAdditionalProperties) && schemaAdditionalProperties === false) {
      Object.keys(value).forEach((propertyName) => {
        const matchesPattern = Object.keys(schemaPatternProperties).some(pattern => new RegExp(pattern).test(propertyName))

        if (!hasOwn(this.properties, propertyName) && !matchesPattern) {
          console.warn('deleting', propertyName)
          delete value[propertyName]
        }
      })
    }
  }

  addMissingRequiredPropertiesToValue (value) {
    const enforceRequired = getSchemaXOption(this.schema, 'enforceRequired') ?? this.jedison.options.enforceRequired

    if (this.jedison.isEditor && enforceRequired) {
      this.requiredProperties.forEach((propertyName) => {
        if (!hasOwn(value, propertyName)) {
          value[propertyName] = this.getChild(propertyName).getValue()
        }
      })
    }
  }

  /**
   * Returns true if the property is required
   */
  isRequired (property) {
    const schemaRequired = getSchemaRequired(this.schema)
    const inSchemaRequired = isSet(schemaRequired) && schemaRequired.includes(property)
    const inSchemaDependentRequired = this.isDependentRequired(property)

    return inSchemaRequired || inSchemaDependentRequired
  }

  /**
   * Returns true if the property is dependent required
   */
  isDependentRequired (property) {
    const dependentRequired = getSchemaDependentRequired(this.schema)

    if (isSet(dependentRequired)) {
      let missingProperties = []

      Object.keys(dependentRequired).forEach((key) => {
        if (isSet(this.value[key])) {
          const requiredProperties = dependentRequired[key]

          missingProperties = requiredProperties.filter((property) => {
            return !hasOwn(this.value, property)
          })
        }
      })

      return missingProperties.includes(property)
    }

    return false
  }

  createChild (schema, key, value, activate = false) {
    const instance = this.jedison.createInstance({
      jedison: this.jedison,
      schema: schema,
      path: this.path + this.jedison.pathSeparator + key,
      parent: this,
      value: clone(value)
    })

    this.children.push(instance)
    this.value[key] = instance.getValue()

    const deactivateNonRequired = getSchemaXOption(this.schema, 'deactivateNonRequired') ?? this.jedison.options.deactivateNonRequired

    if (!this.isRequired(key) && isSet(deactivateNonRequired) && deactivateNonRequired === true && !activate) {
      instance.deactivate()
    }

    this.onChildChange()

    return instance
  }

  deleteChild (key) {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const instance = this.children[i]
      if (instance.getKey() === key) {
        instance.destroy()
        this.children.splice(i, 1)
        this.onChildChange()
      }
    }
  }

  getChild (key) {
    return this.children.find((instance) => {
      return key === instance.getKey().split(this.jedison.pathSeparator).pop()
    })
  }

  getPropertySchema (propertyName) {
    let schema
    const schemaAdditionalProperties = getSchemaAdditionalProperties(this.schema)
    const schemaProperties = getSchemaProperties(this.schema)
    const schemaPatternProperties = getSchemaPatternProperties(this.schema)

    // Determine the appropriate schema
    if (isSet(schemaProperties) && hasOwn(schemaProperties, propertyName)) {
      // If the propertyName is explicitly defined in `properties`, use it
      schema = schemaProperties[propertyName]
    } else if (isSet(schemaPatternProperties)) {
      // If no exact match in `properties`, check if it matches any pattern in `patternProperties`
      Object.keys(schemaPatternProperties).forEach((pattern) => {
        const regexp = new RegExp(pattern)
        if (regexp.test(propertyName)) {
          schema = schemaPatternProperties[pattern]
        }
      })
    }

    if (notSet(schema) && isSet(schemaAdditionalProperties)) {
      // If no match was found in `properties` or `patternProperties`, use `additionalProperties`
      schema = schemaAdditionalProperties
    }

    if (notSet(schema)) {
      schema = {}
    }

    return schema
  }

  onChildChange (initiator) {
    const value = {}

    this.children.forEach((child) => {
      if (child.isActive) {
        const propertyName = child.getKey()

        if (propertyName === '__proto__') {
          Object.defineProperty(value, propertyName, {
            value: child.getValue(),
            enumerable: true
          })
        } else {
          value[propertyName] = child.getValue()
        }
      }
    })

    this.value = value
    this.jedison.emit('instance-change', this, initiator)
    this.emit('change', initiator)
    this.emit('notifyParent', initiator)
  }

  /**
   * Sorts the children of the current instance based on their `propertyOrder` value in ascending order.
   * The sorting is done using the `propertyOrder` obtained from each child's schema, which should be a number.
   * If a child does not have a valid `propertyOrder` (i.e., the value is not a number), it will be placed after the child with a valid `propertyOrder`.
   * @returns {void} This function modifies the `children` array of the instance in place.
   */
  sortChildrenByPropertyOrder () {
    this.children = this.children.sort((a, b) => {
      const propertyOrderA = getSchemaXOption(a.schema, 'propertyOrder')
      const propertyOrderB = getSchemaXOption(b.schema, 'propertyOrder')

      const isValidNumberA = isNumber(propertyOrderA)
      const isValidNumberB = isNumber(propertyOrderB)

      if (!isValidNumberA && isValidNumberB) {
        return 1
      }

      if (isValidNumberA && !isValidNumberB) {
        return -1
      }

      if (propertyOrderA < propertyOrderB) {
        return -1
      }

      if (propertyOrderA > propertyOrderB) {
        return 1
      }

      return 0
    })
  }

  refreshInstances (initiator) {
    const value = this.getValue()

    if (!isObject(value)) {
      return
    }

    Object.keys(value).forEach((propertyName) => {
      const child = this.getChild(propertyName)

      // If a value has already a child instance
      if (child) {
        child.activate()
        const oldValue = child.getValue()
        const newValue = value[child.getKey()]

        // update child value if the old value and the new value are different
        if (different(oldValue, newValue)) {
          const finalValue = child.setValue(newValue, false, initiator)
          // Update the value with the final value after constraint enforcement
          value[child.getKey()] = finalValue
        }
      } else {
        // create new child instance for the new value entry having the value as default
        const schema = this.getPropertySchema(propertyName)

        this.createChild(schema, propertyName, value[propertyName], true)
      }
    })

    // remove any children that are not included in the value
    for (let i = this.children.length - 1; i >= 0; i--) {
      const instance = this.children[i]
      const propertyName = instance.getKey()
      if (notSet(value[propertyName])) {
        if (this.getChild(propertyName)) {
          instance.deactivate()
        } else {
          this.deleteChild(propertyName)
        }
      }
    }

    this.sortChildrenByPropertyOrder()

    // Update the object's value with the corrected values after constraint enforcement
    this.value = value
  }
}

export default InstanceObject
