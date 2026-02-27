/**
 * Utils.
 * @module utils
 */

/**
 * Returns a clone of a thing.
 * Optimized for JSON-compatible types (no Date, Map, Set, functions).
 * Primitives are returned as-is (immutable).
 * @param {*} thing - The thing to be cloned
 * @return {*} The clone of the thing
 */
export function clone (thing) {
  if (thing === null || typeof thing !== 'object') {
    return thing
  }

  if (Array.isArray(thing)) {
    const len = thing.length
    const arr = new Array(len)
    for (let i = 0; i < len; i++) {
      const item = thing[i]
      arr[i] = (item === null || typeof item !== 'object') ? item : clone(item)
    }
    return arr
  }

  const keys = Object.keys(thing)
  const obj = {}
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    const val = thing[key]
    const cloned = (val === null || typeof val !== 'object') ? val : clone(val)
    if (key === '__proto__') {
      Object.defineProperty(obj, key, { value: cloned, writable: true, enumerable: true, configurable: true })
    } else {
      obj[key] = cloned
    }
  }
  return obj
}

/**
 * Returns escaped regexp
 * @param {string} string - The string
 * @return {string} Escaped regexp
 */
export function escapeRegExp (string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

/**
 * Multiple search and replace
 * @param {string} str - The string
 * @param {string} find - The part to be replaced
 * @param {string} replace - The replacement
 * @return {void}
 */
export function replaceAll (str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace)
}

/**
 * Formats a json path to be used as an html attribute value
 * @param {string} path - The json path
 * @return {string}
 */
export function pathToAttribute (path) {
  return replaceAll(replaceAll(path, '#', 'root'), '/', '-')
}

/**
 * Returns true if a given object has a given property
 * @param {object} obj - The object
 * @param {string} prop - The property
 * @return {boolean}
 */
export function hasOwn (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

/**
 * Sort object properties
 * @param {object} obj - The object
 * @return {object}
 */
export function sortObject (obj) {
  return Object.keys(obj).sort().reduce((result, key) => {
    result[key] = obj[key]
    return result
  }, {})
}

/**
 * Returns true if the two values passed are equal
 * @param {*} a - Value A
 * @param {*} b - Value B
 * @return {boolean}
 */
export function equal (a, b) {
  if (a === b) return true

  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false
  }

  const aIsArray = Array.isArray(a)
  const bIsArray = Array.isArray(b)

  if (aIsArray !== bIsArray) return false

  if (aIsArray) {
    const len = a.length
    if (len !== b.length) return false
    for (let i = 0; i < len; i++) {
      if (!equal(a[i], b[i])) return false
    }
    return true
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false

  for (let i = 0, len = keysA.length; i < len; i++) {
    const key = keysA[i]
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false
    if (!equal(a[key], b[key])) return false
  }
  return true
}

/**
 * Returns true if the two values passed are different
 * @param {*} a - Value A
 * @param {*} b - Value B
 * @return {boolean}
 */
export function different (a, b) {
  return !equal(a, b)
}

/**
 * Returns true if the value passed is null
 * @param {*} value - The value
 * @return {boolean}
 */
export function isNull (value) {
  return value === null
}

/**
 * Returns true if the value is defined
 * @param {*} value - The value
 * @return {boolean}
 */
export function isSet (value) {
  return typeof value !== 'undefined'
}

/**
 * Returns true if the value is undefined
 * @param {*} value - The value
 * @return {boolean}
 */
export function notSet (value) {
  return typeof value === 'undefined'
}

/**
 * Returns true if the value passed is a number
 * @param {*} value - The value
 * @return {boolean}
 */
export function isNumber (value) {
  return typeof value === 'number'
}

/**
 * Returns true if the value passed is an integer
 * @param {*} value - The value
 * @return {boolean}
 */
export function isInteger (value) {
  return isNumber(value) && value === Math.floor(value)
}

/**
 * Returns true if the value passed is a string
 * @param {*} value - The value
 * @return {boolean}
 */
export function isString (value) {
  return typeof value === 'string'
}

/**
 * Returns true if the value passed is a boolean
 * @param {*} value - The value
 * @return {boolean}
 */
export function isBoolean (value) {
  return typeof value === 'boolean'
}

/**
 * Returns true if the value passed is an array
 * @param {*} value - The value
 * @return {boolean}
 */
export function isArray (value) {
  return Array.isArray(value)
}

/**
 * Returns true if the value passed is an object
 * @param {*} value - The value
 * @return {boolean}
 */
export function isObject (value) {
  return !isNull(value) && !isArray(value) && typeof value === 'object'
}

/**
 * Returns the type of a value
 * @param {*} value - The value
 * @return {string} The type of the value
 */
export function getType (value) {
  let type = 'any'

  if (isNumber(value)) {
    type = isInteger(value) ? 'integer' : 'number'
  } else if (isString(value)) {
    type = 'string'
  } else if (isBoolean(value)) {
    type = 'boolean'
  } else if (isArray(value)) {
    type = 'array'
  } else if (isNull(value)) {
    type = 'null'
  } else if (isObject(value)) {
    type = 'object'
  }

  return type
}

/**
 * Merges objects
 * @param {object} target - The target object
 * @param {object[]} sources - Objects to be merged into the target object
 * @return {object} The merged object
 */
export function mergeDeep (target, ...sources) {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, {
            [key]: {}
          })
        }
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, {
          [key]: source[key]
        })
      }
    })
  }
  return mergeDeep(target, ...sources)
}

