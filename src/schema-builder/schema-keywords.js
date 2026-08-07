export const DRAFTS = [
  { value: 'http://json-schema.org/draft-04/schema#', label: 'draft-04' },
  { value: 'http://json-schema.org/draft-06/schema#', label: 'draft-06' },
  { value: 'http://json-schema.org/draft-07/schema#', label: 'draft-07' },
  { value: 'https://json-schema.org/draft/2019-09/schema', label: '2019-09' },
  { value: 'https://json-schema.org/draft/2020-12/schema', label: '2020-12' }
]

export const TYPES = ['string', 'number', 'integer', 'boolean', 'object', 'array', 'null']

export const SCALAR_TYPES = ['string', 'number', 'integer', 'boolean', 'null']

export const STRUCTURED_TYPES = ['object', 'array']

export function isStructuredType (type) {
  return STRUCTURED_TYPES.includes(type)
}

export const TYPE_LABELS = {
  string: 'string',
  number: 'number',
  integer: 'integer',
  boolean: 'boolean',
  object: 'object',
  array: 'array',
  null: 'null'
}

const STRING_CONSTRAINTS = ['minLength', 'maxLength', 'pattern']
const NUMBER_CONSTRAINTS = ['minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf']
const OBJECT_CONSTRAINTS = ['additionalProperties', 'minProperties', 'maxProperties']
const ARRAY_CONSTRAINTS = ['minItems', 'maxItems', 'uniqueItems']
const VALUE_KEYWORDS = ['default', 'const', 'enum']
const COMPOSITION_KEYWORDS = ['oneOf', 'anyOf', 'allOf', 'not', 'if', 'then', 'else']
const ARRAY_KEYWORDS = ['items', 'prefixItems']

export const KEYWORD_LABELS = {
  title: 'Title',
  description: 'Description',
  format: 'Format',
  $ref: '$ref',
  type: 'Type',
  default: 'Default',
  const: 'Const',
  enum: 'Enum',
  minLength: 'Min length',
  maxLength: 'Max length',
  pattern: 'Pattern',
  minimum: 'Minimum',
  maximum: 'Maximum',
  exclusiveMinimum: 'Exclusive minimum',
  exclusiveMaximum: 'Exclusive maximum',
  multipleOf: 'Multiple of',
  minItems: 'Min items',
  maxItems: 'Max items',
  uniqueItems: 'Unique items',
  items: 'Items',
  prefixItems: 'Prefix items',
  additionalProperties: 'Additional properties',
  minProperties: 'Min properties',
  maxProperties: 'Max properties',
  oneOf: 'oneOf',
  anyOf: 'anyOf',
  allOf: 'allOf',
  not: 'not',
  if: 'if',
  then: 'then',
  else: 'else'
}

export function isDraft2019Plus (draft) {
  return draft === 'https://json-schema.org/draft/2019-09/schema' || draft === 'https://json-schema.org/draft/2020-12/schema'
}

export function getConstraintsForType (type) {
  switch (type) {
    case 'string':
      return STRING_CONSTRAINTS
    case 'number':
    case 'integer':
      return NUMBER_CONSTRAINTS
    case 'object':
      return OBJECT_CONSTRAINTS
    case 'array':
      return ARRAY_CONSTRAINTS
    default:
      return []
  }
}

export function getValueKeywords () {
  return VALUE_KEYWORDS
}

export function getCompositionKeywords () {
  return COMPOSITION_KEYWORDS
}

export function getArrayKeywords () {
  return ARRAY_KEYWORDS
}

export function getKeywordKind (name, draft) {
  switch (name) {
    case 'title':
    case 'format':
    case '$ref':
    case 'pattern':
      return 'text'
    case 'description':
      return 'textarea'
    case 'minLength':
    case 'maxLength':
    case 'minItems':
    case 'maxItems':
    case 'minProperties':
    case 'maxProperties':
      return 'non-negative-integer'
    case 'multipleOf':
      return 'positive-number'
    case 'minimum':
    case 'maximum':
      return 'number'
    case 'exclusiveMinimum':
    case 'exclusiveMaximum':
      return isDraft2019Plus(draft) ? 'number' : 'boolean'
    case 'uniqueItems':
    case 'additionalProperties':
      return 'boolean'
    case 'default':
    case 'const':
    case 'enum':
    case 'oneOf':
    case 'anyOf':
    case 'allOf':
    case 'not':
    case 'if':
    case 'then':
    case 'else':
    case 'prefixItems':
      return 'json'
    default:
      return 'text'
  }
}

export default {
  DRAFTS,
  TYPES,
  SCALAR_TYPES,
  STRUCTURED_TYPES,
  TYPE_LABELS,
  KEYWORD_LABELS,
  isDraft2019Plus,
  isStructuredType,
  getConstraintsForType,
  getValueKeywords,
  getCompositionKeywords,
  getArrayKeywords,
  getKeywordKind
}
