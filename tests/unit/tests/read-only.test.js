/* global describe it expect */
const Jedison = require('../../../dist/cjs/jedison.cjs')

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    locked: { type: 'string', readOnly: true }
  }
}

const create = (options) => new Jedison.Create({ schema, data: { name: 'a', tags: ['x'], locked: 'l' }, ...options })

describe('readOnly option', () => {
  it('is off by default', () => {
    const jedison = create()
    expect(jedison.root.isReadOnly()).toBe(false)
    expect(jedison.getInstance('#/name').isReadOnly()).toBe(false)
  })

  it('cascades from the root to every child', () => {
    const jedison = create({ readOnly: true })
    expect(jedison.root.isReadOnly()).toBe(true)
    expect(jedison.getInstance('#/name').isReadOnly()).toBe(true)
    expect(jedison.getInstance('#/tags').isReadOnly()).toBe(true)
    expect(jedison.getInstance('#/tags/0').isReadOnly()).toBe(true)
  })

  it('keeps schema readOnly local to the subtree', () => {
    const jedison = create()
    expect(jedison.getInstance('#/locked').isReadOnly()).toBe(true)
    expect(jedison.getInstance('#/name').isReadOnly()).toBe(false)
  })

  it('does not block setValue from code', () => {
    const jedison = create({ readOnly: true })
    jedison.setValue({ name: 'b', tags: [], locked: 'l' })
    expect(jedison.getValue().name).toBe('b')
  })
})
