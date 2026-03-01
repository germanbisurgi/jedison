import { compileTemplate, isSet } from '../../helpers/utils.js'
import { getSchemaNot } from '../../helpers/schema.js'

export function not (context) {
  const errors = []
  const not = getSchemaNot(context.schema)

  if (isSet(not)) {
    const notErrors = context.validator.getErrors(context.value, not, context.key, context.path)

    const invalid = notErrors.length === 0

    if (invalid) {
      errors.push({
        type: 'error',
        path: context.path,
        constraint: 'not',
        messages: [
          compileTemplate(context.translator.translate('errorNot'))
        ]
      })
    }
  }

  return errors
}
