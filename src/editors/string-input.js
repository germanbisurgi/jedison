import EditorString from './string.js'
import { getSchemaXOption, getSchemaType } from '../helpers/schema.js'
import { isSet } from '../helpers/utils.js'

/**
 * Represents a EditorString instance.
 * @extends Editor
 */
class EditorStringInput extends EditorString {
  static resolves (schema) {
    return getSchemaType(schema) === 'string'
  }

  static getTypes () {
    return ['hidden', 'color', 'date', 'datetime-local', 'email', 'number', 'month', 'password', 'search', 'time', 'tel', 'text', 'url', 'week']
  }

  build () {
    const optionFormat = getSchemaXOption(this.instance.schema, 'format')

    this.control = this.theme.getInputControl({
      title: this.getTitle(),
      description: this.getDescription(),
      type: EditorStringInput.getTypes().includes(optionFormat) ? optionFormat : 'text',
      id: this.getIdFromPath(this.instance.path),
      titleIconClass: getSchemaXOption(this.instance.schema, 'titleIconClass'),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden') || optionFormat === 'hidden',
      info: this.getInfo(),
      searchPanel: getSchemaXOption(this.instance.schema, 'searchPanel')
    })

    // fix color picker bug
    if (optionFormat === 'color' && this.instance.value.length === 0) {
      this.instance.setValue('#000000', false, 'user')
    }
  }

  adaptForTable () {
    this.theme.adaptForTableInputControl(this.control)
  }

  addEventListeners () {
    const eventType = this.getValidationEventType()
    this.control.input.addEventListener(eventType, () => {
      this.instance.setValue(this.control.input.value, true, 'user')
    })

    const searchPanelOptions = getSchemaXOption(this.instance.schema, 'searchPanel')

    if (isSet(searchPanelOptions)) {
      const searchPanelSettingsKey = getSchemaXOption(this.instance.schema, 'searchPanelSettings')
      const settings = this.instance.jedison.options.settings[searchPanelSettingsKey]

      if (settings && settings.load && settings.renderItem) {
        // Add event listener to search input
        this.control.searchPanel.searchControl.addEventListener('change', async (event) => {
          const searchTerm = event.target.value.trim()

          // Clear previous options
          this.control.searchPanel.resultsContainer.innerHTML = ''

          if (searchTerm.length === 0) {
            return
          }

          try {
            // Call the load function to get data
            const results = await settings.load({ editor: this, searchTerm })

            results.forEach((item) => {
              const element = settings.renderItem({ item })
              const value = settings.getValue({ item })

              // Add click handler to set the value
              element.addEventListener('click', () => {
                this.instance.setValue(value, true, 'user')

                // Clear search and options
                // this.control.searchPanel.searchControl.value = ''
                // this.control.searchPanel.resultsContainer.innerHTML = ''
              })

              this.control.searchPanel.resultsContainer.appendChild(element)
            })
          } catch (error) {
            console.error('Error loading search results:', error)
          }
        })
      }
    }
  }

  sanitize (value) {
    return String(value)
  }

  refreshUI () {
    super.refreshUI()
    this.control.input.value = this.instance.getValue()
  }
}

export default EditorStringInput
