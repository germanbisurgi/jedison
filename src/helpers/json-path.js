// A small, dependency-free JSONPath SUBSET used by the overlay engine to target
// nodes in a JSON Schema document (RFC 9535 shape, but intentionally partial).
//
// Supported:
//   $                     root
//   .name  ['name'] ["name"]   child by name (bracket form allows any key)
//   [n]                   array index (negative allowed, counts from the end)
//   *  .*  [*]            wildcard (all children of an object or array)
//   ..                    recursive descent (descendant segment)
//   ['a','b']  [0,1]      unions of names / indices
//
// Deliberately NOT supported (throws): filter expressions [?...], array slices
// [start:end], and function extensions like length(). Full RFC 9535 is a
// separate undertaking; failing loudly keeps behaviour predictable.

function isObject (value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isContainer (value) {
  return value !== null && typeof value === 'object'
}

function unsupported (path, detail) {
  throw new Error(`Jedison: unsupported JSONPath "${path}" — ${detail}. Supported: $, .name, ['name'], [n], *, and .. (no filters, slices, or functions).`)
}

// Splits bracket content on top-level commas, respecting quoted strings.
function splitUnion (content) {
  const parts = []
  let current = ''
  let quote = null

  for (let i = 0; i < content.length; i++) {
    const char = content[i]
    if (quote) {
      if (char === quote) quote = null
      current += char
    } else if (char === "'" || char === '"') {
      quote = char
      current += char
    } else if (char === ',') {
      parts.push(current)
      current = ''
    } else {
      current += char
    }
  }
  parts.push(current)
  return parts
}

// Parses the content of a [...] segment into a list of selectors.
function parseBracket (content, path) {
  const trimmed = content.trim()

  if (trimmed === '*') {
    return [{ type: 'wildcard' }]
  }

  if (trimmed.includes('?')) unsupported(path, 'filter expressions are not supported')
  if (trimmed.includes('(')) unsupported(path, 'function extensions are not supported')

  return splitUnion(trimmed).map((raw) => {
    const part = raw.trim()

    if ((part.startsWith("'") && part.endsWith("'")) || (part.startsWith('"') && part.endsWith('"'))) {
      return { type: 'name', value: part.slice(1, -1) }
    }

    if (/^-?\d+$/.test(part)) {
      return { type: 'index', value: parseInt(part, 10) }
    }

    if (part.includes(':')) unsupported(path, 'array slices are not supported')

    unsupported(path, `cannot parse selector "${part}"`)
  })
}

// Tokenises a JSONPath string into an ordered list of steps.
// Each step: { descendant: boolean, selectors: [...] }
function tokenize (path) {
  if (typeof path !== 'string' || path[0] !== '$') {
    unsupported(path, 'must start with "$"')
  }

  const steps = []
  let i = 1

  const readName = () => {
    const start = i
    while (i < path.length && path[i] !== '.' && path[i] !== '[') i++
    const name = path.slice(start, i)
    if (name === '') unsupported(path, 'empty name after "."')
    if (name.includes('(')) unsupported(path, 'function extensions are not supported')
    return name
  }

  const readDotSelector = (descendant) => {
    if (path[i] === '*') {
      i++
      steps.push({ descendant, selectors: [{ type: 'wildcard' }] })
    } else {
      steps.push({ descendant, selectors: [{ type: 'name', value: readName() }] })
    }
  }

  const readBracket = (descendant) => {
    i++ // skip '['
    let content = ''
    let quote = null
    while (i < path.length && (quote || path[i] !== ']')) {
      const char = path[i]
      if (quote) {
        if (char === quote) quote = null
      } else if (char === "'" || char === '"') {
        quote = char
      }
      content += char
      i++
    }
    if (path[i] !== ']') unsupported(path, 'unterminated "["')
    i++ // skip ']'
    steps.push({ descendant, selectors: parseBracket(content, path) })
  }

  while (i < path.length) {
    if (path[i] === '.' && path[i + 1] === '.') {
      i += 2
      if (path[i] === '[') readBracket(true)
      else readDotSelector(true)
    } else if (path[i] === '.') {
      i++
      readDotSelector(false)
    } else if (path[i] === '[') {
      readBracket(false)
    } else {
      unsupported(path, `unexpected character "${path[i]}"`)
    }
  }

  return steps
}

// Collects a node and all of its descendants as node references.
function withDescendants (nodeRef) {
  const list = [nodeRef]
  const walk = (container) => {
    if (Array.isArray(container)) {
      container.forEach((value, index) => {
        list.push({ parent: container, key: index, value })
        walk(value)
      })
    } else if (isObject(container)) {
      Object.keys(container).forEach((key) => {
        list.push({ parent: container, key, value: container[key] })
        walk(container[key])
      })
    }
  }
  walk(nodeRef.value)
  return list
}

// Applies a single selector to one container value, pushing matched node refs.
function applySelector (container, selector, out) {
  if (!isContainer(container)) return

  if (selector.type === 'wildcard') {
    if (Array.isArray(container)) {
      container.forEach((value, index) => out.push({ parent: container, key: index, value }))
    } else {
      Object.keys(container).forEach((key) => out.push({ parent: container, key, value: container[key] }))
    }
    return
  }

  if (selector.type === 'name') {
    if (isObject(container) && Object.prototype.hasOwnProperty.call(container, selector.value)) {
      out.push({ parent: container, key: selector.value, value: container[selector.value] })
    }
    return
  }

  if (selector.type === 'index') {
    if (Array.isArray(container)) {
      const index = selector.value < 0 ? container.length + selector.value : selector.value
      if (index >= 0 && index < container.length) {
        out.push({ parent: container, key: index, value: container[index] })
      }
    }
  }
}

/**
 * Selects nodes in `root` matching the JSONPath `path` (supported subset).
 * Returns an array of node references `{ parent, key, value }`. The root itself
 * is represented as `{ parent: null, key: null, value: root }` so callers can
 * detect and special-case it.
 * @param {*} root - the document to query (a JSON Schema)
 * @param {string} path - a JSONPath expression (subset)
 * @return {Array<{parent: (object|Array|null), key: (string|number|null), value: *}>}
 */
export function selectNodes (root, path) {
  const steps = tokenize(path)
  let current = [{ parent: null, key: null, value: root }]

  for (const step of steps) {
    const bases = step.descendant ? current.flatMap(withDescendants) : current
    const next = []
    for (const node of bases) {
      for (const selector of step.selectors) {
        applySelector(node.value, selector, next)
      }
    }
    current = next
  }

  return current
}
