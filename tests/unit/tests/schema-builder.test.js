/**
 * @jest-environment jsdom
 */
/* global describe it expect beforeEach afterEach jest KeyboardEvent */
const Jedison = require('../../../dist/cjs/jedison.cjs')
const { SchemaBuilder, Create } = Jedison

const DRAFT_07 = 'http://json-schema.org/draft-07/schema#'
const DRAFT_2020 = 'https://json-schema.org/draft/2020-12/schema'

const validSchema = () => ({
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'integer', minimum: 0 }
  },
  required: ['name']
})

let container

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  if (container) {
    container.innerHTML = ''
    document.body.removeChild(container)
  }
  container = null
  jest.useRealTimers()
})

describe('SchemaBuilder — rendering', () => {
  it('renders toolbar, builder and preview panes into the container', () => {
    new SchemaBuilder({ container, view: 'visual', schema: validSchema() })
    expect(container.querySelector('.jedi-sb-toolbar')).toBeTruthy()
    expect(container.querySelector('.jedi-sb-builder-pane')).toBeTruthy()
    expect(container.querySelector('.jedi-sb-preview-pane')).toBeTruthy()
    expect(container.querySelector('.jedi-sb-node-editor')).toBeTruthy()
  })

  it('defaults to the latest draft when no $schema is given', () => {
    const builder = new SchemaBuilder({ container, schema: validSchema() })
    expect(builder.draft).toBe(DRAFT_2020)
  })

  it('detects the draft from an existing $schema', () => {
    const builder = new SchemaBuilder({ container, schema: { ...validSchema(), $schema: DRAFT_07 } })
    expect(builder.draft).toBe(DRAFT_07)
  })

  it('starts from an empty object schema when none is given', () => {
    const builder = new SchemaBuilder({ container })
    expect(builder.getSchema()).toEqual({ type: 'object', properties: {} })
  })
})

describe('SchemaBuilder — schema management', () => {
  it('getSchema returns a deep clone', () => {
    const builder = new SchemaBuilder({ container, schema: validSchema() })
    const out = builder.getSchema()
    out.properties.name.type = 'number'
    expect(builder.getSchema().properties.name.type).toBe('string')
  })

  it('setSchema replaces the schema and updates the draft', () => {
    const builder = new SchemaBuilder({ container, schema: validSchema() })
    builder.setSchema({ type: 'string', $schema: DRAFT_07 })
    expect(builder.getSchema()).toEqual({ type: 'string', $schema: DRAFT_07 })
    expect(builder.draft).toBe(DRAFT_07)
  })

  it('setSchema resets to a default object schema for non-objects', () => {
    const builder = new SchemaBuilder({ container })
    builder.setSchema(false)
    expect(builder.getSchema()).toEqual({ type: 'object', properties: {} })
  })

  it('emits change with a clone of the schema', () => {
    const builder = new SchemaBuilder({ container, schema: validSchema() })
    const changes = []
    builder.on('change', (schema) => changes.push(schema))
    builder.setSchema({ type: 'string' })
    expect(changes).toHaveLength(1)
    expect(changes[0]).toEqual({ type: 'string' })
    changes[0].type = 'number'
    expect(builder.getSchema().type).toBe('string')
  })

  it('emits validate with the result', () => {
    const builder = new SchemaBuilder({ container })
    let result = null
    builder.on('validate', (r) => { result = r })
    builder.validate()
    expect(result).toEqual({ valid: true, errors: [] })
  })
})

describe('SchemaBuilder — validation', () => {
  it('reports no errors for a valid schema', () => {
    const builder = new SchemaBuilder({ container, schema: validSchema() })
    expect(builder.getErrors()).toEqual([])
    expect(builder.getErrors()).toHaveLength(0)
  })

  it('reports errors with a path for an invalid schema', () => {
    const builder = new SchemaBuilder({ container, schema: { type: 'object', properties: { a: { type: 'bogus' } } } })
    expect(builder.getErrors()).toHaveLength(1)
    expect(builder.getErrors()[0].path).toBe('#.properties.a')
    expect(builder.getErrors()[0].message).toMatch(/must be one of/)
  })

  it('updates the status badge to match the error count', () => {
    const builder = new SchemaBuilder({ container, schema: validSchema() })
    expect(builder.statusBadge.textContent).toBe('✓ Valid')

    builder.setSchema({ type: 'object', properties: { a: { type: 'bogus' } } })
    expect(builder.statusBadge.textContent).toBe('1 error')

    builder.setSchema(validSchema())
    expect(builder.statusBadge.textContent).toBe('✓ Valid')
  })

  it('renders an errors panel listing the validation errors', () => {
    const builder = new SchemaBuilder({ container, schema: { type: 'object', properties: { a: { type: 'bogus' } } } })
    expect(builder.errorsPanel.textContent).toContain('Schema validation errors')
    expect(builder.errorsPanel.textContent).toContain('#.properties.a')
  })
})

