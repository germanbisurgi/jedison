import { mergeDeep } from '../helpers/utils.js'
import { SCHEMA_KEYWORDS, SCHEMA_MAPS, getDraft, normalizeSchema } from '../helpers/draft.js'
import JsonWalker from '../json-walker.js'

class RefParser {
  constructor (options = {}) {
    this.options = Object.assign({
      detectRecursion: true,
      fetch: typeof fetch === 'function' ? fetch.bind(globalThis) : undefined,
      fetchOptions: {},
      keepRefSiblings: false // up to draft 7 the siblings of $ref are ignored, true keeps them
    }, options)

    this.refs = {}
    this.data = {}
    this.resources = {}
    this.root = null
    this.draft = 2020
    this.iterations = 0
    this.maxIterations = 1000
    this.cycles = []
    this.walker = new JsonWalker()
  }

  async dereference (schema) {
    this.root = schema
    this.draft = getDraft(schema)
    normalizeSchema(schema, this.draft)
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
          const loaded = await this.load(uri)
          const resolvedSchema = normalizeSchema(loaded, loaded?.$schema ? getDraft(loaded) : this.draft)
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
    const schemaKeywords = SCHEMA_KEYWORDS
    const schemaMaps = SCHEMA_MAPS
    // a $ref next to an $id or $anchor makes them siblings that may have to be ignored
    const ignored = (node) => this.hasRef(node) && this.ignoresRefSiblings()
    const hasOwnId = (node) => typeof node.$id === 'string' && !ignored(node)
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

      const nodeBase = hasOwnId(node) ? this.resolveUri(node.$id, base) : base

      visit(node, nodeBase)

      for (const [key, value] of Object.entries(node)) {
        if (schemaKeywords.includes(key)) {
          walk(value, nodeBase, visit, schemaMaps.includes(key))
        }
      }
    }

    let foundId = false

    walk(schema, baseUri, (node, base) => {
      if (hasOwnId(node)) {
        foundId = true
        this.resources[strip(base)] = node
      }

      if (typeof node.$anchor === 'string' && !ignored(node)) {
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
        target = this.isObject(target) && Object.prototype.hasOwnProperty.call(target, token) ? target[token] : undefined
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

  ignoresRefSiblings () {
    return this.draft <= 7 && !this.options.keepRefSiblings
  }

  expand (schema, seen = new Set()) {
    const cloneSchema = JSON.parse(JSON.stringify(schema))

    if (this.isObject(cloneSchema) && this.hasRef(cloneSchema)) {
      const ref = cloneSchema.$ref

      // a chain of refs that leads back to itself would never end
      if (seen.has(ref)) {
        delete cloneSchema.$ref
        return cloneSchema
      }

      seen.add(ref)
      delete cloneSchema['$ref']
      const target = this.refs[ref]

      if (this.ignoresRefSiblings()) {
        Object.keys(cloneSchema).forEach((key) => delete cloneSchema[key])
      }

      if (target === false) {
        return { ...cloneSchema, not: {} }
      }

      if (target === true) {
        return this.expand(cloneSchema, seen)
      }

      return this.expand(mergeDeep({}, target, cloneSchema), seen)
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
