import Validator from './validation/validator.js'
import EventEmitter from './event-emitter.js'
import InstanceIfThenElse from './instances/if-then-else.js'
import InstanceMultiple from './instances/multiple.js'
import InstanceBoolean from './instances/boolean.js'
import InstanceObject from './instances/object.js'
import InstanceArray from './instances/array.js'
import InstanceString from './instances/string.js'
import InstanceNumber from './instances/number.js'
import InstanceNull from './instances/null.js'
import {
  clone, combineDeep,
  isArray, isObject,
  isSet,
  notSet
} from './helpers/utils.js'
import {
  getSchemaAnyOf,
  getSchemaIf,
  getSchemaOneOf,
  getSchemaType, getSchemaXOption
} from './helpers/schema.js'
import { bootstrapIcons, fontAwesome3, fontAwesome4, fontAwesome5, fontAwesome6, glyphicons } from './themes/icons/icons.js'
import UiResolver from './ui-resolver.js'
import Translator from './i18n/translator.js'
import JsonWalker from './json-walker.js'

/**
 * Represents a Jedison instance.
 */
class Jedison extends EventEmitter {
  /**
   * Creates a Jedison instance.
   * @param {object} options - Options object
   * @param {object|boolean} options.schema - A JSON schema
   * @param {boolean} options.container - Where the UI controls will be rendered
   */
  constructor (options) {
    super()

    this.options = Object.assign({
      container: null,
      iconLib: null,
      theme: null,
      refParser: null,
      editJsonData: false,
      enablePropertiesToggle: false,
      enableCollapseToggle: false,
      btnContents: true,
      btnIcons: true,
      arrayDelete: true,
      arrayMove: true,
      arrayAdd: true,
      arrayButtonsPosition: 'left',
      startCollapsed: false,
      deactivateNonRequired: false,
      schema: {},
      showErrors: 'change',
      switcherInput: 'select',
      data: undefined,
      assertFormat: false,
      customEditors: [],
      constraints: [],
      hiddenInputAttributes: {},
      id: '',
      radiosInline: false,
      language: 'en',
      translations: {},
      settings: {},
      useConstraintAttributes: true,
      useStringConstraintAttributes: false,
      parseMarkdown: false,
      purifyHtml: true,
      purifyData: true,
      domPurifyOptions: {},
      mergeAllOf: false,
      enforceConst: false,
      enforceRequired: true,
      enforceEnumDefault: true, // todo: deprecated
      enforceAdditionalProperties: true,
      enforceMinItems: true,
      enforceMaxItems: true,
      enforceEnum: true,
      debug: false
    }, options)

    /**
     * Roots symbol used in paths
     * @type {string}
     */
    this.rootName = '#'

    /**
     * Separator symbol used in paths
     * @type {string}
     */
    this.pathSeparator = '/'

    /**
     * List of registered instances
     * @type {object}
     */
    this.instances = new Map()

    /**
     * The root editor
     * @type {Jedison}
     */
    this.root = null

    /**
     * The Validator instance used to translate UI texts and error messages
     * @type {Translator}
     */
    this.translator = new Translator({
      language: this.options.language,
      translations: this.options.translations
    })

    /**
     * The Validator instance used to validate instance values
     * @type {Validator}
     */
    this.validator = null

    /**
     * A json schema used
     * @type {*}
     */
    this.schema = {}

    /**
     * A list of watched instances and their callbacks
     * @type {*}
     */
    this.watched = {}

    this.theme = null

    this.uiResolver = null

    /**
     * A RefParser instance
     * @type {RefParser}
     */
    this.refParser = this.options.refParser ? this.options.refParser : null

    this.walker = new JsonWalker()

    /**
     * The id of the last focused element.
     * Used to reapply focus to the element that was removed and re-appended to the DOM
     * @type String
     */
    this.lastFocusedId = null

    this.isEditor = false

    this.debug = false

    this.init()
    this.bindEventListeners()
    this.updateInstancesWatchedData()
  }