describe('SchemaBuilder — preview', () => {
  it('renders a read-only Jedison preview when the schema is valid', () => {
    jest.useFakeTimers()
    const builder = new SchemaBuilder({ container, schema: validSchema() })
    jest.advanceTimersByTime(300)
    expect(builder.preview).toBeInstanceOf(Create)
    const editorInputs = Array.from(builder.previewPane.querySelectorAll('input, select, textarea')).filter((el) => el.type !== 'hidden')
    expect(editorInputs.length).toBeGreaterThan(0)
    editorInputs.forEach((el) => expect(el.disabled).toBe(true))
  })

  it('shows a hint instead of a preview when validation fails', () => {
    jest.useFakeTimers()
    const builder = new SchemaBuilder({ container, schema: { type: 'object', properties: { a: { type: 'bogus' } } } })
    jest.advanceTimersByTime(300)
    expect(builder.preview).toBeNull()
    expect(builder.previewPane.textContent).toContain('Fix the validation errors to preview the form.')
  })
})

describe('SchemaBuilder — destroy', () => {
  it('clears the container and cancels pending preview work', () => {
    jest.useFakeTimers()
    const builder = new SchemaBuilder({ container, schema: validSchema() })
    builder.destroy()
    expect(container.children.length).toBe(0)
    expect(builder.container).toBeUndefined()
    expect(() => jest.advanceTimersByTime(300)).not.toThrow()
  })
})

describe('SchemaBuilder — text editor view', () => {
  const jsonTextarea = (builder) => builder.builderPane.querySelector('.jedi-sb-json')
  const setJson = (builder, text) => {
    jsonTextarea(builder).value = text
    jsonTextarea(builder).dispatchEvent(new Event('input', { bubbles: true }))
  }

  it('renders a text editor with the schema JSON by default', () => {
    const builder = new SchemaBuilder({ container, schema: validSchema() })
    expect(jsonTextarea(builder)).toBeTruthy()
    expect(container.querySelector('.jedi-sb-node-editor')).toBeNull()
    expect(JSON.parse(jsonTextarea(builder).value)).toEqual(validSchema())
  })

  it('renders the structured editor for view: "visual"', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema() })
    expect(jsonTextarea(builder)).toBeNull()
    expect(container.querySelector('.jedi-sb-node-editor')).toBeTruthy()
  })

  it('updates the schema and preview from valid JSON input', () => {
    jest.useFakeTimers()
    const builder = new SchemaBuilder({ container, schema: validSchema() })
    const next = { type: 'object', properties: { email: { type: 'string', format: 'email' } } }
    setJson(builder, JSON.stringify(next))
    jest.advanceTimersByTime(300)
    expect(builder.getSchema()).toEqual(next)
    expect(jsonTextarea(builder).value).toBe(JSON.stringify(next))
    jest.advanceTimersByTime(300)
    expect(builder.preview).toBeInstanceOf(Create)
  })

  it('keeps the raw text as typed after a valid parse', () => {
    jest.useFakeTimers()
    const builder = new SchemaBuilder({ container, schema: validSchema() })
    const raw = '{\n  "type": "string"\n}'
    setJson(builder, raw)
    jest.advanceTimersByTime(300)
    expect(builder.getSchema()).toEqual({ type: 'string' })
    expect(jsonTextarea(builder).value).toBe(raw)
  })

  it('shows an error and leaves the schema unchanged for invalid JSON', () => {
    jest.useFakeTimers()
    const builder = new SchemaBuilder({ container, schema: validSchema() })
    setJson(builder, '{ type: "string" }')
    jest.advanceTimersByTime(300)
    expect(builder.getSchema()).toEqual(validSchema())
    expect(container.querySelector('.jedi-sb-json-error').textContent).toMatch(/Invalid JSON/)
    expect(builder.statusBadge.textContent).toBe('✓ Valid')
  })

  it('prettifies the JSON with the Format button', () => {
    jest.useFakeTimers()
    const builder = new SchemaBuilder({ container, schema: validSchema() })
    const minified = JSON.stringify(validSchema())
    setJson(builder, minified)
    jest.advanceTimersByTime(300)
    expect(jsonTextarea(builder).value).toBe(minified)
    container.querySelector('.jedi-sb-format-btn').click()
    expect(jsonTextarea(builder).value).toBe(JSON.stringify(validSchema(), null, 2))
  })

  it('updates the text editor when setSchema is called externally', () => {
    const builder = new SchemaBuilder({ container, schema: validSchema() })
    builder.setSchema({ type: 'boolean' })
    expect(jsonTextarea(builder).value).toBe(JSON.stringify({ type: 'boolean' }, null, 2))
  })

  it('destroys cleanly with a pending JSON debounce', () => {
    jest.useFakeTimers()
    const builder = new SchemaBuilder({ container, schema: validSchema() })
    setJson(builder, '{ broken')
    builder.destroy()
    expect(container.children.length).toBe(0)
    expect(() => jest.advanceTimersByTime(300)).not.toThrow()
  })
})

