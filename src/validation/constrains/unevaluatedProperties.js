/**
 * constrains unevaluatedProperties
 */

import { compileTemplate, hasOwn, isBoolean, isObject, isSet, compilePattern } from '../../helpers/utils.js'
import {
  getSchemaUnevaluatedProperties,
  getSchemaPatternProperties,
  getSchemaProperties,
  getSchemaAdditionalProperties,
  getSchemaDependentSchemas,
  getSchemaIf,
  getSchemaThen,
  getSchemaElse,
  getSchemaAnyOf, getSchemaAllOf, getSchemaOneOf
} from '../../helpers/schema.js'

/**
 * Collects the names of the properties of context.value that were evaluated by the
 * keywords of a schema, including the subschemas that applied and were valid.
 * Properties touched by a failing subschema do not count.
 */
function collectEvaluated (context, schema, evaluated, includeOwnUnevaluated) {
  if (isBoolean(schema)) {
    return
  }

  if (context.validator.refParser && hasOwn(schema, '$ref')) {
    schema = context.validator.refParser.expand(schema)
  }

  const names = Object.keys(context.value)
  const isValid = (subschema) => context.validator.getErrors(context.value, subschema, context.key, context.path).length === 0
  const merge = (subschema) => collectEvaluated(context, subschema, evaluated, true)

  const properties = getSchemaProperties(schema)
  const patternProperties = getSchemaPatternProperties(schema)

  names.forEach((name) => {
    const inProperties = isSet(properties) && hasOwn(properties, name)
    const inPatternProperties = isSet(patternProperties) && Object.keys(patternProperties).some((pattern) => compilePattern(pattern).test(name))

    if (inProperties || inPatternProperties) {
      evaluated.add(name)
    }
  })

  // additionalProperties, and a nested unevaluatedProperties, evaluate everything that is left
  if (isSet(getSchemaAdditionalProperties(schema)) || (includeOwnUnevaluated && isSet(getSchemaUnevaluatedProperties(schema)))) {
    names.forEach((name) => evaluated.add(name))
  }

  const allOf = getSchemaAllOf(schema)

  if (isSet(allOf)) {
    allOf.forEach(merge)
  }

  const anyOf = getSchemaAnyOf(schema)
  const oneOf = getSchemaOneOf(schema)

  ;[anyOf, oneOf].forEach((subschemas) => {
    if (isSet(subschemas)) {
      subschemas.filter(isValid).forEach(merge)
    }
  })

  const schemaIf = getSchemaIf(schema)

  if (isSet(schemaIf)) {
    const schemaThen = getSchemaThen(schema)
    const schemaElse = getSchemaElse(schema)

    if (isValid(schemaIf)) {
      merge(schemaIf)

      if (isSet(schemaThen)) {
        merge(schemaThen)
      }
    } else if (isSet(schemaElse)) {
      merge(schemaElse)
    }
  }

  const dependentSchemas = getSchemaDependentSchemas(schema)

  if (isSet(dependentSchemas)) {
    Object.keys(dependentSchemas).filter((name) => hasOwn(context.value, name)).forEach((name) => merge(dependentSchemas[name]))
  }
}

export function unevaluatedProperties (context) {
  let errors = []
  const unevaluatedSchema = getSchemaUnevaluatedProperties(context.schema)

  if (isObject(context.value) && isSet(unevaluatedSchema)) {
    const evaluated = new Set()

    collectEvaluated(context, context.schema, evaluated, false)

    Object.keys(context.value).filter((property) => !evaluated.has(property)).forEach((property) => {
      if (unevaluatedSchema === false) {
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
      } else if (isObject(unevaluatedSchema)) {
        const propertyErrors = context.validator.getErrors(context.value[property], unevaluatedSchema, property, context.path + '/' + property).map((error) => {
          return {
            type: 'error',
            path: context.path + '/' + property,
            constraint: 'unevaluatedProperties',
            messages: error.messages
          }
        })

        errors = [...errors, ...propertyErrors]
      }
    })
  }

  return errors
}
