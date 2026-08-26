/* global describe it expect */
const packageJson = require('../../../package.json')
const Jedison = require('../../../dist/cjs/jedison.cjs')

describe('version — issue #69', () => {
  it('exposes the package.json version on Create and on the namespace object', () => {
    expect(Jedison.Create.version).toBe(packageJson.version)
    expect(Jedison.version).toBe(packageJson.version)
  })
})