export function combineDeep (target, ...sources) {
  if (!sources.length) return target
  const source = sources.shift()

  if (Array.isArray(target) && Array.isArray(source)) {
    // Concatenate arrays instead of replacing them
    target.push(...source)
  } else if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, {
            [key]: {}
          })
        }
        combineDeep(target[key], source[key])
      } else if (Array.isArray(source[key])) {
        // Handle array merging here
        if (!target[key]) {
          target[key] = []
        }
        target[key].push(...source[key])
      } else {
        Object.assign(target, {
          [key]: source[key]
        })
      }
    })
  }

  return combineDeep(target, ...sources)
}

/**
 * Merges objects but only the properties that exist in both objects
 * if they are the same type of value.
 * Handles nested objects recursively.
 * @param {object} obj1 - The target object
 * @param {object} obj2 - Object whose properties are the overrides
 * @return {object} The overwritten object
 */
export const overwriteExistingProperties = (obj1, obj2) => {
  Object.keys(obj2).forEach((key) => {
    if (key in obj1) {
      if (
        isSet(obj1[key]) &&
        isSet(obj2[key]) && (
          (isObject(obj1[key]) && isObject(obj2[key])) ||
          (isArray(obj1[key]) && isArray(obj2[key])) ||
          (isString(obj1[key]) && isString(obj2[key])) ||
          (isNumber(obj1[key]) && isNumber(obj2[key])) ||
          (isBoolean(obj1[key]) && isBoolean(obj2[key])) ||
          (isNull(obj1[key]) && isNull(obj2[key]))
        )
      ) {
        if (isObject(obj1[key]) && isObject(obj2[key])) {
          overwriteExistingProperties(obj1[key], obj2[key])
        } else {
          obj1[key] = obj2[key]
        }
      }
    }
  })

  return obj1
}

/**
 * Get some value by traversing the data using JSON path
 * @param {object} data - The data source
 * @param {string} path - JSON path
 * @return {*}
 */
export function getValueByJSONPath (data, path) {
  const keys = path.split('.') // Split the path into individual keys

  let value = data
  for (const key of keys) {
    if (Array.isArray(value) && /^\d+$/.test(key)) {
      const index = parseInt(key)
      if (index >= 0 && index < value.length) {
        value = value[index]
      } else {
        return undefined // Index is out of bounds, return undefined
      }
    } else if (hasOwn(value, key)) {
      value = value[key]
    } else {
      return undefined // Key doesn't exist, return undefined
    }
  }

  return value
}

/**
 * Compiles a template by search and replace
 * @param {string} template - The template string
 * @param {object} data - Where template data lives
 * @return {string}
 */
export function compileTemplate (template, data) {
  return template.replace(/{{(.*?)}}/g, (match) => {
    match = match.replace(/\s/g, '')
    const path = match.split(/{{|}}/)[1]
    return getValueByJSONPath(data, path)
  })
}

export function clamp (number, min, max) {
  return Math.max(min, Math.min(number, max))
}

export function removeDuplicatesFromArray (arr) {
  const uniqueObjects = []
  const uniqueValues = new Set()

  for (const obj of arr) {
    const objString = JSON.stringify(obj)
    if (!uniqueValues.has(objString)) {
      uniqueValues.add(objString)
      uniqueObjects.push(obj)
    }
  }

  return uniqueObjects
}

export function generateRandomID (maxLength) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomID = ''
  for (let i = 0; i < maxLength; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    randomID += chars[randomIndex]
  }
  return randomID
}

export default {
  clone,
  escapeRegExp,
  replaceAll,
  pathToAttribute,
  hasOwn,
  sortObject,
  equal,
  different,
  isNull,
  isSet,
  notSet,
  isNumber,
  isInteger,
  isString,
  isBoolean,
  isArray,
  isObject,
  getType,
  mergeDeep,
  combineDeep,
  overwriteExistingProperties,
  getValueByJSONPath,
  compileTemplate,
  clamp,
  removeDuplicatesFromArray,
  generateRandomID
}
