import Editor from './editor.js'
import {
  equal,
  hasOwn,
  isObject,
  isSet, isString,
  pathToAttribute
} from '../helpers/utils.js'
import {
  getSchemaAdditionalProperties,
  getSchemaTitle, getSchemaType,
  getSchemaXOption
} from '../helpers/schema.js'

/**
 * Represents an EditorObject instance.
 * @extends Editor
 */
class EditorObject extends Editor {
  static resolves (schema) {
    return getSchemaType(schema) === 'object'
  }

  build () {
    this.propertyActivators = {}
    let addProperty = true
    const additionalProperties = getSchemaAdditionalProperties(this.instance.schema)

    if (isSet(additionalProperties) && additionalProperties === false) {
      addProperty = false
    }

    let enablePropertiesToggle = false

    if (isSet(this.instance.jedison.options.enablePropertiesToggle)) {
      enablePropertiesToggle = this.instance.jedison.options.enablePropertiesToggle
    }

    const schemaEnablePropertiesToggle = getSchemaXOption(this.instance.schema, 'enablePropertiesToggle')

    if (isSet(schemaEnablePropertiesToggle)) {
      enablePropertiesToggle = schemaEnablePropertiesToggle
    }

    this.control = this.theme.getObjectControl({
      title: this.getTitle(),
      description: this.getDescription(),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      id: this.getIdFromPath(this.instance.path),
      enablePropertiesToggle: enablePropertiesToggle,
      addProperty: addProperty,
      enableCollapseToggle: getSchemaXOption(this.instance.schema, 'enableCollapseToggle') ?? this.instance.jedison.options.enableCollapseToggle,
      startCollapsed: getSchemaXOption(this.instance.schema, 'startCollapsed') ?? this.instance.jedison.options.startCollapsed,
      readOnly: this.instance.isReadOnly(),
      info: this.getInfo(),
      editJsonData: getSchemaXOption(this.instance.schema, 'editJsonData') ?? this.instance.jedison.options.editJsonData,
      propertiesToggleContent: getSchemaXOption(this.instance.schema, 'propertiesToggleContent') ?? this.instance.jedison.translator.translate('propertiesToggle'),
      collapseToggleContent: getSchemaXOption(this.instance.schema, 'collapseToggleContent') ?? this.instance.jedison.translator.translate('collapseToggle'),
      addPropertyContent: getSchemaXOption(this.instance.schema, 'addPropertyContent') ?? this.instance.jedison.translator.translate('objectAddProperty')
    })

    this.control.jsonData.input.value = JSON.stringify(this.instance.getValue(), null, 2)
  }

  addEventListeners () {
    this.control.addPropertyBtn.addEventListener('click', () => {
      const propertyName = this.control.addPropertyControl.input.value.split(' ').join('')

      const propertyNameEmpty = propertyName.length === 0

      if (propertyNameEmpty) {
        return
      }

      const propertyExist = isSet(this.instance.value[propertyName])

      if (propertyExist) {
        return
      }

      const schema = this.instance.getPropertySchema(propertyName)

      const child = this.instance.createChild(schema, propertyName)
      child.activate()
      this.instance.setValue(this.instance.value, true, 'user')
      this.control.addPropertyControl.input.value = ''

      const ariaLive = this.control.ariaLive
      const schemaTitle = getSchemaTitle(child.schema)
      const label = isSet(schemaTitle) ? schemaTitle : propertyName
      const ariaLiveMessage = this.theme.getAriaLiveMessage()
      ariaLiveMessage.textContent = label + ' ' + this.instance.jedison.translator.translate('objectPropertyAdded')
      ariaLive.appendChild(ariaLiveMessage)

      // keeps dialog open
      this.control.propertiesContainer.close()
      this.control.propertiesContainer.showModal()
    })

    this.control.jsonData.saveBtn.addEventListener('click', () => {
      try {
        const inputValue = JSON.parse(this.control.jsonData.input.value)
        this.instance.setValue(inputValue, true, 'user')
        this.control.jsonData.dialog.close()
      } catch (error) {
        // eslint-disable-next-line no-undef
        alert('Invalid JSON')
      }
    })

    this.control.jsonData.toggle.addEventListener('click', () => {
      this.refreshJsonDataInputSize()
    })
  }

  sanitize (value) {
    if (isObject(value)) {
      return value
    }

    return {}
  }

  getErrorFeedback (config) {
    return this.theme.getAlert(config)
  }

