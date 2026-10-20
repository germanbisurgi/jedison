import constraints from './constraints.js'
import { hasOwn, isBoolean, isSet, isObject, isArray } from '../helpers/utils.js'
import { getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents a Validator instance.
 */
class Validator {
  constructor (config = {}) {
    this.refParser = config.refParser
    this.constraints = config.constraints ?? {}

    if (isArray(this.constraints)) {
      console.warn('Jedison: option "constraints" must be an object keyed by constraint name, not an array. Ignoring the value.')
      this.constraints = {}
    }

    this.assertFormat = config.assertFormat ? config.assertFormat : false
    this.translator = config.translator ? config.translator : false
    this.subErrors = config.subErrors ?? false
    this.defaultConstraints = constraints
  }

  /**
   * Validates a value against it's schema
   */
  getErrors (value, schema, key, path) {
    let schemaErrors = []

    if (isBoolean(schema) && schema === true) {
      return schemaErrors
    }

    if (isBoolean(schema) && schema === false) {
      return [{
        type: 'error',
        messages: ['invalid'],
        path: path
      }]
    }

    if (this.refParser && isObject(schema) && hasOwn(schema, '$ref')) {
      schema = this.refParser.expand(schema)
    }

    const allConstraints = { ...this.defaultConstraints, ...this.constraints }

    for (const [constraintName, constraint] of Object.entries(allConstraints)) {
      if (hasOwn(schema, constraintName)) {
        const context = {
          validator: this,
          value,
          schema,
          key,
          path,
          translator: this.translator
        }

        const validatorErrors = constraint(context)

        if (validatorErrors) {
          schemaErrors = [...schemaErrors, ...validatorErrors]
        }
      }
    }

    const schemaOptionsMessages = getSchemaXOption(schema, 'messages')

    if (isSet(schemaOptionsMessages)) {
      if (isObject(schemaOptionsMessages)) {
        schemaErrors.forEach((schemaError) => {
          const schemaMessageListedByLanguage = schemaOptionsMessages?.[this.translator?.language]?.[schemaError?.constraint]
          const schemaMessageListedByConstraint = schemaOptionsMessages?.[schemaError?.constraint]
          const schemaMessage = schemaMessageListedByLanguage ?? schemaMessageListedByConstraint

          if (isSet(schemaMessage)) {
            schemaError.messages = [
              schemaMessage
            ]
          }
          return schemaError
        })
      }

      if (isArray(schemaOptionsMessages) && schemaErrors.length > 0) {
        schemaErrors.forEach((schemaError) => {
          schemaError.messages = schemaOptionsMessages
          return schemaError
        })
      }
    }

    return schemaErrors
  }
}

export default Validator
