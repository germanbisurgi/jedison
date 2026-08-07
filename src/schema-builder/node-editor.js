import { isArray, isObject } from '../helpers/utils.js'
import { TYPES, TYPE_LABELS, KEYWORD_LABELS, getConstraintsForType, getValueKeywords, getCompositionKeywords, getKeywordKind } from './schema-keywords.js'
import PropertiesEditor from './properties-editor.js'
import { createElement, btn, fieldRow, row, section } from './dom.js'

function defaultValue (key) {
  switch (key) {
    case 'enum':
      return []
    case 'oneOf':
    case 'anyOf':
    case 'allOf':
    case 'prefixItems':
      return [{ type: 'string' }]
    case 'default':
    case 'const':
      return null
    case 'not':
    case 'if':
    case 'then':
    case 'else':
    case 'items':
      return {}
    case 'additionalProperties':
    case 'uniqueItems':
      return false
    default:
      return ''
  }
}

/**
 * Renders the editable form fields for a single schema node.
 */
class NodeEditor {
  /**
   * @param {object} options
   * @param {object} options.schema - The schema node (mutated in place)
   * @param {string} options.draft - Active draft
   * @param {number} options.depth - Nesting depth
   * @param {number} options.maxDepth - Maximum nesting depth
   * @param {string} options.path - Human readable path for labels
   * @param {Function} options.onChange - Called on non-structural changes
   * @param {Function} options.onStructuralChange - Called when the UI must re-render
   * @param {object} options.expanded - Map of expanded property paths -> boolean
   * @param {Function} options.onSetExpanded - (key, expanded) => void
   * @param {Function} options.renderNodeEditor - (schema, path, depth) => HTMLElement
   * @param {object} options.theme - Theme used to build the controls
   */
  constructor ({ schema, draft, depth, maxDepth, path, onChange, onStructuralChange, expanded, onSetExpanded, renderNodeEditor, theme }) {
    this.schema = schema
    this.draft = draft
    this.depth = depth
    this.maxDepth = maxDepth
    this.path = path
    this.onChange = onChange
    this.onStructuralChange = onStructuralChange
    this.expanded = expanded
    this.onSetExpanded = onSetExpanded
    this.renderNodeEditor = renderNodeEditor
    this.theme = theme
  }

  has (key) {
    return this.schema[key] !== undefined
  }

  get type () {
    return isArray(this.schema.type) ? null : this.schema.type
  }

  render () {
    if (!isObject(this.schema)) {
      return createElement('div', { class: 'jedi-sb-node-editor' }, ['Schema must be an object.'])
    }

    const container = createElement('div', { class: 'jedi-sb-node-editor' })

    container.appendChild(section(this.theme, 'Identity', this.renderIdentity()))
    container.appendChild(section(this.theme, 'Type', this.renderType()))
    container.appendChild(this.renderValues())

    const type = this.type
    if (type) {
      const constraints = getConstraintsForType(type)
      if (constraints.length > 0 || this.has('additionalProperties')) {
        container.appendChild(section(this.theme, 'Constraints', this.renderConstraints(constraints)))
      }

      if (type === 'array') {
        container.appendChild(section(this.theme, 'Array items', this.renderItems()))
      }

      if (type === 'object') {
        container.appendChild(this.renderProperties())
      }
    }

    if (type === 'object' || isObject(this.schema.patternProperties)) {
      container.appendChild(this.renderPatternProperties())
    }

    container.appendChild(this.renderComposition())

    return container
  }

  renderIdentity () {
    const fields = []
    const inputs = {}

    const text = (key) => {
      const input = this.theme.getBuilderInput({ type: 'text', value: this.schema[key] ?? '' })
      input.addEventListener('input', () => {
        const value = input.value
        if (value === '') {
          delete this.schema[key]
        } else {
          this.schema[key] = value
        }
        this.onChange()
      })
      return input
    }

    inputs.title = text('title')
    inputs.description = this.theme.getBuilderTextarea({ rows: 2, value: this.schema.description ?? '' })
    inputs.description.addEventListener('input', () => {
      if (inputs.description.value === '') {
        delete this.schema.description
      } else {
        this.schema.description = inputs.description.value
      }
      this.onChange()
    })
    inputs.format = text('format')
    inputs.$ref = text('$ref')

    fields.push(fieldRow(this.theme, { id: 'sb-title', label: KEYWORD_LABELS.title, input: inputs.title }))
    fields.push(fieldRow(this.theme, { id: 'sb-description', label: KEYWORD_LABELS.description, input: inputs.description }))
    fields.push(fieldRow(this.theme, { id: 'sb-format', label: KEYWORD_LABELS.format, input: inputs.format }))
    fields.push(fieldRow(this.theme, { id: 'sb-ref', label: KEYWORD_LABELS.$ref, input: inputs.$ref, hint: 'Kept as plain text; ref resolution is out of scope.' }))

    return createElement('div', {}, fields)
  }

