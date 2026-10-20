import { compileTemplate, isSet, isString } from '../../helpers/utils.js'
import { getSchemaMinLength } from '../../helpers/schema.js'

export function minLength (context) {
  const errors = []
  const minLength = getSchemaMinLength(context.schema)

  if (isString(context.value) && isSet(minLength)) {
    // length counts Unicode code points, not UTF-16 units
    const invalid = ([...context.value].length < minLength)

    if (invalid) {
      errors.push({
        type: 'error',
        path: context.path,
        constraint: 'minLength',
        messages: [
          compileTemplate(context.translator.translate('errorMinLength'), {
            minLength: minLength
          })
        ]
      })
    }
  }

  return errors
}
