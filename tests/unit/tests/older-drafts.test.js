/* global describe it expect */
const fs = require('fs')
const path = require('path')
const Jedison = require('../../../dist/cjs/jedison.cjs')

const suiteDir = path.join(__dirname, '../../../node_modules/json-schema-test-suite/')
const fetchRemote = async (url) => {
  if (url.startsWith('http://localhost:1234/')) {
    const file = path.join(suiteDir, 'remotes', url.replace('http://localhost:1234/', ''))
    return { ok: true, json: async () => JSON.parse(fs.readFileSync(file, 'utf8')) }
  }
  return fetch(url)
}

const dialects = {
  draft4: 'http://json-schema.org/draft-04/schema#',
  draft6: 'http://json-schema.org/draft-06/schema#',
  draft7: 'http://json-schema.org/draft-07/schema#',
  'draft2019-09': 'https://json-schema.org/draft/2019-09/schema'
}

// Suites that are not covered: the keywords are not supported
const skippedSuites = {
  'draft2019-09': ['dynamicRef', 'recursiveRef']
}

// Known gaps, as 'scenario > test':
// - the remote metaschemas are not fetched, and the keyword $recursiveRef is not supported
// - $ref siblings are merged into the target (arrays like prefixItems are overwritten)
const knownGaps = [
  'remote ref, containing refs itself > remote ref valid',
  'remote ref, containing refs itself > remote ref invalid',
  'validate definition against metaschema > valid definition schema',
  'validate definition against metaschema > invalid definition schema',
  'unevaluatedItems with $recursiveRef > with no unevaluated items',
  'unevaluatedItems with $recursiveRef > with unevaluated items',
  'unevaluatedProperties with $recursiveRef > with no unevaluated properties',
  'schema that uses custom metaschema with with no validation vocabulary > no validation: invalid number, but it still validates'
]

;['draft4', 'draft6', 'draft7', 'draft2019-09'].forEach((draft) => {
  const dir = path.join(suiteDir, 'tests', draft)
  const files = fs.readdirSync(dir).filter((file) => file.endsWith('.json') && !(skippedSuites[draft] ?? []).includes(file.replace('.json', '')))

  describe(draft, () => {
    files.forEach((file) => {
      JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')).forEach((scenario) => {
        describe(file.replace('.json', '') + ': ' + scenario.description, () => {
          scenario.tests.forEach((test) => {
            const run = knownGaps.includes(scenario.description + ' > ' + test.description) ? it.skip : it

            run(test.description, async () => {
              // the suites only declare $schema where it matters
              if (typeof scenario.schema === 'object' && !scenario.schema.$schema) {
                scenario.schema.$schema = dialects[draft]
              }

              const refParser = new Jedison.RefParser({ fetch: fetchRemote })
              await refParser.dereference(scenario.schema)

              const jedison = new Jedison.Create({ schema: scenario.schema, refParser })
              jedison.setValue(test.data)
              const valid = jedison.getErrors().length === 0
              jedison.destroy()

              expect(valid).toStrictEqual(test.valid)
            })
          })
        })
      })
    })
  })
})
