import { isString, isArray, isNumber, isInteger, isBoolean, isObject, isSet, clone } from './utils.js'
import { getAliasesFor } from './option-aliases.js'

export function getSchemaX (schema, keyword) {
  const key = 'x-' + keyword
  return schema[key]
}

export function getSchemaSchema (schema) {
  return isString(schema.$schema) ? clone(schema.$schema) : undefined
}

export function getSchemaAdditionalProperties (schema) {
  return isObject(schema.additionalProperties) || isBoolean(schema.additionalProperties) ? clone(schema.additionalProperties) : undefined
}

export function getSchemaPropertyNames (schema) {
  return isObject(schema.propertyNames) || isBoolean(schema.propertyNames) ? clone(schema.propertyNames) : undefined
}

export function getSchemaAllOf (schema) {
  return isArray(schema.allOf) ? clone(schema.allOf) : undefined
}

export function getSchemaAnyOf (schema) {
  return isArray(schema.anyOf) ? clone(schema.anyOf) : undefined
}

export function getSchemaConst (schema) {
  return clone(schema.const)
}

export function getSchemaContains (schema) {
  return (isObject(schema.contains) || isBoolean(schema.contains)) ? clone(schema.contains) : undefined
}

export function getSchemaDefault (schema) {
  return clone(schema.default)
}

export function getSchemaDependentRequired (schema) {
  return isObject(schema.dependentRequired) ? clone(schema.dependentRequired) : undefined
}

export function getSchemaDependentSchemas (schema) {
  return isObject(schema.dependentSchemas) ? clone(schema.dependentSchemas) : undefined
}

export function getSchemaDescription (schema) {
  return isString(schema.description) ? clone(schema.description) : undefined
}

export function getSchemaElse (schema) {
  return (isObject(schema.else) || isBoolean(schema.else)) ? clone(schema.else) : undefined
}

export function getSchemaEnum (schema) {
  if (isArray(schema.enum) && schema.enum.length > 0) {
    return clone(schema.enum)
  }

  return undefined
}

export function getSchemaExclusiveMaximum (schema) {
  return isNumber(schema.exclusiveMaximum) ? clone(schema.exclusiveMaximum) : undefined
}

export function getSchemaExclusiveMinimum (schema) {
  return isNumber(schema.exclusiveMinimum) ? schema.exclusiveMinimum : undefined
}

export function getSchemaFormat (schema) {
  return isString(schema.format) ? clone(schema.format) : undefined
}

export function getSchemaIf (schema) {
  if (isObject(schema.if)) {
    return clone(schema.if)
  }

  if (isBoolean(schema.if)) {
    return clone(schema.if)
  }

  return undefined
}

export function getSchemaItems (schema) {
  return isObject(schema.items) || isBoolean(schema.items) ? clone(schema.items) : undefined
}

export function getSchemaMaximum (schema) {
  return isNumber(schema.maximum) ? clone(schema.maximum) : undefined
}

export function getSchemaMaxContains (schema) {
  if (isInteger(schema.maxContains) && schema.maxContains >= 0) {
    return clone(schema.maxContains)
  }

  return undefined
}

export function getSchemaMaxItems (schema) {
  if (isInteger(schema.maxItems) && schema.maxItems >= 0) {
    return clone(schema.maxItems)
  }

  return undefined
}

export function getSchemaMaxLength (schema) {
  if (isInteger(schema.maxLength) && schema.maxLength >= 0) {
    return clone(schema.maxLength)
  }

  return undefined
}

export function getSchemaMaxProperties (schema) {
  if (isInteger(schema.maxProperties)) {
    return clone(schema.maxProperties)
  }

  return undefined
}

export function getSchemaMinimum (schema) {
  return isNumber(schema.minimum) ? clone(schema.minimum) : undefined
}

export function getSchemaMinContains (schema) {
  if (isInteger(schema.minContains) && schema.minContains >= 0) {
    return clone(schema.minContains)
  }

  return undefined
}

export function getSchemaMinItems (schema) {
  if (isInteger(schema.minItems) && schema.minItems >= 0) {
    return clone(schema.minItems)
  }

  return undefined
}

export function getSchemaMinLength (schema) {
  if (isInteger(schema.minLength) && schema.minLength >= 0) {
    return clone(schema.minLength)
  }

  return undefined
}

