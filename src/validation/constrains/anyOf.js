import { isSet } from '../../helpers/utils.js'
import { getSchemaAnyOf, getSchemaXOption } from '../../helpers/schema.js'

export function anyOf (context) {
  const errors = []
  const anyOf = getSchemaAnyOf(context.schema)

  if (isSet(anyOf)) {
    const enableSubErrors = getSchemaXOption(context.schema, 'subErrors') ?? context.validator.subErrors
    let valid = false

    if (enableSubErrors) {
      const schemaResults = []

      anyOf.forEach((schema, index) => {
        const anyOfErrors = context.validator.getErrors(context.value, schema, context.key, context.path)

        if (anyOfErrors.length === 0) {
          valid = true
        }

        schemaResults.push({ schemaIndex: index, errors: anyOfErrors })
      })

      if (!valid) {
        errors.push({
          type: 'error',
          path: context.path,
          constraint: 'anyOf',
          messages: [
            context.translator.translate('errorAnyOf')
          ],
          subErrors: schemaResults.filter(r => r.errors.length > 0)
        })
      }
    } else {
      for (const schema of anyOf) {
        const anyOfErrors = context.validator.getErrors(context.value, schema, context.key, context.path)

        if (anyOfErrors.length === 0) {
          valid = true
          break
        }
      }

      if (!valid) {
        errors.push({
          type: 'error',
          path: context.path,
          constraint: 'anyOf',
          messages: [
            context.translator.translate('errorAnyOf')
          ]
        })
      }
    }
  }

  return errors
}
