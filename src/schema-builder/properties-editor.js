import { isArray, isObject } from '../helpers/utils.js'
import { TYPES, TYPE_LABELS, SCALAR_TYPES, STRUCTURED_TYPES, isStructuredType } from './schema-keywords.js'
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

    const container = createElement('div', { class: 'jedi-sb-properties-block' })
    container.appendChild(this.renderAddPropertySection())
    container.appendChild(this.renderRequired())
    container.appendChild(list)
    return container
  }

  renderAddPropertySection () {
    const addInput = this.theme.getBuilderInput({ type: 'text', placeholder: 'property name' })
    const addBtn = btn(this.theme, '+ Add property', () => {
      this.openTypeChooser(addInput)
    }, { variant: 'primary' })
    addInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') this.openTypeChooser(addInput)
    })

    const addRow = row(addInput, addBtn)
    this.addRow = addRow
    return section(this.theme, 'Add property', addRow)
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
      if (deleteBtn.dataset.armed === 'true') {
        delete this.properties[name]
        this.removeFromRequired(name)
        this.onStructuralChange()
        return
      }
      deleteBtn.dataset.armed = 'true'
      deleteBtn.textContent = 'Confirm?'
      deleteBtn.classList.add('jedi-sb-delete-armed')
      setTimeout(() => {
        deleteBtn.dataset.armed = ''
        deleteBtn.textContent = '×'
        deleteBtn.classList.remove('jedi-sb-delete-armed')
      }, 2000)
    }, { variant: 'danger' })

    const header = createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' } }, [
      createElement('div', { style: { flex: '1 1 auto' } }, [nameInput]),
      typeSelect,
      toggleBtn,
      deleteBtn
    ])
    const item = createElement('div', { class: 'jedi-sb-property', style: { marginBottom: '6px', paddingLeft: '10px', borderLeft: '1px solid #dee2e6' } }, [header])

    if (this.isExpanded(name) && this.renderNodeEditor) {
      item.appendChild(this.renderNodeEditor(schema, `${this.path}.properties.${name}`, this.depth + 1))
    }

    return item
  }

  openTypeChooser (addInput) {
    if (this.chooserEl) return
    this.addInput = addInput
    this.chooserEl = this.renderTypeChooser()
    this.addRow.parentNode.insertBefore(this.chooserEl, this.addRow.nextSibling)
    this.escapeHandler = (event) => {
      if (event.key === 'Escape') this.closeChooser()
    }
    document.addEventListener('keydown', this.escapeHandler)
  }

  closeChooser () {
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler)
      this.escapeHandler = null
    }
    if (this.chooserEl && this.chooserEl.parentNode) {
      this.chooserEl.parentNode.removeChild(this.chooserEl)
    }
    this.chooserEl = null
  }

  renderTypeChooser () {
    const groups = [
      { title: 'Scalar', options: SCALAR_TYPES.map((type) => ({ value: type, label: TYPE_LABELS[type] })) },
      { title: 'Structured', options: STRUCTURED_TYPES.map((type) => ({ value: type, label: TYPE_LABELS[type] })) },
      { title: 'Any type', options: [{ value: '', label: 'Any type (no type constraint)' }] }
    ]

    const children = []
    groups.forEach((group, index) => {
      if (index > 0) children.push(this.renderTypeSeparator())
      children.push(this.renderTypeGroup(group))
    })

    children.push(createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', marginTop: '6px' } }, [
      btn(this.theme, 'Cancel', () => this.closeChooser())
    ]))

    return createElement('div', { class: 'jedi-sb-type-chooser', style: { marginTop: '6px', padding: '8px 10px', border: '1px solid #dee2e6', borderRadius: '4px', background: '#f8f9fa' } }, children)
  }

  renderTypeGroup ({ title, options }) {
    const caption = createElement('div', { class: 'jedi-sb-type-group-title', style: { fontSize: '12px', color: '#6c757d', marginBottom: '4px' } }, [title])
    return createElement('div', { class: 'jedi-sb-type-group' }, [caption, ...options.map((option) => this.renderTypeOption(option))])
  }

  renderTypeOption ({ value, label }) {
    const radio = this.theme.getBuilderCheckbox({ className: 'jedi-sb-type-option' })
    radio.type = 'radio'
    radio.name = 'jedi-sb-new-property-type'
    radio.value = value
    radio.addEventListener('change', () => {
      this.closeChooser()
      this.addProperty(this.addInput, value)
    })
    return createElement('label', { class: 'jedi-sb-type-option-label', style: { display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '10px', fontSize: '13px', cursor: 'pointer' } }, [radio, label])
  }

  renderTypeSeparator () {
    return createElement('div', { class: 'jedi-sb-type-separator', style: { borderTop: '1px solid #dee2e6', margin: '6px 0' } })
  }

  addProperty (input, type) {
    let name = input.value.trim()
    if (!name) name = 'property'
    let finalName = name
    let counter = 1
    while (Object.prototype.hasOwnProperty.call(this.properties, finalName)) {
      finalName = `${name}${counter}`
      counter++
    }
    this.properties[finalName] = type ? { type } : {}
    input.value = ''
    if (isStructuredType(type) && this.onSetExpanded) {
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