describe('SchemaBuilder — theme-decorated chrome', () => {
  it('keeps bare hooks and inline styles with the base theme', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema() })
    expect(container.querySelector('.jedi-sb-toolbar .jedi-sb-btn').className).toBe('jedi-sb-btn')
    expect(container.querySelector('.jedi-sb-draft').classList.contains('form-control')).toBe(false)
    expect(builder.statusBadge.className).toBe('jedi-sb-status')
  })

  it('applies Bootstrap 3 classes to buttons, selects and status', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema(), theme: new Jedison.ThemeBootstrap3() })
    const toolbarBtn = container.querySelector('.jedi-sb-toolbar .jedi-sb-btn')
    expect(toolbarBtn.classList.contains('btn')).toBe(true)
    expect(toolbarBtn.classList.contains('btn-xs')).toBe(true)
    expect(toolbarBtn.classList.contains('btn-default')).toBe(true)
    expect(container.querySelector('.jedi-sb-draft').classList.contains('form-control')).toBe(true)
    expect(builder.statusBadge.classList.contains('label')).toBe(true)
    expect(builder.statusBadge.classList.contains('label-success')).toBe(true)
  })

  it('applies Bootstrap 4 classes to selects and status', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema(), theme: new Jedison.ThemeBootstrap4() })
    expect(container.querySelector('.jedi-sb-draft').classList.contains('form-control')).toBe(true)
    expect(container.querySelector('.jedi-sb-draft').classList.contains('form-control-sm')).toBe(true)
    expect(builder.statusBadge.classList.contains('badge')).toBe(true)
    expect(builder.statusBadge.classList.contains('badge-success')).toBe(true)
  })

  it('applies Bootstrap 5 classes to buttons, selects and status', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema(), theme: new Jedison.ThemeBootstrap5() })
    const toolbarBtn = container.querySelector('.jedi-sb-toolbar .jedi-sb-btn')
    expect(toolbarBtn.classList.contains('btn')).toBe(true)
    expect(toolbarBtn.classList.contains('btn-sm')).toBe(true)
    expect(toolbarBtn.classList.contains('btn-outline-secondary')).toBe(true)
    expect(container.querySelector('.jedi-sb-draft').classList.contains('form-select')).toBe(true)
    expect(container.querySelector('.jedi-sb-draft').classList.contains('form-select-sm')).toBe(true)
    expect(builder.statusBadge.classList.contains('badge')).toBe(true)
    expect(builder.statusBadge.classList.contains('text-bg-success')).toBe(true)
  })

  it('styles primary actions and the errors panel through the theme', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema(), theme: new Jedison.ThemeBootstrap5() })
    const addBtn = Array.from(container.querySelectorAll('.jedi-sb-btn')).find((b) => b.textContent === '+ Add property')
    expect(addBtn.classList.contains('btn-outline-primary')).toBe(true)

    builder.setSchema({ type: 'object', properties: { a: { type: 'bogus' } } })
    expect(builder.statusBadge.classList.contains('text-bg-danger')).toBe(true)
    const alert = builder.errorsPanel.querySelector('.alert.alert-danger')
    expect(alert).toBeTruthy()
    expect(alert.textContent).toContain('Schema validation errors')
  })

  it('styles the JSON text editor through the theme', () => {
    new SchemaBuilder({ container, schema: validSchema(), theme: new Jedison.ThemeBootstrap5() })
    expect(container.querySelector('.jedi-sb-json').classList.contains('form-control')).toBe(true)
  })
})

