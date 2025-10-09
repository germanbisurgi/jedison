import { combineDeep, compileTemplate, isObject, isSet, pathToAttribute } from '../helpers/utils.js'
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

    this.init()
    this.build()
    this.setAttributes()
    this.setReadOnlyAttribute()
    this.addEventListeners()
    this.setVisibility()
    this.setContainerAttributes()
    this.refreshUI()

    const alwaysShowErrors = this.instance.jedison.options.showErrors === 'always' || getSchemaXOption(this.instance.schema, 'showErrors') === 'always'

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
   * Initializes the editor
   */
  init () {
    this.theme = this.instance.jedison.theme
    this.markdownEnabled = getSchemaXOption(this.instance.schema, 'parseMarkdown') ?? this.instance.jedison.options.parseMarkdown
    this.purifyEnabled = getSchemaXOption(this.instance.schema, 'purifyHtml') ?? this.instance.jedison.options.purifyHtml
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
   * Builds the editor control and appends it to the editor container
   */
  build () {
  }

  adaptForTable () {}

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
    const optionId = this.instance.jedison.options.id
    return optionId ? optionId + '-' + pathToAttribute(path) : pathToAttribute(path)
  }

  /**
   * Determines the event type to use for validation trigger based on showErrors option
   * @returns {string} - 'input' or 'change'
   */
  getValidationEventType () {
    const showErrors = getSchemaXOption(this.instance.schema, 'showErrors') ?? this.instance.jedison.options.showErrors
    return showErrors === 'input' ? 'input' : 'change'
  }

  /**
   * Add event listeners to ui elements
   */
  addEventListeners () {
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

    const neverShowErrors = this.instance.jedison.options.showErrors === 'never' || getSchemaXOption(this.instance.schema, 'showErrors') === 'never'

    if ((neverShowErrors && !force) || errors.length === 0) {
      return
    }

    errors.forEach((error) => {
      if (error.constraint === 'properties') {
        return
      }

      error.messages.forEach((message) => {
        let invalidFeedback

        if (error.type === 'error') {
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

    this.showingValidationErrors = true
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
    if (this.instance.jedison.options.purifyHtml && window.DOMPurify) {
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
      this.title = compileTemplate(this.title, this.instance.getTemplateData())
      this.title = this.markdownEnabled ? this.getHtmlFromMarkdown(this.title) : this.title

      const domPurifyOptions = combineDeep({}, this.instance.jedison.options.domPurifyOptions, {
        FORBID_TAGS: ['p']
      })

      this.title = this.purifyEnabled ? this.purifyContent(this.title, domPurifyOptions) : this.title
    }

    return this.title
  }

  getDescription () {
    const schemaDescription = getSchemaDescription(this.instance.schema)

    if (isSet(schemaDescription)) {
      this.description = compileTemplate(schemaDescription, this.instance.getTemplateData())
      this.description = this.markdownEnabled ? this.getHtmlFromMarkdown(this.description) : this.description

      const domPurifyOptions = this.instance.jedison.options.domPurifyOptions

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

    const domPurifyOptions = this.instance.jedison.options.domPurifyOptions

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

  /**
   * Destroys the editor
   */
  destroy () {
    if (this.control.container && this.control.container.parentNode) {
      this.control.container.parentNode.removeChild(this.control.container)
    }

    Object.keys(this).forEach((key) => {
      delete this[key]
    })
  }
}

export default Editor