  renderType () {
    const current = this.schema.type

    if (isArray(current)) {
      const textarea = this.renderJsonField('type', current, 'Change this to a single type to use the select control.')
      return createElement('div', {}, [
        fieldRow(this.theme, { id: 'sb-type-array', label: KEYWORD_LABELS.type, input: textarea, hint: 'Multi-type schemas are edited as a JSON array.' })
      ])
    }

    const options = [{ value: '', title: '(any type)' }]
    TYPES.forEach((type) => {
      options.push({ value: type, title: TYPE_LABELS[type], selected: type === current })
    })
    const select = this.theme.getBuilderSelect({ options })
    select.addEventListener('change', () => {
      if (select.value) {
        this.schema.type = select.value
      } else {
        delete this.schema.type
      }
      this.onStructuralChange()
    })

    return createElement('div', {}, [fieldRow(this.theme, { id: 'sb-type', label: KEYWORD_LABELS.type, input: select })])
  }

  renderValues () {
    const keywords = getValueKeywords()
    const existing = keywords.filter((key) => this.has(key))
    const missing = keywords.filter((key) => !this.has(key))
    const rows = []

    existing.forEach((key) => {
      rows.push(this.renderKeywordField(key))
    })

    if (missing.length > 0) {
      rows.push(this.renderAddSelect(missing, (key) => {
        this.schema[key] = defaultValue(key)
        this.onStructuralChange()
      }, 'Add value…'))
    }

    if (rows.length === 0) {
      return createElement('div')
    }

    return section(this.theme, 'Values', createElement('div', {}, rows))
  }

  renderConstraints (constraints) {
    const existing = constraints.filter((key) => this.has(key))
    const missing = constraints.filter((key) => !this.has(key))
    const rows = []

    existing.forEach((key) => {
      rows.push(this.renderKeywordField(key))
    })

    if (missing.length > 0) {
      rows.push(this.renderAddSelect(missing, (key) => {
        this.schema[key] = defaultValue(key)
        this.onStructuralChange()
      }, 'Add constraint…'))
    }

    return createElement('div', {}, rows)
  }

  renderItems () {
    if (this.has('items')) {
      if (isObject(this.schema.items)) {
        const body = createElement('div', {}, [this.renderNodeEditor(this.schema.items, `${this.path}.items`, this.depth + 1)])
        const remove = btn(this.theme, 'Remove items', () => {
          delete this.schema.items
          this.onStructuralChange()
        }, { variant: 'danger' })
        return createElement('div', {}, [row(body, remove)])
      }
      return createElement('div', {}, [this.renderKeywordField('items')])
    }

    const add = btn(this.theme, '+ Add items schema', () => {
      this.schema.items = {}
      this.onStructuralChange()
    }, { variant: 'primary' })
    return createElement('div', {}, [add])
  }

  renderProperties () {
    if (this.depth >= this.maxDepth) {
      return createElement('div', { class: 'jedi-sb-max-depth', style: { color: '#b02a37', fontSize: '12px', margin: '8px 0' } }, ['Maximum nesting depth reached.'])
    }

    if (!this.schema.properties) {
      const add = btn(this.theme, '+ Add properties', () => {
        this.schema.properties = {}
        this.onStructuralChange()
      }, { variant: 'primary' })
      return createElement('div', { class: 'jedi-sb-properties-block' }, [add])
    }

    const editor = new PropertiesEditor({
      properties: this.schema.properties,
      required: this.schema.required,
      onSetRequired: () => {
        this.schema.required = isArray(this.schema.required) ? this.schema.required : []
        return this.schema.required
      },
      draft: this.draft,
      depth: this.depth,
      path: this.path,
      expanded: this.expanded,
      onSetExpanded: this.onSetExpanded,
      onChange: this.onChange,
      onStructuralChange: this.onStructuralChange,
      renderNodeEditor: this.renderNodeEditor,
      theme: this.theme
    })

    return editor.render()
  }

  renderPatternProperties () {
    if (this.depth >= this.maxDepth) {
      return createElement('div', { class: 'jedi-sb-max-depth', style: { color: '#b02a37', fontSize: '12px', margin: '8px 0' } }, ['Maximum nesting depth reached.'])
    }

    if (!isObject(this.schema.patternProperties)) {
      const add = btn(this.theme, '+ Add patternProperties', () => {
        this.schema.patternProperties = {}
        this.onStructuralChange()
      }, { variant: 'primary' })
      return createElement('div', { class: 'jedi-sb-pattern-properties-block' }, [add])
    }

    const textarea = this.renderJsonField('patternProperties', this.schema.patternProperties)
    const remove = btn(this.theme, '×', () => {
      delete this.schema.patternProperties
      this.onStructuralChange()
    }, { variant: 'danger' })
    const hint = createElement('div', { class: 'jedi-sb-hint', style: { color: '#999', fontSize: '12px' } }, ['Edited as JSON; one subschema per regex key.'])
    return section(this.theme, 'Pattern properties', createElement('div', {}, [row(textarea, remove), hint]))
  }

