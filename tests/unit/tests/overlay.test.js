/* global describe it expect */
const Jedison = require('../../../dist/cjs/jedison.cjs')
const { applyOverlay } = Jedison

const baseSchema = () => ({
  type: 'object',
  properties: {
    name: { type: 'string' },
    ssn: { type: 'string' },
    address: { type: 'object', properties: { street: { type: 'string' }, zip: { type: 'string' } } },
    tags: { type: 'array', items: { type: 'string' } }
  },
  required: ['name', 'ssn']
})

const overlay = (actions) => ({ overlay: '1.0.0', info: { title: 't', version: '1' }, actions })

describe('applyOverlay — JSONPath subset targeting', () => {
  it('targets a child by dot and bracket notation', () => {
    const out = applyOverlay(baseSchema(), overlay([
      { target: '$.properties.name', update: { 'x-format': 'textarea' } },
      { target: "$['properties']['ssn']", update: { 'x-hidden': true } }
    ]))
    expect(out.properties.name['x-format']).toBe('textarea')
    expect(out.properties.ssn['x-hidden']).toBe(true)
  })

  it('targets all children with a wildcard', () => {
    const out = applyOverlay(baseSchema(), overlay([
      { target: '$.properties.*', update: { 'x-titleHidden': true } }
    ]))
    expect(Object.values(out.properties).every((p) => p['x-titleHidden'] === true)).toBe(true)
  })

  it('targets array items by index (including negative)', () => {
    const out = applyOverlay(baseSchema(), overlay([
      { target: '$.required[-1]', remove: true }
    ]))
    expect(out.required).toEqual(['name'])
  })

  it('targets nodes at any depth with recursive descent', () => {
    const out = applyOverlay(baseSchema(), overlay([
      { target: '$..properties.street', update: { 'x-format': 'textarea' } }
    ]))
    expect(out.properties.address.properties.street['x-format']).toBe('textarea')
  })

  it('supports unions of names', () => {
    const out = applyOverlay(baseSchema(), overlay([
      { target: "$.properties['name','ssn']", update: { readOnly: true } }
    ]))
    expect(out.properties.name.readOnly).toBe(true)
    expect(out.properties.ssn.readOnly).toBe(true)
    expect(out.properties.address.readOnly).toBeUndefined()
  })

  it('throws on unsupported JSONPath constructs', () => {
    expect(() => applyOverlay(baseSchema(), overlay([{ target: "$.properties[?@.type=='string']", update: {} }]))).toThrow(/filter/)
    expect(() => applyOverlay(baseSchema(), overlay([{ target: '$.required[0:1]', remove: true }]))).toThrow(/slice/)
    expect(() => applyOverlay(baseSchema(), overlay([{ target: '$.required.length()', update: {} }]))).toThrow(/function/)
    expect(() => applyOverlay(baseSchema(), overlay([{ target: 'properties.name', update: {} }]))).toThrow(/start with/)
  })
})

describe('applyOverlay — update merge semantics', () => {
  it('deep-merges into object nodes', () => {
    const out = applyOverlay(baseSchema(), overlay([
      { target: '$.properties.address', update: { 'x-format': 'grid', properties: { country: { type: 'string' } } } }
    ]))
    expect(out.properties.address['x-format']).toBe('grid')
    expect(out.properties.address.properties.street).toEqual({ type: 'string' })
    expect(out.properties.address.properties.country).toEqual({ type: 'string' })
  })

  it('concatenates when updating an array node with an array', () => {
    const out = applyOverlay(baseSchema(), overlay([{ target: '$.required', update: ['email'] }]))
    expect(out.required).toEqual(['name', 'ssn', 'email'])
  })

  it('appends when updating an array node with a non-array', () => {
    const out = applyOverlay(baseSchema(), overlay([{ target: '$.required', update: 'email' }]))
    expect(out.required).toEqual(['name', 'ssn', 'email'])
  })

  it('replaces primitive nodes', () => {
    const out = applyOverlay(baseSchema(), overlay([{ target: '$.properties.name.type', update: 'integer' }]))
    expect(out.properties.name.type).toBe('integer')
  })
})

describe('applyOverlay — remove semantics', () => {
  it('removes an object property', () => {
    const out = applyOverlay(baseSchema(), overlay([{ target: '$.properties.ssn', remove: true }]))
    expect(Object.keys(out.properties)).toEqual(['name', 'address', 'tags'])
  })

  it('removes matching array items regardless of order', () => {
    const out = applyOverlay({ list: ['a', 'b', 'c', 'd'] }, overlay([
      { target: '$.list[0]', remove: true },
      { target: '$.list[1]', remove: true }
    ]))
    expect(out.list).toEqual(['b', 'd'])
  })

  it('throws when removing the root', () => {
    expect(() => applyOverlay(baseSchema(), overlay([{ target: '$', remove: true }]))).toThrow(/root/)
  })
})

describe('applyOverlay — general behaviour', () => {
  it('applies actions in order (last write wins)', () => {
    const out = applyOverlay(baseSchema(), overlay([
      { target: '$.properties.*', update: { 'x-hidden': false } },
      { target: '$.properties.ssn', update: { 'x-hidden': true } }
    ]))
    expect(out.properties.name['x-hidden']).toBe(false)
    expect(out.properties.ssn['x-hidden']).toBe(true)
  })

  it('treats a zero-match action as a no-op', () => {
    const out = applyOverlay(baseSchema(), overlay([{ target: '$.properties.nope', update: { x: 1 } }]))
    expect(out).toEqual(baseSchema())
  })

  it('never mutates the input schema', () => {
    const input = baseSchema()
    applyOverlay(input, overlay([{ target: '$.properties.name', update: { 'x-format': 'textarea' } }]))
    expect(input.properties.name).toEqual({ type: 'string' })
  })

  it('returns a clone unchanged when no overlay is given', () => {
    expect(applyOverlay(baseSchema(), null)).toEqual(baseSchema())
    expect(applyOverlay(baseSchema(), undefined)).toEqual(baseSchema())
  })

  it('throws on a malformed overlay document', () => {
    expect(() => applyOverlay(baseSchema(), { overlay: '1.0.0' })).toThrow(/actions/)
    expect(() => applyOverlay(baseSchema(), overlay([{ update: {} }]))).toThrow(/target/)
  })
})