describe('SchemaBuilder — add-property type chooser', () => {
  const addButton = () => Array.from(container.querySelectorAll('.jedi-sb-btn')).find((b) => b.textContent === '+ Add property')
  const chooser = () => container.querySelector('.jedi-sb-type-chooser')
  const radio = (value) => {
    const el = Array.from(chooser().querySelectorAll('input[type="radio"]')).find((r) => r.value === value)
    return el
  }

  const openChooser = (builder, name) => {
    const input = container.querySelector('.jedi-sb-properties-block input[placeholder="property name"]')
    input.value = name
    addButton().click()
    return input
  }

  it('reveals the grouped chooser instead of creating a property on click', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema() })
    openChooser(builder, 'nick')
    expect(chooser()).toBeTruthy()
    expect(builder.getSchema().properties.nick).toBeUndefined()
  })

  it('groups scalar, structured and any-type options with separators', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema() })
    openChooser(builder, 'nick')
    const groups = chooser().querySelectorAll('.jedi-sb-type-group')
    expect(groups).toHaveLength(3)
    expect(groups[0].textContent).toContain('Scalar')
    expect(groups[0].textContent).toContain('string')
    expect(groups[0].textContent).toContain('null')
    expect(groups[1].textContent).toContain('object')
    expect(groups[1].textContent).toContain('array')
    expect(groups[2].textContent).toContain('Any type')
    expect(chooser().querySelectorAll('.jedi-sb-type-separator').length).toBeGreaterThanOrEqual(2)
    const radios = Array.from(chooser().querySelectorAll('input[type="radio"]'))
    expect(radios.length).toBe(8)
    radios.forEach((r) => expect(r.name).toBe('jedi-sb-new-property-type'))
  })

  it('Cancel dismisses the chooser without creating a property', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema() })
    openChooser(builder, 'nick')
    Array.from(chooser().querySelectorAll('button')).find((b) => b.textContent === 'Cancel').click()
    expect(chooser()).toBeNull()
    expect(builder.getSchema().properties.nick).toBeUndefined()
  })

  it('creates a collapsed scalar property with the chosen type', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema() })
    openChooser(builder, 'nick')
    radio('string').click()
    expect(builder.getSchema().properties.nick).toEqual({ type: 'string' })
    expect(builder.expandedProps['#.nick']).toBeUndefined()
    const item = Array.from(container.querySelectorAll('.jedi-sb-property')).find((el) => el.querySelector('.jedi-sb-prop-name').value === 'nick')
    expect(item.querySelector('.jedi-sb-node-editor')).toBeNull()
  })

  it('creates an auto-expanded object property', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema() })
    openChooser(builder, 'address')
    radio('object').click()
    expect(builder.getSchema().properties.address).toEqual({ type: 'object' })
    expect(builder.expandedProps['#.address']).toBe(true)
    const item = Array.from(container.querySelectorAll('.jedi-sb-property')).find((el) => el.querySelector('.jedi-sb-prop-name').value === 'address')
    expect(item.querySelector('.jedi-sb-node-editor')).toBeTruthy()
  })

  it('creates an auto-expanded array property', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema() })
    openChooser(builder, 'tags')
    radio('array').click()
    expect(builder.getSchema().properties.tags).toEqual({ type: 'array' })
    expect(builder.expandedProps['#.tags']).toBe(true)
    const item = Array.from(container.querySelectorAll('.jedi-sb-property')).find((el) => el.querySelector('.jedi-sb-prop-name').value === 'tags')
    expect(item.querySelector('.jedi-sb-node-editor')).toBeTruthy()
  })

  it('creates an unconstrained property from the Any type option', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema() })
    openChooser(builder, 'flex')
    radio('').click()
    expect(builder.getSchema().properties.flex).toEqual({})
    expect(builder.expandedProps['#.flex']).toBeUndefined()
  })

  it('dedupes property names with a numeric suffix', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema() })
    openChooser(builder, 'name')
    radio('string').click()
    expect(Object.keys(builder.getSchema().properties)).toContain('name1')
  })

  it('opens the chooser from Enter on the name input', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema() })
    const input = container.querySelector('.jedi-sb-properties-block input[placeholder="property name"]')
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(chooser()).toBeTruthy()
    expect(builder.getSchema().properties).toEqual(validSchema().properties)
  })

  it('Escape closes the chooser', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema() })
    openChooser(builder, 'nick')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(chooser()).toBeNull()
  })
})