  /**
   * Initializes instance properties
   */
  init () {
    if (this.options.container) {
      this.isEditor = true
    }

    this.uiResolver = new UiResolver({
      customEditors: this.options.customEditors,
      refParser: this.refParser
    })

    this.theme = this.options.theme

    if (this.theme) {
      this.theme.btnContents = this.options.btnContents
      this.theme.btnIcons = this.options.btnIcons
    }

    if (isSet(this.options.iconLib)) {
      switch (this.options.iconLib) {
        case 'glyphicons':
          this.theme.icons = glyphicons
          break
        case 'bootstrap-icons':
          this.theme.icons = bootstrapIcons
          break
        case 'fontawesome3':
          this.theme.icons = fontAwesome3
          break
        case 'fontawesome4':
          this.theme.icons = fontAwesome4
          break
        case 'fontawesome5':
          this.theme.icons = fontAwesome5
          break
        case 'fontawesome6':
          this.theme.icons = fontAwesome6
          break
      }
    }

    this.schema = this.options.schema

    this.validator = new Validator({
      refParser: this.refParser,
      assertFormat: this.options.assertFormat,
      translator: this.translator,
      constraints: this.options.constraints
    })

    this.root = this.createInstance({
      jedison: this,
      schema: this.options.schema,
      path: this.rootName
    })

    if (isSet(this.options.data)) {
      this.root.setValue(this.options.data, false)
    }

    if (this.options.container) {
      this.isEditor = true
      this.container = this.options.container
      this.appendHiddenInput()
      this.container.appendChild(this.root.ui.control.container)
      this.container.classList.add('jedi-ready')
    }
  }

  bindEventListeners () {
    if (this.root) {
      this.root.on('change', (initiator) => {
        this.emit('change', initiator)
      })
    }

    this.on('instance-change', (instance) => {
      for (const [path, callbacks] of Object.entries(this.watched)) {
        if (instance.path === path) {
          callbacks.forEach((callback) => {
            callback()
          })
        }
      }
    })

    if (this.hiddenInput) {
      this.on('change', (initiator) => {
        this.hiddenInput.value = JSON.stringify(this.getValue())

        if (initiator === 'user') {
          setTimeout(() => {
            this.refreshFocus()
          }, 0)
        }
      })

      document.addEventListener('focus', (event) => {
        this.lastKeyEvent = null
        this.lastFocusedId = event.target.id
      }, true)

      document.addEventListener('keydown', (event) => {
        this.lastKeyEvent = event
      })
    }
  }

  updateInstancesWatchedData () {
    Object.values(this.watched).forEach((callbacks) => {
      callbacks.forEach((callback) => {
        callback()
      })
    })
  }

  /**
   * Reapplies focus to the element that was removed and re-appended to the DOM
   * @type String
   */
  refreshFocus () {
    if (!this.lastFocusedId) {
      return
    }

    const el = document.getElementById(this.lastFocusedId)

    if (el) {
      el.focus()

      if (this.lastKeyEvent && this.lastKeyEvent.key === 'Tab') {
        this.simulateTab(el, this.lastKeyEvent.shiftKey)
      }
    }
  }

  simulateTab (currentElement, shift) {
    const focusableElements = document.querySelectorAll('input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])')
    const index = Array.prototype.indexOf.call(focusableElements, currentElement)

    if (index !== -1) {
      if (shift) {
        if (index > 0) {
          focusableElements[index - 1].focus()
        }
      } else {
        if (index + 1 < focusableElements.length) {
          focusableElements[index + 1].focus()
        }
      }
    }
  }

  /**
   * Appends a hidden input to the root container whose value will be the value
   * of the root instance.
   */
  appendHiddenInput () {
    const hiddenControl = this.theme.getInputControl({
      type: 'hidden',
      id: 'jedi-hidden-input'
    })

    this.hiddenInput = hiddenControl.input
    this.hiddenInput.setAttribute('name', 'json')
    this.hiddenInput.removeAttribute('aria-describedby')
    this.hiddenInput.removeAttribute('aria-hidden', 'true')

    if (this.options.hiddenInputAttributes && isObject(this.options.hiddenInputAttributes)) {
      Object.keys(this.options.hiddenInputAttributes).forEach(attr => {
        this.hiddenInput.setAttribute(attr, this.options.hiddenInputAttributes[attr])
      })
    }

    this.container.appendChild(this.hiddenInput)
    this.hiddenInput.value = JSON.stringify(this.getValue())
  }

