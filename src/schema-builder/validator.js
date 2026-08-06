import { isBoolean, isNumber, isInteger, isString, isArray, isObject } from '../helpers/utils.js'
import { TYPES, getKeywordKind, isDraft2019Plus } from './schema-keywords.js'

function pushError (errors, path, message) {
  errors.push({ path, message })
}

function validateValueKind (schema, key, errors, path) {
  const kind = getKeywordKind(key, schema.$schema)

  if (kind === 'text' || kind === 'textarea') {
    if (!isString(schema[key])) {
      pushError(errors, path, `"${key}" must be a string`)
    }
    return
  }

  if (kind === 'number') {
    if (!isNumber(schema[key])) {
      pushError(errors, path, `"${key}" must be a number`)
    }
    return
  }

  if (kind === 'positive-number') {
    if (!isNumber(schema[key]) || schema[key] <= 0) {
      pushError(errors, path, `"${key}" must be a number greater than zero`)
    }
    return
  }

  if (kind === 'non-negative-integer') {
    if (!isInteger(schema[key]) || schema[key] < 0) {
      pushError(errors, path, `"${key}" must be a non-negative integer`)
    }
    return
  }

  if (kind === 'boolean') {
    if (!isBoolean(schema[key])) {
      pushError(errors, path, `"${key}" must be a boolean`)
    }
  }
}

function validateSchemaNode (schema, draft, path, errors, depth) {
  if (depth > 50) {
    pushError(errors, path, 'Maximum nesting depth exceeded')
    return
  }

  if (isBoolean(schema)) {
    return
  }

  if (!isObject(schema)) {
    pushError(errors, path, 'A schema must be an object or a boolean')
    return
  }

  const draftUsed = draft || schema.$schema

  if (schema.$schema !== undefined && !isString(schema.$schema)) {
    pushError(errors, path, '"$schema" must be a string')
  }

  if (schema.$ref !== undefined && !isString(schema.$ref)) {
    pushError(errors, path, '"$ref" must be a string')
  }

  if (schema.title !== undefined && !isString(schema.title)) {
    pushError(errors, path, '"title" must be a string')
  }

  if (schema.description !== undefined && !isString(schema.description)) {
    pushError(errors, path, '"description" must be a string')
  }

  if (schema.format !== undefined && !isString(schema.format)) {
    pushError(errors, path, '"format" must be a string')
  }

  if (schema.type !== undefined) {
    const types = isArray(schema.type) ? schema.type : [schema.type]
    const allStrings = types.every(isString)
    const allKnown = types.every((t) => TYPES.includes(t))

    if (!allStrings || !allKnown || types.length === 0) {
      pushError(errors, path, `"type" must be one of: ${TYPES.join(', ')} (or an array of them)`)
    }

    if (isArray(schema.type) && schema.type.length === 0) {
      pushError(errors, path, '"type" array must not be empty')
    }
  }

  if (schema.required !== undefined) {
    if (!isArray(schema.required) || !schema.required.every(isString)) {
      pushError(errors, path, '"required" must be an array of strings')
    } else if (new Set(schema.required).size !== schema.required.length) {
      pushError(errors, path, '"required" must not contain duplicates')
    }
  }

  if (schema.enum !== undefined) {
    if (!isArray(schema.enum) || schema.enum.length === 0) {
      pushError(errors, path, '"enum" must be a non-empty array')
    }
  }

  const simpleKeywords = ['minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf', 'minLength', 'maxLength', 'minItems', 'maxItems', 'uniqueItems', 'minProperties', 'maxProperties', 'pattern']

  for (const key of simpleKeywords) {
    if (schema[key] !== undefined) {
      validateValueKind(schema, key, errors, path)
    }
  }

  if (schema.additionalProperties !== undefined && !isBoolean(schema.additionalProperties) && !isObject(schema.additionalProperties)) {
    pushError(errors, path, '"additionalProperties" must be a boolean or a schema')
  }

  if (schema.properties !== undefined) {
    if (!isObject(schema.properties)) {
      pushError(errors, path, '"properties" must be an object')
    } else {
      Object.entries(schema.properties).forEach(([name, subschema]) => {
        validateSchemaNode(subschema, draftUsed, `${path}.properties.${name}`, errors, depth + 1)
      })
    }
  }

  if (schema.patternProperties !== undefined) {
    if (!isObject(schema.patternProperties)) {
      pushError(errors, path, '"patternProperties" must be an object')
    } else {
      Object.entries(schema.patternProperties).forEach(([name, subschema]) => {
        validateSchemaNode(subschema, draftUsed, `${path}.patternProperties.${name}`, errors, depth + 1)
      })
    }
  }

  if (schema.items !== undefined) {
    if (isBoolean(schema.items)) {
      // valid schema
    } else if (isObject(schema.items)) {
      validateSchemaNode(schema.items, draftUsed, `${path}.items`, errors, depth + 1)
    } else if (isArray(schema.items)) {
      if (isDraft2019Plus(draftUsed)) {
        pushError(errors, path, '"items" must be a schema (use "prefixItems" for a tuple) in this draft')
      } else {
        schema.items.forEach((subschema, index) => {
          validateSchemaNode(subschema, draftUsed, `${path}.items[${index}]`, errors, depth + 1)
        })
      }
    } else {
      pushError(errors, path, '"items" must be a schema or an array of schemas')
    }
  }

  if (schema.prefixItems !== undefined) {
    if (!isArray(schema.prefixItems)) {
      pushError(errors, path, '"prefixItems" must be an array of schemas')
    } else {
      schema.prefixItems.forEach((subschema, index) => {
        validateSchemaNode(subschema, draftUsed, `${path}.prefixItems[${index}]`, errors, depth + 1)
      })
    }
  }

  for (const key of ['contains', 'not', 'if', 'then', 'else']) {
    if (schema[key] !== undefined) {
      if (!isBoolean(schema[key]) && !isObject(schema[key])) {
        pushError(errors, path, `"${key}" must be a schema or a boolean`)
      } else {
        validateSchemaNode(schema[key], draftUsed, `${path}.${key}`, errors, depth + 1)
      }
    }
  }

  for (const key of ['oneOf', 'anyOf', 'allOf']) {
    if (schema[key] !== undefined) {
      if (!isArray(schema[key]) || schema[key].length === 0) {
        pushError(errors, path, `"${key}" must be a non-empty array of schemas`)
      } else {
        schema[key].forEach((subschema, index) => {
          validateSchemaNode(subschema, draftUsed, `${path}.${key}[${index}]`, errors, depth + 1)
        })
      }
    }
  }
}

/**
 * Validates a JSON Schema structurally.
 * @param {object|boolean} schema - The schema to validate
 * @param {string} [draft] - The JSON Schema draft the schema targets
 * @returns {{valid: boolean, errors: Array<{path: string, message: string}>}}
 */
export function validateSchema (schema, draft) {
  const errors = []
  validateSchemaNode(schema, draft, '#', errors, 0)
  return {
    valid: errors.length === 0,
    errors
  }
}

export default validateSchema
