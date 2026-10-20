/* global describe it expect */
const Jedison = require('../../../dist/cjs/jedison.cjs')
const { Create } = Jedison

const cases = {
  date: [['2024-02-29', true], ['2023-02-29', false], ['2024-13-01', false], ['24-01-01', false]],
  time: [['08:30:06Z', true], ['08:30:06+01:00', true], ['23:59:60Z', true], ['22:59:60Z', false], ['08:30:06', false]],
  'date-time': [['1963-06-19T08:30:06.283185Z', true], ['1963-06-19 08:30:06Z', false]],
  duration: [['P1Y2M3DT4H5M6S', true], ['P2W', true], ['P', false], ['PT', false], ['P1W2D', false]],
  ipv4: [['192.168.0.1', true], ['256.1.1.1', false], ['1.1.1', false], ['01.1.1.1', false]],
  ipv6: [['::1', true], ['2001:db8::8a2e:370:7334', true], ['::ffff:192.0.2.1', true], ['1::2::3', false], ['12345::', false]],
  hostname: [['example.com', true], ['-bad.com', false], ['bad-.com', false], ['a..b', false]],
  uri: [['https://example.org/a?b#c', true], ['/relative', false], ['http://exa mple.org', false]],
  'uri-reference': [['/relative', true], ['#frag', true], ['\\\\bad', false]],
  'json-pointer': [['/foo/0', true], ['foo', false], ['/a~2', false]],
  regex: [['^[a-z]+$', true], ['^(abc', false]]
}

describe('format assertions', () => {
  Object.entries(cases).forEach(([format, values]) => {
    values.forEach(([value, valid]) => {
      it(`${format}: ${JSON.stringify(value)} is ${valid ? 'valid' : 'invalid'}`, () => {
        const jedison = new Create({ schema: { type: 'string', format }, assertFormat: true })
        jedison.setValue(value)

        expect(jedison.getErrors().length === 0).toBe(valid)
      })
    })
  })

  it('compiles patterns with unicode semantics', () => {
    const jedison = new Create({ schema: { type: 'string', pattern: '^\\p{L}+$' } })
    jedison.setValue('héllo')

    expect(jedison.getErrors()).toStrictEqual([])
  })
})