  renderComposition () {
    const keywords = getCompositionKeywords()
    const existing = keywords.filter((key) => this.has(key))
    const missing = keywords.filter((key) => !this.has(key))
    const rows = []

    existing.forEach((key) => {
      rows.push(this.renderKeywordField(key))
    })

    if (missing.length > 0) {
      rows.push(this.renderAddSelect(missing, (key) => {
        this.schema[key] = defaultValue(key)
        this.onStructuralChange()
      }, 'Add composition…'))
    }

    if (rows.length === 0) {
      return createElement('div')
    }

    return section(this.theme, 'Composition', createElement('div', {}, rows))
  }

  renderKeywordField (key) {
    const kind = getKeywordKind(key, this.draft)
    const id = 'sb-field-' + (this.path ? this.path.replace(/[^a-zA-Z0-9]+/g, '-') + '-' : '') + key

    const remove = btn(this.theme, '×', () => {
      delete this.schema[key]
      this.onStructuralChange()
    }, { variant: 'danger' })

    if (key === 'additionalProperties' && isObject(this.schema[key])) {
      const input = this.renderJsonField(key, this.schema[key])
      const asBoolean = btn(this.theme, 'as boolean', () => {
        this.schema[key] = false
        this.onStructuralChange()
      }, { variant: 'secondary' })
      const actions = createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, [asBoolean, remove])
      return row(fieldRow(this.theme, { id, label: KEYWORD_LABELS[key], input }), actions)
    }

    if (kind === 'boolean') {
      const input = this.theme.getBuilderCheckbox({ checked: this.schema[key] === true })
      input.addEventListener('change', () => {
        this.schema[key] = input.checked
        this.onChange()
      })
      const actions = [remove]
      if (key === 'additionalProperties') {
        const asSchema = btn(this.theme, 'as schema', () => {
          this.schema[key] = {}
          this.onStructuralChange()
        }, { variant: 'secondary' })
        actions.unshift(asSchema)
      }
      return row(fieldRow(this.theme, { id, label: KEYWORD_LABELS[key], input }), createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, actions))
    }

    let input
    if (kind === 'json') {
      input = this.renderJsonField(key, this.schema[key])
    } else if (kind === 'textarea') {
      input = this.theme.getBuilderTextarea({ rows: 2, value: this.schema[key] ?? '' })
      input.addEventListener('input', () => this.writeText(key, input))
    } else if (kind === 'non-negative-integer' || kind === 'positive-number' || kind === 'number') {
      input = this.theme.getBuilderInput({ type: 'number', value: this.schema[key], min: kind === 'non-negative-integer' ? '0' : undefined, step: kind === 'non-negative-integer' ? '1' : 'any' })
      input.addEventListener('change', () => this.writeNumber(key, input))
    } else {
      input = this.theme.getBuilderInput({ type: 'text', value: this.schema[key] ?? '' })
      input.addEventListener('input', () => this.writeText(key, input))
    }

    return row(fieldRow(this.theme, { id, label: KEYWORD_LABELS[key] || key, input }), remove)
  }

  renderJsonField (key, value, hint) {
    const input = this.theme.getBuilderTextarea({
      rows: 4,
      style: { fontFamily: 'monospace', fontSize: '12px' },
      value: JSON.stringify(value, null, 2)
    })

    const container = createElement('div', { class: 'jedi-sb-json-field' })
    container.appendChild(input)

    if (hint) {
      container.appendChild(createElement('div', { class: 'jedi-sb-hint', style: { color: '#999', fontSize: '12px' } }, [hint]))
    }

    let errorEl = null

    const validate = () => {
      try {
        const parsed = JSON.parse(input.value)
        this.schema[key] = parsed
        if (errorEl) errorEl.textContent = ''
        this.onChange()
      } catch (error) {
        if (!errorEl) {
          errorEl = createElement('div', { class: 'jedi-sb-error', style: { color: '#d9534f', fontSize: '12px' } })
          container.appendChild(errorEl)
        }
        errorEl.textContent = 'Invalid JSON: ' + error.message
      }
    }

    input.addEventListener('change', validate)
    input.addEventListener('blur', validate)

    return container
  }

  writeText (key, input) {
    if (input.value === '') {
      delete this.schema[key]
    } else {
      this.schema[key] = input.value
    }
    this.onChange()
  }

  writeNumber (key, input) {
    if (input.value === '') {
      delete this.schema[key]
      this.onStructuralChange()
      return
    }
    const parsed = Number(input.value)
    if (Number.isNaN(parsed)) return
    this.schema[key] = parsed
    this.onChange()
  }

  renderAddSelect (keywords, onAdd, placeholder) {
    const options = keywords.map((key) => ({ value: key, title: KEYWORD_LABELS[key] || key }))
    const select = this.theme.getBuilderSelect({ className: 'jedi-sb-add-select', options, placeholder })
    select.addEventListener('change', () => {
      if (select.value) {
        onAdd(select.value)
        select.value = ''
      }
    })
    return select
  }
}

export default NodeEditor
