/* global describe it expect */
const Jedison = require('../../../dist/cjs/jedison.cjs')

const errorsFor = (value) => {
  const jedison = new Jedison.Create({
    schema: { type: 'string', format: 'url' },
    assertFormat: true,
    data: value
  })
  return jedison.getErrors().length
}

describe('format url — issue #88', () => {
  it('validates the URL that caused catastrophic backtracking quickly', () => {
    const start = Date.now()
    const url = 'https://survey.alchemer.com/s3/11114324241111/XQ-fake-survey-for-issue-request11211?query=test-e'
    expect(errorsFor(url)).toBe(0)
    expect(Date.now() - start).toBeLessThan(1000)
  })

  it('accepts valid urls', () => {
    ;['http://example.com', 'https://a.b.co/path?x=1#h', 'ftp://user:pw@host.org:21/f', 'http://192.168.0.1:8080/x'].forEach((u) => {
      expect(errorsFor(u)).toBe(0)
    })
  })

  it('rejects invalid urls', () => {
    ;['example.com', 'mailto:a@b.com', 'http://localhost', 'https://exa mple.com', 'https://x.com/a b', 'javascript:alert(1)'].forEach((u) => {
      expect(errorsFor(u)).toBe(1)
    })
  })
})