export function getSchemaMinProperties (schema) {
  if (isInteger(schema.minProperties) && schema.minProperties >= 0) {
    return clone(schema.minProperties)
  }

  return undefined
}

export function getSchemaMultipleOf (schema) {
  if (isNumber(schema.multipleOf) && schema.multipleOf >= 0) {
    return clone(schema.multipleOf)
  }

  return undefined
}

export function getSchemaNot (schema) {
  return (isObject(schema.not) || isBoolean(schema.not)) ? clone(schema.not) : undefined
}

export function getSchemaXOption (schema, option) {
  const xOption = 'x-' + option

  if (isSet(schema[xOption])) {
    return schema[xOption]
  }

  if (schema['x-options'] && isSet(schema['x-options'][option])) {
    return schema['x-options'][option]
  }

  // Fall back to deprecated names
  for (const alias of getAliasesFor(option)) {
    const xAlias = 'x-' + alias
    if (isSet(schema[xAlias])) {
      console.warn(`Jedison: schema option "${xAlias}" is deprecated. Use "${xOption}" instead.`)
      return schema[xAlias]
    }
    if (schema['x-options'] && isSet(schema['x-options'][alias])) {
      console.warn(`Jedison: schema x-options.${alias} is deprecated. Use x-options.${option} instead.`)
      return schema['x-options'][alias]
    }
  }

  return undefined
}

export function getSchemaPattern (schema) {
  return isString(schema.pattern) ? clone(schema.pattern) : undefined
}

export function getSchemaPatternProperties (schema) {
  return isObject(schema.patternProperties) ? clone(schema.patternProperties) : undefined
}

export function getSchemaPrefixItems (schema) {
  return isArray(schema.prefixItems) ? clone(schema.prefixItems) : undefined
}

export function getSchemaProperties (schema) {
  return isObject(schema.properties) ? clone(schema.properties) : undefined
}

export function getSchemaReadOnly (schema) {
  return isBoolean(schema.readOnly) ? clone(schema.readOnly) : undefined
}

export function getSchemaRequired (schema) {
  return isArray(schema.required) ? [...new Set(schema.required)] : undefined
}

export function getSchemaThen (schema) {
  return (isObject(schema.then) || isBoolean(schema.then)) ? clone(schema.then) : undefined
}

export function getSchemaTitle (schema) {
  return isString(schema.title) ? clone(schema.title) : undefined
}

export function getSchemaType (schema) {
  if (isString(schema.type) || isArray(schema.type)) {
    return clone(schema.type)
  }

  return undefined
}

export function getSchemaOneOf (schema) {
  return isArray(schema.oneOf) ? clone(schema.oneOf) : undefined
}

export function getSchemaUnevaluatedProperties (schema) {
  return isBoolean(schema.unevaluatedProperties) ? clone(schema.unevaluatedProperties) : undefined
}

export function getSchemaUniqueItems (schema) {
  return isBoolean(schema.uniqueItems) ? clone(schema.uniqueItems) : undefined
}

export default {
  getSchemaX,
  getSchemaSchema,
  getSchemaAdditionalProperties,
  getSchemaPropertyNames,
  getSchemaAllOf,
  getSchemaAnyOf,
  getSchemaConst,
  getSchemaContains,
  getSchemaDefault,
  getSchemaDependentRequired,
  getSchemaDependentSchemas,
  getSchemaDescription,
  getSchemaElse,
  getSchemaEnum,
  getSchemaExclusiveMaximum,
  getSchemaExclusiveMinimum,
  getSchemaFormat,
  getSchemaIf,
  getSchemaItems,
  getSchemaMaximum,
  getSchemaMaxContains,
  getSchemaMaxItems,
  getSchemaMaxLength,
  getSchemaMaxProperties,
  getSchemaMinimum,
  getSchemaMinContains,
  getSchemaMinItems,
  getSchemaMinLength,
  getSchemaMinProperties,
  getSchemaMultipleOf,
  getSchemaNot,
  getSchemaXOption,
  getSchemaPattern,
  getSchemaPatternProperties,
  getSchemaPrefixItems,
  getSchemaProperties,
  getSchemaReadOnly,
  getSchemaRequired,
  getSchemaThen,
  getSchemaTitle,
  getSchemaType,
  getSchemaOneOf,
  getSchemaUnevaluatedProperties,
  getSchemaUniqueItems
}
