/* global describe it expect */
const Jedison = require('../../../dist/cjs/jedison.cjs')
const { Create } = Jedison

const errorsFor = (schema, value) => {
  const jedison = new Create({ schema })
  jedison.setValue(value)
  return jedison.getErrors()
}

describe('schemas written for older drafts', () => {
  it('supports a list in "items" with "additionalItems", without $schema', () => {
    const schema = { type: 'array', items: [{ type: 'string' }, { type: 'number' }], additionalItems: false }

    expect(errorsFor(schema, ['a', 1])).toStrictEqual([])
    expect(errorsFor(schema, [1, 1]).length).toBeGreaterThan(0)
    expect(errorsFor(schema, ['a', 1, true]).length).toBeGreaterThan(0)
  })

  it('supports "dependencies" with a list and with a schema', () => {
    const schema = {
      type: 'object',
      dependencies: { a: ['b'], c: { required: ['d'] } }
    }

    expect(errorsFor(schema, { a: 1 }).length).toBeGreaterThan(0)
    expect(errorsFor(schema, { a: 1, b: 1 })).toStrictEqual([])
    expect(errorsFor(schema, { c: 1 }).length).toBeGreaterThan(0)
    expect(errorsFor(schema, { c: 1, d: 1 })).toStrictEqual([])
  })

  it('reads boolean exclusiveMinimum in draft 4', () => {
    const schema = { $schema: 'http://json-schema.org/draft-04/schema#', type: 'number', minimum: 5, exclusiveMinimum: true }

    expect(errorsFor(schema, 5).length).toBeGreaterThan(0)
    expect(errorsFor(schema, 6)).toStrictEqual([])
  })

  describe('siblings of $ref in draft 7', () => {
    const makeSchema = () => ({
      $schema: 'http://json-schema.org/draft-07/schema#',
      definitions: { text: { type: 'string' } },
      type: 'object',
      properties: { name: { $ref: '#/definitions/text', maxLength: 1, title: 'Name' } }
    })

    const expandedName = async (jedisonOptions = {}) => {
      const schema = makeSchema()
      const refParser = new Jedison.RefParser()
      await refParser.dereference(schema)
      const jedison = new Create({ schema, refParser, ...jedisonOptions })

      return jedison.getInstance('#/name').schema
    }

    it('are ignored by default, as the spec says', async () => {
      const schema = await expandedName()

      expect(schema).toStrictEqual({ type: 'string' })
    })

    it('are kept with the keepRefSiblings option', async () => {
      const schema = await expandedName({ keepRefSiblings: true })

      expect(schema).toMatchObject({ type: 'string', maxLength: 1, title: 'Name' })
    })
  })

  it('points $ref into nested tuples after the rewrite', async () => {
    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      items: [{ items: [{ type: 'integer' }, { $ref: '#/items/0/items/0' }] }]
    }
    const refParser = new Jedison.RefParser()
    await refParser.dereference(schema)
    const jedison = new Create({ schema, refParser })

    jedison.setValue([[1, 'x']])
    expect(jedison.getErrors().length).toBeGreaterThan(0)

    jedison.setValue([[1, 2]])
    expect(jedison.getErrors()).toStrictEqual([])
  })

  it('detects the draft whether $schema uses http or https', () => {
    const schema = { $schema: 'https://json-schema.org/draft-07/schema#', type: 'array', items: [{ type: 'string' }], additionalItems: false }

    expect(errorsFor(schema, ['a'])).toStrictEqual([])
    expect(errorsFor(schema, ['a', 'b']).length).toBeGreaterThan(0)
  })

  it('does not modify the schema object it is given', () => {
    const schema = { type: 'array', items: [{ type: 'string' }] }
    const before = JSON.stringify(schema)

    errorsFor(schema, ['a'])

    expect(JSON.stringify(schema)).toBe(before)
  })
})
