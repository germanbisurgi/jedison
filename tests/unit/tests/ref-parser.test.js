/* global describe it expect afterEach jest */
const Jedison = require('../../../dist/cjs/jedison.cjs')
const { RefParser } = Jedison

function mockJsonResponse (body) {
  return { ok: true, json: async () => body }
}

describe('RefParser — external $ref fetching', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('uses the global fetch by default', async () => {
    global.fetch = jest.fn(async () => mockJsonResponse({ type: 'string' }))

    const schema = { properties: { name: { $ref: 'https://example.test/schemas/name' } } }
    const refParser = new RefParser()
    await refParser.dereference(schema)

    expect(global.fetch).toHaveBeenCalledWith('https://example.test/schemas/name', {})
  })

  it('forwards fetchOptions (e.g. headers) on every load', async () => {
    global.fetch = jest.fn(async () => mockJsonResponse({ type: 'string' }))

    const schema = { properties: { name: { $ref: 'https://example.test/schemas/name' } } }
    const refParser = new RefParser({ fetchOptions: { headers: { cookie: 'session=abc' } } })
    await refParser.dereference(schema)

    expect(global.fetch).toHaveBeenCalledWith('https://example.test/schemas/name', { headers: { cookie: 'session=abc' } })
  })

  it('accepts a fully custom fetch implementation', async () => {
    global.fetch = jest.fn()
    const customFetch = jest.fn(async () => mockJsonResponse({ type: 'string' }))

    const schema = { properties: { name: { $ref: 'https://example.test/schemas/name' } } }
    const refParser = new RefParser({ fetch: customFetch })
    await refParser.dereference(schema)

    expect(customFetch).toHaveBeenCalledWith('https://example.test/schemas/name', {})
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('binds the default fetch, so calling it as this.options.fetch(...) does not throw an illegal-invocation error', async () => {
    // Real browsers throw "TypeError: 'fetch' called on an object that does not
    // implement interface Window" if a captured fetch reference is later invoked
    // with a `this` other than the global object. This simulates that restriction
    // (a plain jest.fn() mock would not catch a regression here).
    function nativeLikeFetch (uri, opts) {
      if (this !== globalThis) {
        throw new TypeError("'fetch' called on an object that does not implement interface Window.")
      }
      return mockJsonResponse({ type: 'string' })
    }
    global.fetch = nativeLikeFetch

    const schema = { properties: { name: { $ref: 'https://example.test/schemas/name' } } }
    const refParser = new RefParser()

    await expect(refParser.dereference(schema)).resolves.not.toThrow()
  })
})
