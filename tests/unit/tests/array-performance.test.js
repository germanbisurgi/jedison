/* global describe it expect */
const Jedison = require('../../../dist/cjs/jedison.cjs')

const ITEMS = 300

const schema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      a: { type: 'string' },
      b: { type: 'string' },
      c: { type: 'string' }
    }
  }
}

const data = () => Array.from({ length: ITEMS }, (_, i) => ({ a: 'a' + i, b: 'b' + i, c: 'c' + i }))

// Headless: counts instance creations, which is deterministic (unlike timings).
const create = () => {
  const jedison = new Jedison.Create({ schema, data: data() })
  let created = 0
  const original = jedison.createInstance.bind(jedison)
  jedison.createInstance = (config) => {
    created++
    return original(config)
  }
  return { jedison, created: () => created, reset: () => { created = 0 } }
}

describe('array performance (B7)', () => {
  it('editing one field does not recreate sibling item instances', () => {
    const { jedison, created, reset } = create()
    reset()

    jedison.getInstance('#/150/a').setValue('changed')

    expect(jedison.getValue()[150].a).toBe('changed')
    // Only the edited instance may be touched; the other 299 items stay as they are.
    expect(created()).toBe(0)
  })

  it('setValue with identical data does not recreate item instances', () => {
    const { jedison, created, reset } = create()
    reset()

    jedison.setValue(data())

    expect(created()).toBe(0)
  })

  it('setValue changing one item keeps the other instances', () => {
    const { jedison, created, reset } = create()
    const next = data()
    next[10].a = 'changed'
    reset()

    jedison.setValue(next)

    expect(jedison.getValue()[10].a).toBe('changed')
    expect(created()).toBe(0)
  })

  it('keeps paths and values right after delete, move and add', () => {
    const { jedison } = create()
    const array = jedison.getInstance('#')

    array.deleteItem(0)
    expect(jedison.getValue().length).toBe(ITEMS - 1)
    expect(jedison.getValue()[0].a).toBe('a1')

    array.move(0, 2)
    expect(jedison.getValue().slice(0, 3).map((item) => item.a)).toEqual(['a2', 'a3', 'a1'])

    array.addItemAfter(0)
    expect(jedison.getValue().length).toBe(ITEMS)
    expect(jedison.getInstance('#/1').getValue()).toEqual({ a: '', b: '', c: '' })
    expect(jedison.getInstance('#/2').getValue().a).toBe('a3')
  })
})
