/* global describe it expect */
const Jedison = require('../../../dist/cjs/jedison.cjs')

describe('UiResolver.getClass — error containment (issue #69)', () => {
  it('skips a customEditor whose resolves() throws and falls through to a built-in editor', () => {
    const throwingEditor = { name: 'ThrowingEditor', resolves: () => { throw new Error('boom') } }
    const jedison = new Jedison.Create({ schema: { type: 'string' }, customEditors: [throwingEditor] })

    let EditorClass
    expect(() => { EditorClass = jedison.uiResolver.getClass(jedison.schema) }).not.toThrow()
    expect(EditorClass).toBeTruthy()
    expect(EditorClass).not.toBe(throwingEditor)
  })

  it('returns null instead of throwing when no editor resolves the schema', () => {
    const jedison = new Jedison.Create({ schema: { type: 'weirdType' } })

    let EditorClass
    expect(() => { EditorClass = jedison.uiResolver.getClass({ type: 'weirdType' }) }).not.toThrow()
    expect(EditorClass).toBeNull()
  })
})
