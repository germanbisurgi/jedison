import { combineDeep, compileTemplate, filterAttributes, isArray, isObject, isSet, isString, pathToAttribute } from '../helpers/utils.js'
import { getSchemaDescription, getSchemaTitle, getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents an Editor instance.
 * @extends EventEmitter
 */
class Editor {
  constructor (instance) {
    /**
     * A reference to the Instance being controlled by this editor.
     * @type {Jedison}
     */
    this.instance = instance

    /**
     * Theme instance used to build the Editor user interface.
     * @type {Theme}
     */
    this.theme = null

    /**
     * The user interface html for this editor
     * @type {HTMLElement}
     */
    this.control = null

    /**
     * Disabled status for this editor user interface
     * @type {boolean}
     */
    this.disabled = false

    /**
     * Read only status for this editor user interface
     * @type {boolean}
     */
    this.readOnly = this.instance.isReadOnly()

    this.showingValidationErrors = false

    this.markdownEnabled = false
    this.purifyEnabled = false

    this.title = null
    this.description = null

    /**
     * Array to store event listeners for cleanup
     * @type {Array}
     */
    this.storedEventListeners = []

    this.init()
    this.build()
    this.setAttributes()
    this.setReadOnlyAttribute()
    this.addEventListeners()
    this.setVisibility()
    this.setContainerAttributes()
    this.appendSchemaButtons()
    this.refreshUI()

    const alwaysShowErrors = this.instance.jedison.getOption('showErrors') === 'always' || getSchemaXOption(this.instance.schema, 'showErrors') === 'always'

    if (alwaysShowErrors) {
      this.showValidationErrors(this.instance.getErrors())
    }

    const valueChangeHandler = () => {
      this.refreshUI()
      this.showValidationErrors(this.instance.getErrors())
    }

    this.instance.on('change', valueChangeHandler)
  }

  static resolves (schema) {}

  /**
   * Whether this editor already renders a heading for each of its children
   * (e.g. an accordion toggle or a nav tab label), so a child editor can
   * skip drawing its own duplicate heading/panel when embedded here.
   */
  static providesChildHeading () {
    return false
  }

  /**
   * Initializes the editor
   */
  init () {
    this.theme = this.instance.jedison.theme
    this.markdownEnabled = getSchemaXOption(this.instance.schema, 'parseMarkdown') ?? this.instance.jedison.getOption('parseMarkdown')
    this.purifyEnabled = getSchemaXOption(this.instance.schema, 'purifyHtml') ?? this.instance.jedison.getOption('purifyHtml')
  }

  /**
   * Gets the json path level by counting how many "/" it has
   */
  getLevel () {
    return (this.instance.path.match(/\//g) || []).length
  }

  setVisibility () {
    const schemaOptionHidden = getSchemaXOption(this.instance.schema, 'hidden')

    if (isSet(schemaOptionHidden) && schemaOptionHidden === true) {
      this.control.container.style.display = 'none'
      this.control.container.setAttribute('aria-hidden', 'true')
    }
  }

  /**
   * Sets container attributes like data-path and data-type
   */
  setContainerAttributes () {
    this.control.container.setAttribute('data-level', this.getLevel())
    this.control.container.setAttribute('data-path', this.instance.path)
    this.control.container.setAttribute('data-type', getSchemaType(this.instance.schema))

    const schemaContainerAttributes = getSchemaXOption(this.instance.schema, 'containerAttributes')

    if (isSet(schemaContainerAttributes) && isObject(schemaContainerAttributes)) {
      for (const [key, value] of Object.entries(schemaContainerAttributes)) {
        if (key === 'class') {
          const classes = value.split(' ')
          classes.forEach((cls) => {
            this.control.container.classList.add(cls)
          })
        } else {
          this.control.container.setAttribute(key, value)
        }
      }
    }
  }

  /**
   * Renders schema-defined action buttons (the `x-buttons` keyword) into the
   * editor container. Works for every editor because it lives on the base
   * class, next to setAttributes()/setContainerAttributes(). Both `x-buttons`
   * and `x-options.buttons` spellings resolve through getSchemaXOption().
   *
   * Security decisions from issue #62:
   * - The label is HTML sanitized through the existing DOMPurify pipeline
   *   (purifyContent(), decision 9c / F6) before being handed to the theme.
   * - The `attributes` bag is filtered against an allowlist (filterAttributes(),
   *   decision 6a / F1); `always-enabled` / `always-disabled` are intentionally
   *   allowed (decision 6b, trusted-schema stance).
   * - Each button emits a `jedison:<name>` event on the root Jedison instance
   *   through the internal EventEmitter (decision 1c / 2), carrying a live
   *   payload `{ jedison, editor, path }` (decision 8). Consumers subscribe with
   *   `jedison.on('jedison:<name>', ({ jedison, editor, path }) => ...)`. The
   *   listener map is private to the instance, so the payload is not exposed to
   *   unrelated scripts on the page (F3 contained).
   * - Click listeners are registered through storedEventListeners so destroy()
   *   cleans them up.
   */
  appendSchemaButtons () {
    const buttons = getSchemaXOption(this.instance.schema, 'buttons')

    if (!isArray(buttons)) {
      return
    }

    const debug = this.instance.jedison.getOption('debug')
    const domPurifyOptions = this.instance.jedison.getOption('domPurifyOptions')

    buttons.forEach((config) => {
      if (!isObject(config)) {
        if (debug) {
          console.warn('Jedison: x-buttons entry is not an object and was skipped.', config)
        }
        return
      }

      // Label: HTML sanitized through the existing DOMPurify pipeline (decision 9c / F6).
      const rawLabel = isString(config.label) ? config.label : ''
      const label = this.purifyEnabled ? this.purifyContent(rawLabel, domPurifyOptions) : rawLabel

      // Attributes: allowlist-filtered (decision 6a / F1). __proto__ etc. never pass the allowlist (F5).
      const attributes = filterAttributes(config.attributes, {
        onDrop: (key) => {
          if (debug) {
            console.warn(`Jedison: x-buttons attribute "${key}" is not allowlisted and was dropped.`)
          }
        }
      })

      const button = this.theme.getXButton({ label, attributes })

      this.control.container.appendChild(button)

      const eventName = (isObject(config.event) && isString(config.event.name)) ? config.event.name : null

      if (!eventName) {
        if (debug) {
          console.warn('Jedison: x-buttons entry has no event.name; button renders but dispatches nothing.', config)
        }
        return
      }

      const handler = () => {
        const jedison = this.instance.jedison

        if (!jedison) {
          return
        }

        // Emit on the root Jedison instance (decision 1c, root only). The
        // payload is a single context object passed positionally.
        jedison.emit('jedison:' + eventName, {
          jedison,
          editor: this,
          path: this.instance.path
        })
      }

      button.addEventListener('click', handler)

      this.storedEventListeners.push({
        element: button,
        eventType: 'click',
        handler
      })
    })
  }

  /**
   * Builds the editor control and appends it to the editor container
   */
  build () {
  }

  adaptForTable () {}

  // eslint-disable-next-line no-unused-vars
  adaptForHorizontal (labelCol, inputCol) {}

  /**
   * Adds attributes to generated html elements if specified in schema x-options
   */
  setAttributes () {
    const input = this.control.input

    if (isSet(input)) {
      const inputAttributes = getSchemaXOption(this.instance.schema, 'inputAttributes')

      if (isObject(inputAttributes)) {
        for (const [key, value] of Object.entries(inputAttributes)) {
          input.setAttribute(key, value)
        }
      }
    }
  }

  setReadOnlyAttribute () {
    if (this.readOnly) {
      const inputElements = this.control.container.querySelectorAll('input, textarea, select')
      inputElements.forEach((element) => {
        element.setAttribute('always-disabled', '')
      })
    }
  }

  getIdFromPath (path) {
    const optionId = this.instance.jedison.getOption('id')
    return optionId ? optionId + '-' + pathToAttribute(path) : pathToAttribute(path)
  }

  /**
   * Determines the event type to use for validation trigger based on showErrors option
   * @returns {string} - 'input' or 'change'
   */
  getValidationEventType () {
    const showErrors = getSchemaXOption(this.instance.schema, 'showErrors') ?? this.instance.jedison.getOption('showErrors')
    return showErrors === 'input' ? 'input' : 'change'
  }

  /**
   * Add event listeners to ui elements
   */
  addEventListeners () {
  }

  /**
   * Clears any stored event listeners that might persist
   * This method can be overridden by subclasses to provide custom cleanup logic
   */
  clearStoredEventListeners () {
    if (this.storedEventListeners) {
      this.storedEventListeners.forEach(listener => {
        if (listener.element && listener.handler) {
          listener.element.removeEventListener(listener.eventType || 'click', listener.handler)
        }
      })
    }
    this.storedEventListeners = []
  }

  /**
   * Shows validation error messages in the editor container.
   */
  showValidationErrors (errors, force = false) {
    errors = errors.filter((error) => {
      return error.path === this.instance.path
    })

    this.control.messages.innerHTML = ''
    this.showingValidationErrors = false
    this.setAriaInvalid(false)

    const neverShowErrors = this.instance.jedison.getOption('showErrors') === 'never' || getSchemaXOption(this.instance.schema, 'showErrors') === 'never'

    if ((neverShowErrors && !force) || errors.length === 0) {
      return
    }

    const muteValidationMessages = getSchemaXOption(this.instance.schema, 'muteValidationMessages') ?? this.instance.jedison.getOption('muteValidationMessages') ?? []

    let hasErrors = false

    errors.forEach((error) => {
      if (muteValidationMessages.includes(error.constraint)) {
        return
      }

      error.messages.forEach((message) => {
        let invalidFeedback

        if (error.type === 'error') {
          hasErrors = true
          invalidFeedback = this.getErrorFeedback({
            message: message
          })
        } else {
          invalidFeedback = this.getWarningFeedback({
            message: message
          })
        }

        this.control.messages.appendChild(invalidFeedback)
      })
    })

    if (hasErrors) {
      this.setAriaInvalid(true)
    }

    this.showingValidationErrors = true
  }

  setAriaInvalid (invalid) {
    if (this.control.input) {
      if (invalid) {
        this.control.input.setAttribute('aria-invalid', 'true')
      } else {
        this.control.input.removeAttribute('aria-invalid')
      }
    }
  }

  /**
   * Get an error message container
   */
  getErrorFeedback (config) {
    return this.theme.getErrorFeedback(config)
  }

  /**
   * Get an error message container
   */
  getWarningFeedback (config) {
    return this.theme.getWarningFeedback(config)
  }

  /**
   * Disables the editor
   */
  disable () {
    this.disabled = true
    this.refreshUI()
  }

  /**
   * Enables the editor
   */
  enable () {
    this.disabled = false
    this.refreshUI()
  }

  /**
   * Clean out HTML tags from txt
   */
  purifyContent (content, domPurifyOptions) {
    if (this.instance.jedison.getOption('purifyHtml') && typeof window !== 'undefined' && window.DOMPurify) {
      return window.DOMPurify.sanitize(content, domPurifyOptions)
    } else {
      const tmp = document.createElement('div')
      tmp.innerHTML = content
      return (tmp.textContent || tmp.innerText)
    }
  }

  getHtmlFromMarkdown (content) {
    return window.marked.parse(content)
  }

  getTitle () {
    let titleFromSchema = false
    this.title = this.instance.getKey()

    const schemaTitle = getSchemaTitle(this.instance.schema)

    if (isSet(schemaTitle)) {
      this.title = schemaTitle
      titleFromSchema = true
    }

    if (titleFromSchema) {
      this.title = compileTemplate(this.title, this.instance.getTemplateData(this.title))
      this.title = this.markdownEnabled ? this.getHtmlFromMarkdown(this.title) : this.title

      const domPurifyOptions = combineDeep({}, this.instance.jedison.getOption('domPurifyOptions'), {
        FORBID_TAGS: ['p']
      })

      this.title = this.purifyEnabled ? this.purifyContent(this.title, domPurifyOptions) : this.title
    }

    return this.title
  }

  getDescription () {
    const schemaDescription = getSchemaDescription(this.instance.schema)

    if (isSet(schemaDescription)) {
      this.description = compileTemplate(schemaDescription, this.instance.getTemplateData(this.description))
      this.description = this.markdownEnabled ? this.getHtmlFromMarkdown(this.description) : this.description

      const domPurifyOptions = this.instance.jedison.getOption('domPurifyOptions')

      this.description = this.purifyEnabled ? this.purifyContent(this.description, domPurifyOptions) : this.description
    }

    return this.description
  }

  getInfo (schema = null) {
    const _schema = schema ?? this.instance.schema
    const schemaInfo = getSchemaXOption(_schema, 'info')

    if (!isSet(schemaInfo)) {
      return schemaInfo
    }

    const domPurifyOptions = this.instance.jedison.getOption('domPurifyOptions')

    if (isSet(schemaInfo.title)) {
      schemaInfo.title = this.markdownEnabled ? this.getHtmlFromMarkdown(schemaInfo.title) : schemaInfo.title
      schemaInfo.title = this.purifyEnabled ? this.purifyContent(schemaInfo.title, domPurifyOptions) : schemaInfo.title
    }

    if (isSet(schemaInfo.content)) {
      schemaInfo.content = this.markdownEnabled ? this.getHtmlFromMarkdown(schemaInfo.content) : schemaInfo.content
      schemaInfo.content = this.purifyEnabled ? this.purifyContent(schemaInfo.content, domPurifyOptions) : schemaInfo.content
    }

    return schemaInfo
  }

  refreshLegendWarning () {}

  /**
   * Updates control UI when its state changes
   */
  refreshUI () {
    this.refreshDisabledState()
    this.refreshTemplates()
  }

  refreshDisabledState () {
    const interactiveElements = this.control.container.querySelectorAll('button, input, select, textarea')

    interactiveElements.forEach((element) => {
      if (this.disabled || this.readOnly || element.hasAttribute('always-disabled')) {
        element.setAttribute('disabled', '')
      } else {
        element.removeAttribute('disabled', '')
      }

      if (element.hasAttribute('always-enabled')) {
        element.removeAttribute('disabled', '')
      }
    })
  }

  refreshTemplates () {
    if (this.control.legendText && this.getTitle()) {
      this.control.legendText.innerHTML = this.getTitle()
    }

    if (this.control.labelText && this.getTitle()) {
      this.control.labelText.innerHTML = this.getTitle()
    }

    if (this.control.description && this.getDescription()) {
      this.control.description.innerHTML = this.getDescription()
    }
  }

  /**
   * Transforms the input value if necessary before value set
   */
  sanitize (value) {
    return value
  }

  /**
   * Refreshes the JSON data input size to match content
   */
  refreshJsonDataInputSize () {
    if (this.control && this.control.jsonData && this.control.jsonData.input) {
      const input = this.control.jsonData.input
      input.style.height = 'auto'
      input.style.height = input.scrollHeight + 'px'

      setTimeout(() => {
        if (input) {
          input.scrollTop = 0
        }
      })
    }
  }

  /**
   * Refreshes the JSON data input with current instance value
   */
  refreshJsonData () {
    if (this.control && this.control.jsonData && this.control.jsonData.input) {
      this.control.jsonData.input.value = JSON.stringify(this.instance.getValue(), null, 2)
    }
  }

  getNextChildPath (path) {
    const currentDepth = this.instance.path.split(this.instance.jedison.pathSeparator).length
    const targetSegments = path.split(this.instance.jedison.pathSeparator)
    if (targetSegments.length <= currentDepth) return null
    return targetSegments.slice(0, currentDepth + 1).join(this.instance.jedison.pathSeparator)
  }

  navigateTo (path) {
    if (path === this.instance.path) {
      this.control.container.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      return
    }
    const nextChildPath = this.getNextChildPath(path)
    if (!nextChildPath) return
    const child = this.instance.children.find(c => c.path === nextChildPath)
    if (child?.ui) {
      child.ui.navigateTo(path)
    }
  }

  /**
   * Destroys the editor
   */
  destroy () {
    this.clearStoredEventListeners()

    if (this.control.container && this.control.container.parentNode) {
      this.control.container.parentNode.removeChild(this.control.container)
    }

    Object.keys(this).forEach((key) => {
      delete this[key]
    })
  }
}

export default Editor