  /**
   * Adds a child instance pointer to the instances list
   */
  register (instance) {
    this.instances.set(instance.path, instance)
  }

  /**
   * Deletes a child instance pointer from the instances list
   */
  unregister (instance) {
    this.instances.delete(instance.path)
  }

  /**
   * Creates a json instance and dereference schema on the fly if needed.
   */
  createInstance (config) {
    if (this.refParser) {
      config.schema = this.refParser.expand(config.schema)

      // allOf
      this.walker.traverse(config.schema, (node) => {
        if (node.allOf && Array.isArray(node.allOf)) {
          node.allOf.forEach((subschema, index) => {
            node.allOf[index] = this.refParser.expand(subschema)
          })
        }

        if (node.oneOf && Array.isArray(node.oneOf)) {
          node.oneOf.forEach((subschema, index) => {
            node.oneOf[index] = this.refParser.expand(subschema)
          })
        }

        if (node.oneOf && Array.isArray(node.oneOf)) {
          node.oneOf.forEach((subschema, index) => {
            node.oneOf[index] = this.refParser.expand(subschema)
          })
        }
      })
    }

    // merge allOf if editor and option is true
    if (this.isEditor) {
      // extract if then combinations
      this.walker.traverse(config.schema, (node) => {
        if (node.allOf && Array.isArray(node.allOf)) {
          if (isSet(node['x-allOf-merged'])) {
            return
          }

          const mergeAllOf = getSchemaXOption(node, 'mergeAllOf') ?? this.options.mergeAllOf

          const conditionals = []
          let nodeFinal = clone(node) // To store merged static properties
          // delete nodeFinal.allOf // do not delete allOf to keep validation clean

          node.allOf.forEach((subschema) => {
            if (subschema.if && subschema.then) {
              conditionals.push({
                if: subschema.if,
                then: subschema.then,
                else: subschema.else || null
              })
            } else {
              // Merge non-conditional schemas normally if mergeAllOf is true
              nodeFinal = mergeAllOf ? combineDeep({}, nodeFinal, subschema) : nodeFinal
            }
          })

          nodeFinal['x-allOf-merged'] = true

          // Build a long sequential if-then-else chain
          let sequentialIfThenElse = null

          for (let i = conditionals.length - 1; i >= 0; i--) {
            if (sequentialIfThenElse === null) {
              sequentialIfThenElse = conditionals[i]
            } else {
              sequentialIfThenElse = {
                if: conditionals[i].if,
                then: conditionals[i].then,
                else: sequentialIfThenElse
              }
            }
          }

          // Attach the final sequential if-then-else structure to nodeFinal
          if (sequentialIfThenElse) {
            Object.assign(nodeFinal, sequentialIfThenElse)
          }

          return nodeFinal
        }
      })

      // oneOf
      this.walker.traverse(config.schema, (node) => {
        if (node.oneOf && Array.isArray(node.oneOf)) {
          const nodeClone = clone(node)
          delete nodeClone.oneOf

          node.oneOf = node.oneOf.map((subschema) => {
            return combineDeep({}, nodeClone, subschema)
          })

          return {
            oneOf: node.oneOf
          }
        }
      })

      // anyOf
      this.walker.traverse(config.schema, (node) => {
        if (node.anyOf && Array.isArray(node.anyOf)) {
          const nodeClone = clone(node)
          delete nodeClone.anyOf

          node.anyOf = node.anyOf.map((subschema) => {
            return combineDeep({}, nodeClone, subschema)
          })

          return {
            anyOf: node.anyOf
          }
        }
      })

      // not
      this.walker.traverse(config.schema, (node) => {
        if (node.not && isObject(node.not)) {
          const nodeClone = clone(node)
          delete nodeClone.not

          node.not = combineDeep({}, nodeClone, node.not)
        }
      })
    }

    const schemaOneOf = getSchemaOneOf(config.schema)
    const schemaAnyOf = getSchemaAnyOf(config.schema)
    const schemaIf = getSchemaIf(config.schema)
    const schemaType = getSchemaType(config.schema)

    if (this.debug && notSet(schemaType) && !isSet(schemaOneOf) && !isSet(schemaAnyOf) && !isSet(schemaIf)) {
      console.warn('TYPE NOT SET', config.schema, config.path)
    }

    if (isSet(schemaAnyOf) || isSet(schemaOneOf) || schemaType === 'any' || isArray(schemaType) || notSet(schemaType)) {
      return new InstanceMultiple(config)
    }

    if (isSet(schemaIf)) {
      return new InstanceIfThenElse(config)
    }

    if (schemaType === 'object') {
      return new InstanceObject(config)
    }

    if (schemaType === 'array') {
      return new InstanceArray(config)
    }

    if (schemaType === 'string') {
      return new InstanceString(config)
    }

    if (schemaType === 'number' || schemaType === 'integer') {
      return new InstanceNumber(config)
    }

    if (schemaType === 'boolean') {
      return new InstanceBoolean(config)
    }

    if (schemaType === 'null') {
      return new InstanceNull(config)
    }
  }

