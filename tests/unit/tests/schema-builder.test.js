/**
 * @jest-environment jsdom
 */
/* global describe it expect beforeEach afterEach jest */
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
