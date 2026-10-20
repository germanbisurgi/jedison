/* global describe it expect */
const Jedison = require('../../../dist/cjs/jedison.cjs')
const { Create } = Jedison

// "kind" is only declared inside "if", and "list" has no type of its own (wrapped in InstanceMultiple)
const conditionalSchema = (extra = {}) => ({
  ...extra,
  if: { properties: { kind: { const: 'numbers' } }, required: ['kind'] },
  then: { properties: { list: { items: { type: 'number' } } } },
  else: { properties: { list: { items: { type: 'string' } } } }
})

describe('InstanceIfThenElse — branch selection and stale instances', () => {
  [
    ['without a root type', () => conditionalSchema()],
    ['with root type object', () => conditionalSchema({ type: 'object' })]
  ].forEach(([name, makeSchema]) => {
    describe(name, () => {
      it('picks "then" when a property declared only in "if" matches', () => {
        const jedison = new Create({ schema: makeSchema() })
        jedison.setValue({ kind: 'numbers', list: [1.1] })

        expect(jedison.getErrors()).toStrictEqual([])
        expect(jedison.getValue()).toStrictEqual({ kind: 'numbers', list: [1.1] })
      })

      it('still reports errors against the active "then" branch', () => {
        const jedison = new Create({ schema: makeSchema() })
        jedison.setValue({ kind: 'numbers', list: ['foo'] })

        expect(jedison.getErrors().map((error) => error.path)).toContain('#/list/0')
      })

      it('picks "else" when the "if" does not match', () => {
        const jedison = new Create({ schema: makeSchema() })
        jedison.setValue({ kind: 'strings', list: ['foo'] })

        expect(jedison.getErrors()).toStrictEqual([])
      })

      it('does not leak errors from the branch that was active before', () => {
        const jedison = new Create({ schema: makeSchema() })

        jedison.setValue({ kind: 'strings', list: ['foo'] })
        jedison.setValue({ kind: 'numbers', list: [1.1, 2.2] })

        expect(jedison.getErrors()).toStrictEqual([])

        jedison.setValue({ kind: 'strings', list: ['foo', 'bar'] })

        expect(jedison.getErrors()).toStrictEqual([])
      })
    })
  })

  it('does not modify the schema object it is given', () => {
    const schema = conditionalSchema({ type: 'object' })
    const before = JSON.stringify(schema)

    const jedison = new Create({ schema })
    jedison.setValue({ kind: 'numbers', list: [1.1] })

    expect(JSON.stringify(schema)).toBe(before)
  })
})
