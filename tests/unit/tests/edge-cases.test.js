/* global describe it expect */
const Jedison = require('../../../dist/cjs/jedison.cjs')
const { Create, RefParser } = Jedison

const errorsFor = (schema, value) => {
  const jedison = new Create({ schema })
  jedison.setValue(value)
  return jedison.getErrors()
}

const errorsWithRefs = async (schema, value) => {
  const refParser = new RefParser()
  await refParser.dereference(schema)
  const jedison = new Create({ schema, refParser })
  jedison.setValue(value)
  return jedison.getErrors()
}

describe('multipleOf with decimals', () => {
  [[0.3, 0.1], [0.07, 0.01], [19.99, 0.01], [0.0075, 0.0001], [4.5, 1.5]].forEach(([value, multipleOf]) => {
    it(`${value} is a multiple of ${multipleOf}`, () => {
      expect(errorsFor({ type: 'number', multipleOf }, value)).toStrictEqual([])
    })
  });

  [[0.35, 0.1], [0.075, 0.01], [7, 2]].forEach(([value, multipleOf]) => {
    it(`${value} is not a multiple of ${multipleOf}`, () => {
      expect(errorsFor({ type: 'number', multipleOf }, value).length).toBeGreaterThan(0)
    })
  })
})

describe('string length', () => {
  it('counts a code point outside the BMP as one character', () => {
    expect(errorsFor({ type: 'string', minLength: 2 }, '😀').length).toBeGreaterThan(0)
    expect(errorsFor({ type: 'string', maxLength: 1 }, '😀')).toStrictEqual([])
    expect(errorsFor({ type: 'string', maxLength: 2 }, '😀😀😀').length).toBeGreaterThan(0)
  })
})

describe('refs that cannot be resolved normally', () => {
  it('does not walk the prototype chain with a pointer', async () => {
    const schema = { properties: { a: { $ref: '#/constructor' } } }
    const refParser = new RefParser()
    await refParser.dereference(schema)

    expect(refParser.lookup('#/constructor')).toBeNull()
    expect(refParser.lookup('#/__proto__')).toBeNull()
  })

  it('stops a chain of refs that leads back to itself', async () => {
    expect(await errorsWithRefs({ $ref: '#' }, 1)).toStrictEqual([])
    expect(await errorsWithRefs({ $defs: { a: { $ref: '#/$defs/b' }, b: { $ref: '#/$defs/a' } }, $ref: '#/$defs/a' }, 1)).toStrictEqual([])
  })

  it('treats an empty $ref as a reference to the document', async () => {
    const schema = { type: 'object', properties: { child: { $ref: '' }, name: { type: 'string' } } }

    expect(await errorsWithRefs(schema, { name: 'a', child: { name: 1 } })).not.toStrictEqual([])
  })
})
