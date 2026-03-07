import { compileTemplate, isSet } from '../../helpers/utils.js'
import { getSchemaOneOf, getSchemaXOption } from '../../helpers/schema.js'

export function oneOf (context) {
  const errors = []
  const oneOf = getSchemaOneOf(context.schema)

  if (isSet(oneOf)) {
    let counter = 0
    const enableSubErrors = getSchemaXOption(context.schema, 'subErrors') ?? context.validator.subErrors

    if (enableSubErrors) {
      const schemaResults = []

      oneOf.forEach((schema, index) => {
        const oneOfErrors = context.validator.getErrors(context.value, schema, context.key, context.path)

        if (oneOfErrors.length === 0) {
          counter++
          schemaResults.push({ schemaIndex: index, matched: true, errors: [] })
        } else {
          schemaResults.push({ schemaIndex: index, matched: false, errors: oneOfErrors })
        }
      })

      if (counter !== 1) {
        const error = {
          type: 'error',
          path: context.path,
          constraint: 'oneOf',
          messages: [
            compileTemplate(context.translator.translate('errorOneOf'), {
              counter: counter
            })
          ]
        }

        if (counter === 0) {
          error.subErrors = schemaResults.filter(r => !r.matched).map(r => ({
            schemaIndex: r.schemaIndex,
            errors: r.errors
          }))
        } else {
          error.matchingSchemas = schemaResults.filter(r => r.matched).map(r => r.schemaIndex)
        }

        errors.push(error)
      }
    } else {
      const matchingSchemas = []

      oneOf.forEach((schema, index) => {
        const oneOfErrors = context.validator.getErrors(context.value, schema, context.key, context.path)

        if (oneOfErrors.length === 0) {
          counter++
          matchingSchemas.push(index)
        }
      })

      if (counter !== 1) {
        const error = {
          type: 'error',
          path: context.path,
          constraint: 'oneOf',
          messages: [
            compileTemplate(context.translator.translate('errorOneOf'), {
              counter: counter
            })
          ]
        }

        if (counter > 0) {
          error.matchingSchemas = matchingSchemas
        }

        errors.push(error)
      }
    }
  }

  return errors
}
