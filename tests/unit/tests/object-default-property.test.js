/* global describe it expect */
const Jedison = require('../../../dist/cjs/jedison.cjs')
const { RefParser, Create } = Jedison

describe('InstanceObject — x-defaultProperty through a $ref (issue #78)', () => {
  it('honors x-defaultProperty declared on a plain (non-referenced) property', async () => {
    const schema = {
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'string', 'x-defaultProperty': true }
      }
    }

    const refParser = new RefParser()
    await refParser.dereference(schema)

    const jedison = new Create({ schema, refParser, deactivateNonRequired: true })

    expect(jedison.getInstance('#/a')).toBeUndefined()
    expect(jedison.getInstance('#/b')).toBeDefined()
    expect(jedison.getInstance('#/b').isActive).toBe(true)
  })

  it('honors x-defaultProperty declared on the schema a property $ref points to', async () => {
    const schema = {
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { $ref: '#/$defs/b' }
      },
      $defs: {
        b: { type: 'string', 'x-defaultProperty': true }
      }
    }

    const refParser = new RefParser()
    await refParser.dereference(schema)

    const jedison = new Create({ schema, refParser, deactivateNonRequired: true })

    expect(jedison.getInstance('#/a')).toBeUndefined()
    expect(jedison.getInstance('#/b')).toBeDefined()
    expect(jedison.getInstance('#/b').isActive).toBe(true)
  })

  it('honors x-defaultProperty on a property inside a whole object referenced via $ref', async () => {
    const schema = {
      oneOf: [
        { $ref: '#/$defs/wrapper' }
      ],
      $defs: {
        wrapper: {
          type: 'object',
          properties: {
            a: { type: 'string' },
            b: { type: 'string', 'x-defaultProperty': true }
          }
        }
      }
    }

    const refParser = new RefParser()
    await refParser.dereference(schema)

    const jedison = new Create({ schema, refParser, deactivateNonRequired: true })

    expect(jedison.getInstance('#/a')).toBeUndefined()
    expect(jedison.getInstance('#/b')).toBeDefined()
    expect(jedison.getInstance('#/b').isActive).toBe(true)
  })
})