describe('SchemaBuilder — nested visual editing', () => {
  const nestedSchema = () => ({
    type: 'object',
    properties: {
      address: {
        type: 'object',
        properties: {
          street: { type: 'string' }
        }
      }
    }
  })

  const expandAddress = (builder) => {
    builder.expandedProps['#.address'] = true
    builder.renderEditorPane()
    return Array.from(container.querySelectorAll('.jedi-sb-property')).find((el) => el.querySelector('.jedi-sb-prop-name')?.value === 'address')
  }

  it('editing a nested field updates the schema without throwing', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: nestedSchema() })
    const addressItem = expandAddress(builder)

    const nestedEditor = addressItem.querySelector('.jedi-sb-node-editor')
    const titleInput = nestedEditor.querySelector('input[type="text"]')
    expect(titleInput).toBeTruthy()
    titleInput.value = 'Street line'
    titleInput.dispatchEvent(new Event('input', { bubbles: true }))

    expect(builder.getSchema().properties.address.title).toBe('Street line')
    builder.destroy()
    builder.destroy()
  })

  it('enforces the max depth guard for nested properties', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: nestedSchema(), maxDepth: 1 })
    const addressItem = expandAddress(builder)
    expect(addressItem.textContent).toContain('Maximum nesting depth reached.')
    builder.destroy()
  })
})

describe('SchemaBuilder — keyword controls', () => {
  it('offers an as-schema toggle for a boolean additionalProperties', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: { type: 'object', additionalProperties: false } })
    const asSchemaBtn = Array.from(container.querySelectorAll('.jedi-sb-btn')).find((b) => b.textContent === 'as schema')
    expect(asSchemaBtn).toBeTruthy()
    asSchemaBtn.click()
    expect(builder.getSchema().additionalProperties).toEqual({})
  })

  it('offers an as-boolean toggle for an object additionalProperties', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: { type: 'object', additionalProperties: { type: 'string' } } })
    const asBooleanBtn = Array.from(container.querySelectorAll('.jedi-sb-btn')).find((b) => b.textContent === 'as boolean')
    expect(asBooleanBtn).toBeTruthy()
    asBooleanBtn.click()
    expect(builder.getSchema().additionalProperties).toBe(false)
  })

  it('renders a patternProperties section for object schemas', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema() })
    const addBtn = Array.from(container.querySelectorAll('.jedi-sb-btn')).find((b) => b.textContent === '+ Add patternProperties')
    expect(addBtn).toBeTruthy()
    addBtn.click()
    expect(builder.getSchema().patternProperties).toEqual({})
    const section = Array.from(container.querySelectorAll('.jedi-sb-section')).find((s) => s.textContent.startsWith('Pattern properties'))
    expect(section).toBeTruthy()
    expect(section.querySelector('textarea')).toBeTruthy()
  })

  it('renders imported patternProperties as JSON', () => {
    new SchemaBuilder({ container, view: 'visual', schema: { type: 'object', properties: {}, patternProperties: { '^x-': { type: 'string' } } } })
    const section = Array.from(container.querySelectorAll('.jedi-sb-section')).find((s) => s.textContent.startsWith('Pattern properties'))
    expect(section).toBeTruthy()
    expect(JSON.parse(section.querySelector('textarea').value)).toEqual({ '^x-': { type: 'string' } })
  })

  it('deletes a property only after arming the confirm', () => {
    jest.useFakeTimers()
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema() })
    const ageItem = Array.from(container.querySelectorAll('.jedi-sb-property')).find((el) => el.querySelector('.jedi-sb-prop-name')?.value === 'age')
    const deleteBtn = Array.from(ageItem.querySelectorAll('.jedi-sb-btn')).find((b) => b.textContent === '×')

    deleteBtn.click()
    expect(builder.getSchema().properties.age).toBeTruthy()
    expect(deleteBtn.textContent).toBe('Confirm?')

    deleteBtn.click()
    expect(builder.getSchema().properties.age).toBeUndefined()
  })
})

