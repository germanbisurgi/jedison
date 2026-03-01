import { isSet } from '../../helpers/utils.js'
import { getSchemaAnyOf } from '../../helpers/schema.js'

export function anyOf (context) {
  const errors = []
  const anyOf = getSchemaAnyOf(context.schema)

  if (isSet(anyOf)) {
    let valid = false

    anyOf.forEach((schema) => {
      const anyOfErrors = context.validator.getErrors(context.value, schema, context.key, context.path)

      if (anyOfErrors.length === 0) {
        valid = true
      }
    })

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

  return errors
}
