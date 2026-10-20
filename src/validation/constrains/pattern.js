import { compileTemplate, isSet, isString, compilePattern } from '../../helpers/utils.js'
import { getSchemaPattern } from '../../helpers/schema.js'

export function pattern (context) {
  const errors = []
  const pattern = getSchemaPattern(context.schema)

  if (isString(context.value) && isSet(pattern)) {
    const regexp = compilePattern(pattern)
    const invalid = !regexp.test(context.value)

    if (invalid) {
      errors.push({
        type: 'error',
        path: context.path,
        constraint: 'pattern',
        messages: [
          compileTemplate(context.translator.translate('errorPattern'), {
            pattern: pattern
          })
        ]
      })
    }
  }

  return errors
}