describe('SchemaBuilder — validation additions', () => {
  it('flags then/else without if', () => {
    const builder = new SchemaBuilder({ container, schema: { type: 'object', then: { type: 'string' } } })
    expect(builder.getErrors()).toEqual([{ path: '#', message: '"then"/"else" without "if" has no effect' }])
  })

  it('does not flag then/else when if is present', () => {
    const builder = new SchemaBuilder({ container, schema: { if: { type: 'string' }, then: {}, else: {} } })
    expect(builder.getErrors()).toEqual([])
  })

  it('flags an empty enum', () => {
    const builder = new SchemaBuilder({ container, schema: { type: 'string', enum: [] } })
    expect(builder.getErrors()).toHaveLength(1)
    expect(builder.getErrors()[0].message).toMatch(/non-empty/)
  })
})

describe('SchemaBuilder — layout zones', () => {
  const findSection = (title) => Array.from(container.querySelectorAll('.jedi-sb-section')).find((s) => s.querySelector('.jedi-sb-section-title')?.textContent === title)

  it('groups the schema definition at the top', () => {
    new SchemaBuilder({ container, view: 'visual', schema: validSchema() })
    const definition = findSection('Schema definition')
    expect(definition).toBeTruthy()
    const titles = Array.from(definition.querySelectorAll('.jedi-sb-section-title')).map((t) => t.textContent)
    expect(titles).toEqual(expect.arrayContaining(['Identity', 'Type', 'Constraints']))
    expect(definition.querySelector('.jedi-sb-properties-block')).toBeNull()
  })

  it('renders the Body zone with the add-property section at the top', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: validSchema() })
    const body = findSection('Body')
    expect(body).toBeTruthy()
    const sections = Array.from(body.querySelectorAll('.jedi-sb-section'))
    expect(sections[0].querySelector('.jedi-sb-section-title').textContent).toBe('Add property')
    expect(body.querySelector('.jedi-sb-property')).toBeTruthy()
    expect(builder.getSchema().properties).toEqual(validSchema().properties)
  })

  it('keeps the top-level sections in Schema definition / Body / Composition order', () => {
    new SchemaBuilder({ container, view: 'visual', schema: validSchema() })
    const titles = Array.from(container.querySelectorAll('.jedi-sb-node-editor > .jedi-sb-section')).map((s) => s.children[0].textContent)
    expect(titles).toEqual(['Schema definition', 'Body', 'Composition'])
  })
})

