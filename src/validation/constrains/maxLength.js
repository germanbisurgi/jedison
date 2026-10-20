import { compileTemplate, isSet, isString } from '../../helpers/utils.js'
import { getSchemaMaxLength } from '../../helpers/schema.js'

export function maxLength (context) {
  const errors = []
  const maxLength = getSchemaMaxLength(context.schema)

  if (isString(context.value) && isSet(maxLength)) {
    // length counts Unicode code points, not UTF-16 units
    const invalid = ([...context.value].length > maxLength)

    if (invalid) {
      errors.push({
        type: 'error',
        path: context.path,
        constraint: 'maxLength',
        messages: [
          compileTemplate(context.translator.translate('errorMaxLength'), {
            maxLength: maxLength
          })
        ]
      })
    }
  }

  return errors
}
