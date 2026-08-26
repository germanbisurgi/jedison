/* global describe it expect afterEach jest */
const Jedison = require('../../../dist/cjs/jedison.cjs')

describe('Validator constraints default — issue #69', () => {
  it('defaults constraints to an object, not an array', () => {
    const jedison = new Jedison.Create({ schema: {} })
    expect(Array.isArray(jedison.validator.constraints)).toBe(false)
    expect(jedison.validator.constraints).toEqual({})
  })

  it('warns and resets to an object when an array is passed as constraints', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const jedison = new Jedison.Create({ schema: {}, constraints: ['oops'] })
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('constraints'))
    expect(jedison.validator.constraints).toEqual({})
    warnSpy.mockRestore()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })
})