describe('SchemaBuilder — composition visual editing', () => {
  const findBtn = (root, text) => Array.from(root.querySelectorAll('.jedi-sb-btn')).find((b) => b.textContent === text)
  const addButtons = () => Array.from(container.querySelectorAll('.jedi-sb-composition-add .jedi-sb-btn')).map((b) => b.textContent)

  it('renders oneOf entries as nested node editors', () => {
    new SchemaBuilder({ container, view: 'visual', schema: { oneOf: [{ type: 'string' }, { type: 'number' }] } })
    const arrayEl = container.querySelector('.jedi-sb-composition-array')
    expect(arrayEl).toBeTruthy()
    const entries = arrayEl.querySelectorAll('.jedi-sb-composition-entry')
    expect(entries).toHaveLength(2)
    expect(entries[0].textContent).toContain('[0]')
    expect(entries[1].textContent).toContain('[1]')
    entries.forEach((entry) => {
      expect(entry.querySelector('.jedi-sb-node-editor')).toBeTruthy()
    })
    expect(arrayEl.querySelector('.jedi-sb-json-field')).toBeNull()
  })

  it('adds an entry to a schema-array composition', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: { oneOf: [{ type: 'string' }] } })
    findBtn(container.querySelector('.jedi-sb-composition-array'), '+ Add oneOf entry').click()
    expect(builder.getSchema().oneOf).toEqual([{ type: 'string' }, {}])
  })

  it('removes an entry from a schema-array composition', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: { oneOf: [{ type: 'string' }, { type: 'number' }] } })
    const removeEntryBtns = Array.from(container.querySelectorAll('.jedi-sb-composition-entry .jedi-sb-btn')).filter((b) => b.textContent === '× Remove entry')
    expect(removeEntryBtns).toHaveLength(2)
    removeEntryBtns[1].click()
    expect(builder.getSchema().oneOf).toEqual([{ type: 'string' }])
  })

  it('removes the whole composition keyword', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: { oneOf: [{ type: 'string' }] } })
    findBtn(container.querySelector('.jedi-sb-composition-array'), '× Remove oneOf').click()
    expect(builder.getSchema().oneOf).toBeUndefined()
  })

  it('renders not/if/then/else as single nested node editors', () => {
    new SchemaBuilder({ container, view: 'visual', schema: { not: { type: 'string' }, if: { type: 'string' }, then: {}, else: {} } })
    const singles = container.querySelectorAll('.jedi-sb-composition-single')
    expect(singles).toHaveLength(4)
    singles.forEach((el) => {
      expect(el.querySelector('.jedi-sb-node-editor')).toBeTruthy()
    })
    expect(container.querySelector('.jedi-sb-composition-single .jedi-sb-json-field')).toBeNull()
  })

  it('renders boolean subschemas as checkboxes', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: { not: false, oneOf: [true] } })
    const single = container.querySelector('.jedi-sb-composition-single')
    expect(single.textContent).toContain('(boolean schema)')

    const entry = container.querySelector('.jedi-sb-composition-entry')
    expect(entry.textContent).toContain('(boolean schema)')
    const checkbox = entry.querySelector('input[type="checkbox"]')
    expect(checkbox.checked).toBe(true)
    checkbox.click()
    expect(builder.getSchema().oneOf).toEqual([false])
  })

  it('hides then/else add buttons until if is added', () => {
    new SchemaBuilder({ container, view: 'visual', schema: {} })
    const buttons = addButtons()
    expect(buttons).toContain('+ oneOf')
    expect(buttons).toContain('+ not')
    expect(buttons).toContain('+ if')
    expect(buttons).not.toContain('+ then')
    expect(buttons).not.toContain('+ else')
  })

  it('offers then/else add buttons once if is present', () => {
    new SchemaBuilder({ container, view: 'visual', schema: { if: {} } })
    const buttons = addButtons()
    expect(buttons).toContain('+ then')
    expect(buttons).toContain('+ else')
  })

  it('adds oneOf with an [{}] default', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: {} })
    const root = container.querySelector('.jedi-sb-node-editor')
    const compSection = Array.from(root.children).find((el) => el.classList.contains('jedi-sb-section') && el.children[0].textContent === 'Composition')
    findBtn(compSection, '+ oneOf').click()
    expect(builder.getSchema().oneOf).toEqual([{}])
  })

  it('adds not with an {} default', () => {
    const builder = new SchemaBuilder({ container, view: 'visual', schema: {} })
    const root = container.querySelector('.jedi-sb-node-editor')
    const compSection = Array.from(root.children).find((el) => el.classList.contains('jedi-sb-section') && el.children[0].textContent === 'Composition')
    findBtn(compSection, '+ not').click()
    expect(builder.getSchema().not).toEqual({})
  })

  it('offers all seven types in the type select', () => {
    new SchemaBuilder({ container, view: 'visual', schema: {} })
    const select = container.querySelector('#sb-type')
    const options = Array.from(select.options).map((o) => o.value)
    expect(options).toEqual(['', 'string', 'number', 'integer', 'boolean', 'null', 'object', 'array'])
  })
})
