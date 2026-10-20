import { mergeDeep } from '../helpers/utils.js'
import JsonWalker from '../json-walker.js'

class RefParser {
  constructor (options = {}) {
    this.options = Object.assign({
      detectRecursion: true,
      fetch: typeof fetch === 'function' ? fetch.bind(globalThis) : undefined,
      fetchOptions: {}
    }, options)

    this.refs = {}
    this.data = {}
    this.resources = {}
    this.root = null
    this.iterations = 0
    this.maxIterations = 1000
    this.cycles = []
    this.walker = new JsonWalker()
  }

  async dereference (schema) {
    this.root = schema
    this.indexResources(schema)
    await this.collectRefs(schema)

    while (this.iterations < this.maxIterations) {
      if (this.refsResolved()) {
        break
      }

      this.iterations++
      await this.collectRefs(schema)
    }

    const missingRefs = Object.entries(this.refs).filter(([key, value]) => value === null).map(([key]) => key)

    if (missingRefs.length) {
      console.warn('Missing refs:', JSON.stringify(missingRefs))
    }

    if (this.options.detectRecursion) {
      this.cycles = this.findRecursiveRefs(this.refs)
      this.markRecursiveSchemas()
    }
  }

  refsResolved () {
    return Object.values(this.refs).every((value) => {
      return value !== null
    })
  }

  /**
   * Traverses the given schema recursively and for each schema with $ref
   * add a new property in the this.refs object with key being the JSON Pointer to that schema.
   * If the ref has no value in data will be given a value of null. This value will be later
   * replaced in a future iteration. At that time the data will be available
   * @param schema
   * @param path
   */
  async collectRefs (schema, path = '#') {
    if (typeof schema !== 'object' || schema === null) {
      return
    }

    for (const [key, value] of Object.entries(schema)) {
      const nextPath = path ? `${path}/${key}` : `/${key}`

      if (this.hasRef(schema)) {
        const ref = schema['$ref']

        if (this.isExternalRef(ref) && this.lookup(ref) === null) {
          const uri = ref.split('#')[0]
          const resolvedSchema = await this.load(uri)
          this.indexResources(resolvedSchema, uri)
          this.resources[uri] = this.resources[uri] ?? resolvedSchema
          this.refs[ref] = this.lookup(ref)
          await this.collectRefs(resolvedSchema, nextPath)
        } else {
          this.refs[ref] = this.lookup(ref) ?? this.data[ref] ?? null
        }
      }

      this.data[path] = schema

      await this.collectRefs(value, nextPath)
    }
  }

  /**
   * Registers every $id and $anchor under its absolute URI. When the schema declares
   * any $id (or was loaded from a URI), all $ref values are rewritten to absolute URIs
   * so they resolve against the right base wherever they are expanded.
   * @param schema
   * @param baseUri URI the schema was loaded from, if any
   */
  indexResources (schema, baseUri = '') {
    // only keywords that hold subschemas are walked, so an $id inside an unknown keyword is ignored
    const schemaKeywords = [
      'additionalProperties', 'additionalItems', 'items', 'prefixItems', 'contains', 'not', 'if', 'then', 'else',
      'propertyNames', 'unevaluatedItems', 'unevaluatedProperties', 'contentSchema', 'allOf', 'anyOf', 'oneOf',
      'properties', '$defs', 'definitions', 'patternProperties', 'dependentSchemas', 'dependencies'
    ]
    const schemaMaps = ['properties', '$defs', 'definitions', 'patternProperties', 'dependentSchemas', 'dependencies']
    const strip = (uri) => uri.split('#')[0]

    const walk = (node, base, visit, isMap = false) => {
      if (!this.isObject(node)) {
        return
      }

      if (Array.isArray(node)) {
        node.forEach((child) => walk(child, base, visit))
        return
      }

      if (isMap) {
        // keys are names chosen by the author, not keywords
        Object.values(node).forEach((child) => walk(child, base, visit))
        return
      }

      const nodeBase = typeof node.$id === 'string' ? this.resolveUri(node.$id, base) : base

      visit(node, nodeBase)

      for (const [key, value] of Object.entries(node)) {
        if (schemaKeywords.includes(key)) {
          walk(value, nodeBase, visit, schemaMaps.includes(key))
        }
      }
    }

    let foundId = false

    walk(schema, baseUri, (node, base) => {
      if (typeof node.$id === 'string') {
        foundId = true
        this.resources[strip(base)] = node
      }

      if (typeof node.$anchor === 'string') {
        this.resources[strip(base) + '#' + node.$anchor] = node
      }
    })

    if (foundId || baseUri !== '') {
      walk(schema, baseUri, (node, base) => {
        if (this.hasRef(node)) {
          node.$ref = this.resolveUri(node.$ref, base)
        }
      })
    }
  }

