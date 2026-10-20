import { allOf } from './constrains/allOf.js'
import { minLength } from './constrains/minLength.js'
import { _const } from './constrains/const.js'
import { contains } from './constrains/contains.js'
import { anyOf } from './constrains/anyOf.js'
import { dependentRequired } from './constrains/dependentRequired.js'
import { dependentSchemas } from './constrains/dependentSchemas.js'
import { _enum } from './constrains/enum.js'
import { exclusiveMaximum } from './constrains/exclusiveMaximum.js'
import { exclusiveMinimum } from './constrains/exclusiveMinimum.js'
import { format } from './constrains/format.js'
import { ifThenElse } from './constrains/if-then-else.js'
import { items } from './constrains/items.js'
import { maxItems } from './constrains/maxItems.js'
import { maxLength } from './constrains/maxLength.js'
import { maxProperties } from './constrains/maxProperties.js'
import { minimum } from './constrains/minimum.js'
import { minItems } from './constrains/minItems.js'
import { minProperties } from './constrains/minProperties.js'
import { multipleOf } from './constrains/multipleOf.js'
import { not } from './constrains/not.js'
import { oneOf } from './constrains/oneOf.js'
import { pattern } from './constrains/pattern.js'
import { patternProperties } from './constrains/patternProperties.js'
import { prefixItems } from './constrains/prefixItems.js'
import { propertyNames } from './constrains/propertyNames.js'
import { properties } from './constrains/properties.js'
import { required } from './constrains/required.js'
import { type } from './constrains/type.js'
import { maximum } from './constrains/maximum.js'
import { uniqueItems } from './constrains/uniqueItems.js'
import { additionalProperties } from './constrains/additionalProperties.js'
import { unevaluatedItems } from './constrains/unevaluatedItems.js'
import { unevaluatedProperties } from './constrains/unevaluatedProperties.js'

export default {
  additionalProperties: additionalProperties,
  allOf: allOf,
  anyOf: anyOf,
  const: _const,
  contains: contains,
  dependentRequired: dependentRequired,
  dependentSchemas: dependentSchemas,
  enum: _enum,
  exclusiveMaximum: exclusiveMaximum,
  exclusiveMinimum: exclusiveMinimum,
  format: format,
  if: ifThenElse,
  items: items,
  maximum: maximum,
  maxItems: maxItems,
  maxLength: maxLength,
  maxProperties: maxProperties,
  minimum: minimum,
  minItems: minItems,
  minLength: minLength,
  minProperties: minProperties,
  multipleOf: multipleOf,
  not: not,
  oneOf: oneOf,
  pattern: pattern,
  patternProperties: patternProperties,
  prefixItems: prefixItems,
  propertyNames: propertyNames,
  properties: properties,
  required: required,
  type: type,
  unevaluatedItems: unevaluatedItems,
  unevaluatedProperties: unevaluatedProperties,
  uniqueItems: uniqueItems
}
