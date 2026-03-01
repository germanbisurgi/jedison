import { compileTemplate, isSet } from '../../helpers/utils.js'
import { getSchemaOneOf } from '../../helpers/schema.js'

export function oneOf (context) {
  const errors = []
  const oneOf = getSchemaOneOf(context.schema)

  if (isSet(oneOf)) {
    let counter = 0

    oneOf.forEach((schema) => {
      const oneOfErrors = context.validator.getErrors(context.value, schema, context.key, context.path)

      if (oneOfErrors.length === 0) {
        counter++
      }
    })

    if (counter !== 1) {
      errors.push({
        type: 'error',
        path: context.path,
        constraint: 'oneOf',
        messages: [
          compileTemplate(context.translator.translate('errorOneOf'), {
            counter: counter
          })
        ]
      })
    }
  }

  return errors
}
