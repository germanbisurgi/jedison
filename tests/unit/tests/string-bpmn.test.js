/* global describe it expect afterEach */
const Jedison = require('../../../dist/cjs/jedison.cjs')

const bpmnSchema = { type: 'string', 'x-format': 'bpmn' }

const getClass = (schema) => {
  const jedison = new Jedison.Create({ schema })
  return jedison.uiResolver.getClass(schema)
}

describe('EditorStringBpmn.resolves', () => {
  afterEach(() => {
    delete global.window
  })

  it('is used for x-format "bpmn" when bpmn-js is loaded', () => {
    global.window = { BpmnJS: class {} }
    expect(getClass(bpmnSchema)).not.toBe(getClass({ type: 'string' }))
  })

  it('falls back to the default string editor when bpmn-js is missing', () => {
    global.window = {}
    expect(getClass(bpmnSchema)).toBe(getClass({ type: 'string' }))
  })

  it('is not used for other formats', () => {
    global.window = { BpmnJS: class {} }
    expect(getClass({ type: 'string', 'x-format': 'textarea' })).toBe(getClass({ type: 'string', 'x-format': 'textarea' }))
    expect(getClass({ type: 'string', 'x-format': 'textarea' })).not.toBe(getClass(bpmnSchema))
  })
})
