import { mergeDeep } from '../helpers/utils.js'
import JsonWalker from '../json-walker.js'

class RefParser {
  constructor () {
    this.refs = {}
    this.data = {}
    this.iterations = 0
    this.maxIterations = 1000
    this.cycles = []
    this.walker = new JsonWalker()
  }

  async dereference (schema) {
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

    this.cycles = this.findRecursiveRefs(this.refs)
    this.markRecursiveSchemas()
  }

  refsResolved () {
    return Object.values(this.refs).every((value) => {
      return value !== null
    })
  }

  /**
   * Traverses the given schema recursively and for each schema with $ref
   * add a new property in the this.refs object with key being the json path to that schema.
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

        if (this.isExternalRef(ref)) {
          const resolvedSchema = await this.load(ref)
          this.refs[ref] = resolvedSchema
          await this.collectRefs(resolvedSchema, nextPath)
        } else {
          this.refs[ref] = this.data[ref] ?? null
        }
      }

      this.data[path] = schema

      await this.collectRefs(value, nextPath)
    }
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
    return this.cycles.length > 0
  }

  markRecursiveSchemas () {
    const cycleRefs = new Set()

    // Extract all refs that are part of cycles
    this.cycles.forEach(cycle => {
      cycle.split(' → ').forEach(ref => cycleRefs.add(ref))
    })

    // Mark schemas with $refs pointing to cycle members
    for (const [path, schema] of Object.entries(this.data)) {
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
      return this.expand(mergeDeep({}, this.refs[ref], cloneSchema))
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
   * Loads a schema with a synchronous http request
   * @param uri
   * @returns {any}
   */
  async load (uri) {
    try {
      const response = await fetch(uri)
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
