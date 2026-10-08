/* global describe it expect jest */
const Jedison = require('../../../dist/cjs/jedison.cjs')
const { Create } = Jedison

const properties = { field: { type: 'string' } }
const types = ['string', 'number', 'integer', 'boolean', 'array', 'object', 'null']

const defaults = {
  string: 'x',
  number: 1.5,
  integer: 2,
  boolean: true,
  array: ['a'],
  object: { field: 'a' },
  null: null
}

const fits = (defaultType, branchType) => defaultType === branchType || (defaultType === 'integer' && branchType === 'number')

describe('InstanceMultiple — wrapper default per branch type (issue #84)', () => {
  Object.entries(defaults).forEach(([defaultType, value]) => {
    it(`${defaultType} default only reaches fitting branches (type array)`, () => {
      const errors = jest.spyOn(console, 'error').mockImplementation(() => {})
      const jedison = new Create({
        schema: {
          type: 'object',
          properties: { prop: { type: types, default: value, properties, items: { type: 'string' }, required: ['field'] } }
        },
        enablePropertiesToggle: true
      })
      const multiple = jedison.getInstance('#/prop')

      expect(jedison.getValue()).toEqual({ prop: value })

      multiple.instances.forEach((branch) => {
        expect(branch.schema.default !== undefined).toBe(fits(defaultType, branch.schema.type))
      })

      expect(errors).not.toHaveBeenCalled()
      errors.mockRestore()
    })

    it(`${defaultType} default only reaches fitting branches (oneOf)`, () => {
      const errors = jest.spyOn(console, 'error').mockImplementation(() => {})
      const jedison = new Create({
        schema: {
          type: 'object',
          properties: {
            prop: {
              default: value,
              oneOf: types.map((type) => ({ type, properties, items: { type: 'string' }, required: ['field'] }))
            }
          }
        },
        enablePropertiesToggle: true
      })
      const multiple = jedison.getInstance('#/prop')

      expect(jedison.getValue()).toEqual({ prop: value })

      multiple.instances.forEach((branch) => {
        expect(branch.schema.default !== undefined).toBe(fits(defaultType, branch.schema.type))
      })

      expect(errors).not.toHaveBeenCalled()
      errors.mockRestore()
    })
  })

  it('keeps the default on branches without a type', () => {
    const jedison = new Create({
      schema: { default: 'x', oneOf: [{ minLength: 1 }, { type: 'null' }] }
    })

    expect(jedison.getValue()).toBe('x')
  })
})