  /**
   * Returns the value of the root instance
   * @return {*}
   */
  getValue () {
    return this.root.getValue()
  }

  /**
   * Sets the value of the root instance
   */
  setValue () {
    this.root.setValue(...arguments)
    this.updateInstancesWatchedData()
  }

  /**
   * Returns an instance by path
   * @return {*}
   */
  getInstance (path) {
    return this.instances.get(path)
  }

  /**
   * Disables the root instance and it's children user interfaces
   */
  disable () {
    this.root.ui.disable()
  }

  /**
   * Enables the root instance and it's children user interfaces
   */
  enable () {
    this.root.ui.enable()
  }

  /**
   * Get an array of validation errors
   * @param {string[]} filters - Types to include, e.g., ['errors', 'warnings']
   * @returns {*[]}
   */
  getErrors (filters = ['error']) {
    let results = []

    for (const instance of this.instances.values()) {
      results = [...results, ...instance.getErrors()]
    }

    return results.filter((error) => {
      return filters.includes(error.type.toLowerCase())
    })
  }

  export () {
    const results = []

    for (const instance of this.instances.values()) {
      results.push({
        path: instance.path ?? '-',
        type: instance.schema.type ?? '-',
        title: instance.ui.getTitle() ?? '-',
        value: instance.getValue() ?? '-'
      })
    }

    return results
  }

  /**
   * Displays validation errors in the respective editors.
   * If an errors list is passed, it will display these errors;
   * otherwise, it will retrieve existing errors from the instance.
   *
   * @param {Array|null} errorsList - An optional array containing error messages.
   * @returns {boolean} Returns `true` if the container exists and errors are displayed,
   * or `false` if there is no container and thus no errors are displayed.
   */
  showValidationErrors (errorsList = null) {
    if (!this.options.container) {
      return false
    }

    const errors = errorsList ?? this.getErrors()

    for (const instance of this.instances.values()) {
      instance.ui.showValidationErrors(errors, true)
    }
  }

  watch (path, callback) {
    if (!this.watched[path]) {
      this.watched[path] = []
    }

    this.watched[path].push(callback)
  }

  unwatch (path, callback) {
    if (!this.watched[path]) {
      return
    }

    this.watched[path] = this.watched[path].filter(cb => cb !== callback)

    if (this.watched[path].length === 0) {
      delete this.watched[path]
    }
  }

  /**
   * Destroy the root instance and it's children
   */
  destroy () {
    this.root.destroy()

    if (this.options.container) {
      this.container.innerHTML = ''
    }

    Object.keys(this).forEach((key) => {
      delete this[key]
    })
  }
}

export default Jedison