  resolveUri (uri, base) {
    try {
      return new URL(uri, base || undefined).href
    } catch (error) {
      return uri
    }
  }

  /**
   * Finds the schema a $ref points to inside the registered resources, following
   * JSON Pointer escaping (~0, ~1) and percent-encoding. Returns null if not found.
   * @param ref
   */
  lookup (ref) {
    const hashIndex = ref.indexOf('#')
    const uri = hashIndex === -1 ? ref : ref.slice(0, hashIndex)
    const fragment = hashIndex === -1 ? '' : ref.slice(hashIndex + 1)
    const resource = uri === '' ? this.root : this.resources[uri]

    if (!this.isObject(resource)) {
      return null
    }

    let target = resource

    if (fragment === '') {
      return target
    }

    if (!fragment.startsWith('/')) {
      return this.resources[uri + '#' + fragment] ?? null
    }

    try {
      const tokens = fragment.slice(1).split('/').map((token) => {
        return decodeURIComponent(token).replace(/~1/g, '/').replace(/~0/g, '~')
      })

      for (const token of tokens) {
        target = this.isObject(target) ? target[token] : undefined
      }
    } catch (error) {
      return null
    }

    return target === undefined ? null : target
  }

  hasRef (schema) {
    return typeof schema['$ref'] !== 'undefined' && typeof schema['$ref'] === 'string'
  }

  isExternalRef (ref) {
    if (typeof ref !== 'string') {
      return false
    }

    return ref.startsWith('http') || ref.startsWith('https')
  }

  isObject (value) {
    return value !== null && typeof value === 'object'
  }

  findRecursiveRefs (defs) {
    const cycles = new Set()

    function checkRef (path, visited, stack) {
      if (visited.has(path)) {
        const cycleStartIndex = stack.indexOf(path)
        if (cycleStartIndex !== -1) {
          const cyclePath = stack.slice(cycleStartIndex).concat(path) // Close the cycle

          // Normalize cycle to avoid duplicates
          const minIndex = cyclePath.reduce((minIdx, ref, idx) =>
            ref < cyclePath[minIdx] ? idx : minIdx, 0)
          const normalizedCycle = [...cyclePath.slice(minIndex), ...cyclePath.slice(0, minIndex)]
          const cycleSignature = normalizedCycle.join(' → ')

          cycles.add(cycleSignature)
        }
        return
      }
      if (!defs[path]) return

      visited.add(path)
      stack.push(path)

      function traverse (value) {
        if (typeof value === 'object' && value !== null) {
          if (value.$ref) checkRef(value.$ref, visited, stack)
          for (const key in value) traverse(value[key])
        }
      }

      traverse(defs[path])

      visited.delete(path)
      stack.pop()
    }

    for (const key in defs) {
      checkRef(key, new Set(), [])
    }

    return [...cycles] // Convert Set back to array for output
  }

  hasRefCycles () {
    return this.options.detectRecursion && this.cycles.length > 0
  }

  markRecursiveSchemas () {
    const cycleRefs = new Set()

    // Extract all refs that are part of cycles
    this.cycles.forEach(cycle => {
      cycle.split(' → ').forEach(ref => cycleRefs.add(ref))
    })

    // Mark schemas with $refs pointing to cycle members
    for (const schema of Object.values(this.data)) {
      if (schema && schema.$ref && cycleRefs.has(schema.$ref)) {
        schema['x-recursive'] = true
      }
    }
  }

  expand (schema) {
    const cloneSchema = JSON.parse(JSON.stringify(schema))

    if (this.isObject(cloneSchema) && this.hasRef(cloneSchema)) {
      const ref = cloneSchema.$ref
      delete cloneSchema['$ref']
      const target = this.refs[ref]

      if (target === false) {
        return { ...cloneSchema, not: {} }
      }

      if (target === true) {
        return this.expand(cloneSchema)
      }

      return this.expand(mergeDeep({}, target, cloneSchema))
    }

    return cloneSchema
  }

  expandRecursive (schema) {
    let mustContinue = true

    while (mustContinue) {
      mustContinue = false

      this.walker.traverse(schema, (node, path, parent, key) => {
        if (node.$ref && typeof node.$ref === 'string' && parent && key !== null) {
          parent[key] = this.expand(node)
          mustContinue = true
        }
      })
    }
  }

  /**
   * Loads a schema over HTTP. Uses options.fetch (defaults to the global fetch) and
   * options.fetchOptions, so callers needing auth (e.g. forwarding a session cookie
   * server-side) can supply headers/credentials, or swap in a custom fetch entirely.
   * @param uri
   * @returns {any}
   */
  async load (uri) {
    try {
      const response = await this.options.fetch(uri, this.options.fetchOptions)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return await response.json()
    } catch (error) {
      console.error('Error loading', uri, error)
      throw error
    }
  }
}

export default RefParser
