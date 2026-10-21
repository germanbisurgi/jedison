import { compileTemplate, isArray } from '../../helpers/utils.js'

export function _enum (context) {
  const errors = []
  // not getSchemaEnum(): an empty enum is valid and rejects every value
  const schemaEnum = context.schema.enum

  if (isArray(schemaEnum)) {
    const invalid = !schemaEnum.some(e => JSON.stringify(context.value) === JSON.stringify(e))

    if (invalid) {
      errors.push({
        type: 'error',
        path: context.path,
        constraint: 'enum',
        messages: [
          compileTemplate(context.translator.translate('errorEnum'), {
            enum: JSON.stringify(schemaEnum)
          })
        ]
      })
    }
  }
  return errors
}
