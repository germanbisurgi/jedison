// applyOverlay — apply an OpenAPI-Overlay-style document to a JSON Schema.
//
// An overlay describes an ordered list of actions, each targeting nodes with a
// JSONPath (supported subset, see json-path.js) and either merging an `update`
// into them or `remove`-ing them. Presentation directives (x-format, x-hidden,
// …) can thus be layered on top of a schema WITHOUT editing the source schema.
//
//   const merged = applyOverlay(schema, overlay)
//
// Merge semantics follow the Overlay spec: object nodes deep-merge (nested
// objects recurse, arrays concatenate, primitives replace); array nodes
// concatenate (a non-array update is appended); primitive nodes are replaced.

import { clone, combineDeep, isObject, isArray } from './utils.js'
import { selectNodes } from './json-path.js'

function applyUpdate (nodeRef, update) {
  const { parent, key, value } = nodeRef
  const incoming = clone(update)

  if (isArray(value)) {
    if (isArray(incoming)) value.push(...incoming)
    else value.push(incoming)
    return
  }

  if (isObject(value) && isObject(incoming)) {
    combineDeep(value, incoming)
    return
  }

  // Primitive target (or type mismatch): replace in place.
  if (parent === null) {
    throw new Error('Jedison: overlay cannot replace the root schema with a non-object update.')
  }
  parent[key] = incoming
}

function applyRemove (nodes) {
  if (nodes.some((node) => node.parent === null)) {
    throw new Error('Jedison: overlay cannot remove the root schema.')
  }

  // Object properties: delete directly.
  nodes
    .filter((node) => node.parent && !isArray(node.parent))
    .forEach((node) => { delete node.parent[node.key] })

  // Array items: splice per array, highest index first, so indices stay valid.
  const arrayGroups = new Map()
  nodes
    .filter((node) => isArray(node.parent))
    .forEach((node) => {
      if (!arrayGroups.has(node.parent)) arrayGroups.set(node.parent, [])
      arrayGroups.get(node.parent).push(node.key)
    })
  arrayGroups.forEach((indices, array) => {
    indices.sort((a, b) => b - a).forEach((index) => array.splice(index, 1))
  })
}

/**
 * Applies an OpenAPI-Overlay-style document to a schema and returns a NEW schema.
 * The inputs are never mutated.
 * @param {object} schema - the target JSON Schema
 * @param {object} overlay - an overlay document: { overlay, info, actions: [...] }
 * @return {object} the merged schema
 */
export function applyOverlay (schema, overlay) {
  const result = clone(schema)

  if (overlay === null || typeof overlay === 'undefined') {
    return result
  }

  if (!isObject(overlay) || !isArray(overlay.actions)) {
    throw new Error('Jedison: overlay must be an object with an "actions" array.')
  }

  overlay.actions.forEach((action, index) => {
    if (!isObject(action) || typeof action.target !== 'string') {
      throw new Error(`Jedison: overlay action ${index} must be an object with a string "target".`)
    }

    const nodes = selectNodes(result, action.target)

    if (nodes.length === 0) return // zero matches: action succeeds without change

    if (action.remove === true) {
      applyRemove(nodes)
    } else if (typeof action.update !== 'undefined') {
      nodes.forEach((node) => applyUpdate(node, action.update))
    }
    // `copy`/`extends` are accepted but ignored in this MVP.
  })

  return result
}
