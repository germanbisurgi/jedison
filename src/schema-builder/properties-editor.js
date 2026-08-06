import { isArray, isObject } from '../helpers/utils.js'
import { TYPES, TYPE_LABELS } from './schema-keywords.js'
import { createElement, btn, row, section } from './dom.js'

function getType (schema) {
  if (isObject(schema) && isArray(schema.type)) {
    return schema.type.join(' / ')
  }
  return schema?.type ?? ''
}

/**
 * Edits an object's `properties` map: add, rename, delete and nest into
 * property schemas. Renders inline via a provided node editor renderer.
 */
class PropertiesEditor {
  /**
   * @param {object} options
   * @param {object} options.properties - The node.properties object (mutated in place)
   * @param {string[]} [options.required] - The node.required array (mutated in place)
   * @param {Function} [options.onSetRequired] - () => requiredArray, creates it on the node when missing
   * @param {string} options.draft - Active draft
   * @param {number} options.depth - Nesting depth
   * @param {string} options.path - Path of the parent node
   * @param {object} options.expanded - Map of expanded property paths -> boolean
   * @param {Function} options.onSetExpanded - (key, expanded) => void
   * @param {Function} options.onChange - Called on non-structural changes
   * @param {Function} options.onStructuralChange - Called when the UI must re-render
   * @param {Function} options.renderNodeEditor - (schema, path, depth) => HTMLElement
   * @param {object} options.theme - Theme used to build the controls
   */
  constructor ({ properties, required, onSetRequired, draft, depth, path, expanded, onSetExpanded, onChange, onStructuralChange, renderNodeEditor, theme }) {
    this.properties = properties
    this.required = isArray(required) ? required : null
    this.onSetRequired = onSetRequired
    this.draft = draft
    this.depth = depth
    this.path = path
    this.expanded = expanded
    this.onSetExpanded = onSetExpanded
    this.onChange = onChange
    this.onStructuralChange = onStructuralChange
    this.renderNodeEditor = renderNodeEditor
    this.theme = theme
  }

  isExpanded (name) {
    return !!(this.expanded && this.expanded[`${this.path}.${name}`])
  }

  ensureRequired () {
    if (!isArray(this.required)) {
      this.required = this.onSetRequired ? this.onSetRequired() : []
    }
    return this.required
  }

  render () {
    const list = createElement('div', { class: 'jedi-sb-properties' })
    const propertyNames = Object.keys(this.properties || {})

    if (propertyNames.length === 0) {
      list.appendChild(createElement('div', { style: { color: '#999', fontSize: '12px', margin: '4px 0' } }, ['No properties defined yet.']))
    }

    propertyNames.forEach((name) => {
      list.appendChild(this.renderProperty(name, this.properties[name]))
    })

    const addInput = this.theme.getBuilderInput({ type: 'text', placeholder: 'property name' })
    const addBtn = btn(this.theme, '+ Add property', () => {
      this.addProperty(addInput)
    }, { variant: 'primary' })
    addInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') this.addProperty(addInput)
    })

    list.appendChild(row(addInput, addBtn))

    const container = createElement('div', { class: 'jedi-sb-properties-block' })
    container.appendChild(this.renderRequired())
    container.appendChild(list)
    return container
  }

  renderRequired () {
    const names = Object.keys(this.properties || {})

    if (names.length === 0) {
      return createElement('div')
    }

    const items = names.map((name) => {
      const checkbox = this.theme.getBuilderCheckbox({ className: 'jedi-sb-required', checked: isArray(this.required) && this.required.includes(name) })
      checkbox.addEventListener('change', () => {
        const required = this.ensureRequired()
        if (checkbox.checked && !required.includes(name)) {
          required.push(name)
        } else if (!checkbox.checked) {
          const index = required.indexOf(name)
          if (index !== -1) {
            required.splice(index, 1)
          }
        }
        this.onChange()
      })
      return row(checkbox, createElement('span', {}, [name]))
    })

    return section(this.theme, 'Required', createElement('div', { class: 'jedi-sb-required-list' }, items))
  }

  renderProperty (name, schema) {
    const typeValue = getType(schema)

    const nameInput = this.theme.getBuilderInput({ type: 'text', className: 'jedi-sb-prop-name', value: name })
    nameInput.addEventListener('change', () => {
      const newName = nameInput.value.trim()
      if (!newName || newName === name) return
      if (Object.prototype.hasOwnProperty.call(this.properties, newName)) return
      this.properties[newName] = this.properties[name]
      delete this.properties[name]
      this.renameRequired(name, newName)
      this.onStructuralChange()
    })

    const typeOptions = [{ value: '', title: '(type)' }]
    TYPES.forEach((type) => {
      typeOptions.push({ value: type, title: TYPE_LABELS[type], selected: typeValue === type })
    })
    const typeSelect = this.theme.getBuilderSelect({ className: 'jedi-sb-prop-type', options: typeOptions })
    typeSelect.addEventListener('change', () => {
      if (typeSelect.value) {
        schema.type = typeSelect.value
      } else {
        delete schema.type
      }
      this.onStructuralChange()
    })

    const toggleBtn = btn(this.theme, 'Edit', () => {
      this.toggleExpanded(name)
    })

    const deleteBtn = btn(this.theme, '×', () => {
      if (!window.confirm(`Delete property "${name}"?`)) return
      delete this.properties[name]
      this.removeFromRequired(name)
      this.onStructuralChange()
    }, { variant: 'danger' })

    const header = row(nameInput, typeSelect, toggleBtn, deleteBtn)
    const item = createElement('div', { class: 'jedi-sb-property', style: { marginBottom: '6px', paddingLeft: '10px', borderLeft: '1px solid #dee2e6' } }, [header])

    if (this.isExpanded(name) && this.renderNodeEditor) {
      item.appendChild(this.renderNodeEditor(schema, `${this.path}.properties.${name}`, this.depth + 1))
    }

    return item
  }

  addProperty (input) {
    let name = input.value.trim()
    if (!name) name = 'property'
    let finalName = name
    let counter = 1
    while (Object.prototype.hasOwnProperty.call(this.properties, finalName)) {
      finalName = `${name}${counter}`
      counter++
    }
    this.properties[finalName] = { type: 'string' }
    input.value = ''
    if (this.onSetExpanded) {
      this.onSetExpanded(`${this.path}.${finalName}`, true)
    }
    this.onStructuralChange()
  }

  toggleExpanded (name) {
    const key = `${this.path}.${name}`
    if (this.onSetExpanded) {
      this.onSetExpanded(key, !this.isExpanded(name))
    }
    this.onStructuralChange()
  }

  renameRequired (oldName, newName) {
    const required = this.required
    if (!isArray(required)) return
    const index = required.indexOf(oldName)
    if (index !== -1) {
      required[index] = newName
    }
  }

  removeFromRequired (name) {
    if (!isArray(this.required)) return
    const index = this.required.indexOf(name)
    if (index !== -1) {
      this.required.splice(index, 1)
    }
  }
}

export default PropertiesEditor
