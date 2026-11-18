/* global describe it expect */
const Jedison = require('../../../dist/cjs/jedison.cjs')

const schema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string' }
  }
}

describe('setLanguage', () => {
  it('translates validation messages in the new language', () => {
    const jedison = new Jedison.Create({ schema, data: {} })
    expect(jedison.getErrors()[0].messages[0]).toContain('Must have the required properties')

    jedison.setLanguage('de')
    expect(jedison.translator.language).toBe('de')
    expect(jedison.getErrors()[0].messages[0]).toContain('Muss die erforderlichen Eigenschaften haben')
  })

  it('falls back to default translations for an unknown language', () => {
    const jedison = new Jedison.Create({ schema, data: {} })
    jedison.setLanguage('xx')
    expect(jedison.getErrors()[0].messages[0]).toContain('Must have the required properties')
  })
})
