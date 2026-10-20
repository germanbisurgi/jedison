import { hasOwn, isArray, isBoolean, isObject, isString } from './utils.js'

// keywords whose value is a subschema, a list of subschemas or a map of subschemas
export const SCHEMA_KEYWORDS = [
  'additionalProperties', 'additionalItems', 'items', 'prefixItems', 'contains', 'not', 'if', 'then', 'else',
  'propertyNames', 'unevaluatedItems', 'unevaluatedProperties', 'contentSchema', 'allOf', 'anyOf', 'oneOf',
  'properties', '$defs', 'definitions', 'patternProperties', 'dependentSchemas', 'dependencies'
]

export const SCHEMA_MAPS = ['properties', '$defs', 'definitions', 'patternProperties', 'dependentSchemas', 'dependencies']

// keyed without the scheme, "http" and "https" both appear in the wild
const DRAFTS = {
  'json-schema.org/draft-04/schema': 4,
  'json-schema.org/draft-06/schema': 6,
  'json-schema.org/draft-07/schema': 7,
  'json-schema.org/draft/2019-09/schema': 2019,
  'json-schema.org/draft/2020-12/schema': 2020
}

/**
 * Returns the draft number a schema declares with $schema (4, 6, 7, 2019 or 2020).
 * Schemas without a known $schema are treated as 2020-12.
 */
export function getDraft (schema) {
  if (!isObject(schema) || !isString(schema.$schema)) {
    return 2020
  }

  return DRAFTS[schema.$schema.replace(/^https?:\/\//, '').replace(/#$/, '')] ?? 2020
}

function normalizeNode (node, draft) {
  // draft 4: "id" instead of "$id", and a fragment-only id is an anchor
  if (draft === 4 && isString(node.id) && !hasOwn(node, '$id')) {
    node.$id = node.id
    delete node.id
  }

  if (draft <= 7 && isString(node.$id) && node.$id.startsWith('#')) {
    node.$anchor = node.$id.slice(1)
    delete node.$id
  }

  // an empty reference is the same as "#", which the recursion detection understands
  if (node.$ref === '') {
    node.$ref = '#'
  }

  // pointers into a converted "items" list now point into "prefixItems"
  if (isString(node.$ref) && node.$ref.includes('#')) {
    const hashIndex = node.$ref.indexOf('#')
    const fragment = node.$ref.slice(hashIndex).replace(/\/items\/([0-9]+)(?=\/|$)/g, '/prefixItems/$1')

    node.$ref = node.$ref.slice(0, hashIndex) + fragment
  }

  // draft 4: exclusiveMinimum/exclusiveMaximum are booleans modifying minimum/maximum
  if (draft === 4) {
    [['exclusiveMinimum', 'minimum'], ['exclusiveMaximum', 'maximum']].forEach(([exclusive, limit]) => {
      if (isBoolean(node[exclusive])) {
        if (node[exclusive] && hasOwn(node, limit)) {
          node[exclusive] = node[limit]
          delete node[limit]
        } else {
          delete node[exclusive]
        }
      }
    })
  }

  // The keywords below do not exist in 2020-12, so they are converted whatever $schema says:
  // "items" as a list with "additionalItems" after it
  if (isArray(node.items)) {
    node.prefixItems = node.items

    if (hasOwn(node, 'additionalItems')) {
      node.items = node.additionalItems
    } else {
      delete node.items
    }
  }

  delete node.additionalItems

  // "dependencies" holding both property lists and schemas
  if (isObject(node.dependencies)) {
    Object.entries(node.dependencies).forEach(([name, dependency]) => {
      const target = isArray(dependency) ? 'dependentRequired' : 'dependentSchemas'
      node[target] = node[target] ?? {}
      node[target][name] = dependency
    })

    delete node.dependencies
  }
}

function walk (node, draft, isMap = false) {
  if (isArray(node)) {
    node.forEach((child) => walk(child, draft))
    return
  }

  if (!isObject(node)) {
    return
  }

  if (isMap) {
    Object.values(node).forEach((child) => walk(child, draft))
    return
  }

  normalizeNode(node, draft)

  SCHEMA_KEYWORDS.forEach((keyword) => {
    if (hasOwn(node, keyword)) {
      walk(node[keyword], draft, SCHEMA_MAPS.includes(keyword))
    }
  })
}

/**
 * Rewrites a schema written for draft 4, 6, 7 or 2019-09 into the 2020-12 shape, in place.
 * The $schema keyword picks the draft, which only matters for keywords that changed meaning.
 */
export function normalizeSchema (schema, draft = getDraft(schema)) {
  walk(schema, draft)

  return schema
}