  refreshPropertiesSlot () {
    const schemaOptionEnablePropertiesToggle = getSchemaXOption(this.instance.schema, 'enablePropertiesToggle') ?? this.instance.jedison.options.enablePropertiesToggle

    if (equal(schemaOptionEnablePropertiesToggle, true)) {
      const declaredProperties = Object.keys(this.instance.properties)
      const instanceProperties = this.instance.children.map((child) => child.getKey())
      const properties = [...new Set([...declaredProperties, ...instanceProperties])]

      while (this.control.propertiesActivators.firstChild) {
        this.control.propertiesActivators.removeChild(this.control.propertiesActivators.firstChild)
      }

      const {
        container: defaultGroupContainer,
        group: defaultGroup
      } = this.theme.getPropertiesGroup()

      this.control.propertiesActivators.appendChild(defaultGroupContainer)

      const propertiesGroups = {}

      properties.forEach((property) => {
        const isRequired = this.instance.isRequired(property)
        const ariaLive = this.control.ariaLive
        const schema = this.instance.getPropertySchema(property)
        const schemaTitle = getSchemaTitle(schema)
        const path = this.instance.path + this.instance.jedison.pathSeparator + property
        const id = pathToAttribute(path) + '-activator'
        const title = isSet(schemaTitle) ? schemaTitle : property

        const checkboxControl = this.theme.getCheckboxControl({
          id: id,
          title: title,
          titleHidden: false
        })

        const checkbox = checkboxControl.input
        this.propertyActivators[property] = checkbox

        checkbox.addEventListener('change', () => {
          ariaLive.innerHTML = ''
          const ariaLiveMessage = this.theme.getAriaLiveMessage()

          if (checkbox.checked) {
            const child = this.instance.getChild(property)

            if (!child) {
              this.instance.createChild(schema, property)
            }

            this.instance.getChild(property).activate()
            ariaLiveMessage.textContent = title + ' ' + this.instance.jedison.translator.translate('objectPropertyAdded')
            ariaLive.appendChild(ariaLiveMessage)
          } else {
            this.instance.getChild(property).deactivate()
            ariaLiveMessage.textContent = title + ' ' + this.instance.jedison.translator.translate('objectPropertyRemoved')
            ariaLive.appendChild(ariaLiveMessage)
          }

          // keeps dialog open
          this.control.propertiesContainer.close()
          this.control.propertiesContainer.showModal()
        })

        const propGroup = getSchemaXOption(schema, 'propGroup')

        if (isSet(propGroup) && isString(propGroup)) {
          let propertiesGroup = propertiesGroups[propGroup]

          if (!isSet(propertiesGroup)) {
            propertiesGroup = this.theme.getPropertiesGroup({ name: propGroup })
            propertiesGroups[propGroup] = propertiesGroup
          }

          propertiesGroup.group.appendChild(checkboxControl.container)
          this.control.propertiesActivators.appendChild(propertiesGroup.container)
        } else {
          defaultGroup.appendChild(checkboxControl.container)
        }

        checkbox.disabled = this.disabled || isRequired
        checkbox.checked = hasOwn(this.instance.getValue(), property)
      })
    }
  }

  refreshEditors () {
    while (this.control.childrenSlot.firstChild) {
      this.control.childrenSlot.removeChild(this.control.childrenSlot.firstChild)
    }

    this.instance.children.forEach((child) => {
      const showOptIn = true

      const optIn = this.theme.getCheckboxControl({
        id: child.path + '-opt-in',
        title: child.path + '-opt-in',
        titleHidden: true
      })

      optIn.input.checked = child.isActive

      optIn.input.addEventListener('change', () => {
        if (child.isActive) {
          child.deactivate()
        } else {
          child.activate()
        }
      })

      if (child.isActive) {
        if (child.ui.control.container.parentNode === null) {
          this.control.childrenSlot.appendChild(child.ui.control.container)

          // append optIn toggle
          if (showOptIn && child.ui.control.optInContainer) {
            child.ui.control.optInContainer.appendChild(optIn.container)
          }
        }

        if (this.disabled || this.instance.isReadOnly()) {
          child.ui.disable()
        } else {
          child.ui.enable()
        }
      } else {
        if (child.ui.control.container.parentNode) {
          child.ui.control.container.parentNode.removeChild(child.ui.control.container)
        }
      }
    })
  }

  refreshUI () {
    super.refreshUI()
    this.refreshPropertiesSlot()
    this.refreshEditors()
    this.refreshJsonData()
  }
}

export default EditorObject
