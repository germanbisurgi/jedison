/**
 * constrains unevaluatedProperties
 */

import { compileTemplate, hasOwn, isObject, isSet } from '../../helpers/utils.js'
import {
  getSchemaUnevaluatedProperties,
  getSchemaPatternProperties,
  getSchemaProperties,
  getSchemaAnyOf, getSchemaAllOf, getSchemaOneOf
} from '../../helpers/schema.js'

export function unevaluatedProperties (context) {
  let errors = []
  const schemaUnevaluatedProperties = getSchemaUnevaluatedProperties(context.schema)
  const schemaPatternProperties = getSchemaPatternProperties(context.schema)
  const schemaProperties = getSchemaProperties(context.schema)
  const schemaAllOf = getSchemaAllOf(context.schema)
  const schemaAnyOf = getSchemaAnyOf(context.schema)
  const schemaOneOf = getSchemaOneOf(context.schema)

  if (isObject(context.value) && isSet(schemaUnevaluatedProperties)) {
    let properties = isSet(schemaProperties) ? schemaProperties : {}
    const unevaluatedProperties = schemaUnevaluatedProperties
    const patternProperties = schemaPatternProperties

    // see through allOf, anyOf and oneOf
    const ofSchemas = [
      schemaAllOf,
      schemaAnyOf,
      schemaOneOf
    ]

    ofSchemas.forEach((subSchema) => {
      if (isSet(subSchema)) {
        subSchema.forEach((subschema) => {
          if (isSet(subschema['properties'])) {
            properties = { ...properties, ...subschema['properties'] }
          }
        })
      }
    })

    if (properties) {
      Object.keys(context.value).forEach((property) => {
        let definedInPatternProperty = false

        if (isSet(patternProperties)) {
          Object.keys(patternProperties).forEach((pattern) => {
            const regexp = new RegExp(pattern)
            definedInPatternProperty = regexp.test(property)
          })
        }

        if (!definedInPatternProperty && unevaluatedProperties === false && !hasOwn(properties, property)) {
          errors.push({
            type: 'error',
            path: context.path,
            constraint: 'unevaluatedProperties',
            messages: [
              compileTemplate(context.translator.translate('errorUnevaluatedProperties'), {
                property: property
              })
            ]
          })
        }

        if (!definedInPatternProperty && isObject(unevaluatedProperties) && !hasOwn(properties, property)) {
          const unevaluatedPropertiesErrors = context.validator.getErrors(context.value[property], unevaluatedProperties, property, context.path + '/' + property).map((error) => {
            return {
              type: 'error',
              path: property,
              constraint: 'unevaluatedProperties',
              messages: error.messages
            }
          })

          errors = [...errors, ...unevaluatedPropertiesErrors]
        }
      })
    }
  }

  return errors
}
