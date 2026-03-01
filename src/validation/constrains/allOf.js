import { isSet, removeDuplicatesFromArray } from '../../helpers/utils.js'
import { getSchemaAllOf } from '../../helpers/schema.js'

export function allOf (context) {
  let errors = []
  const allOf = getSchemaAllOf(context.schema)

  if (isSet(allOf)) {
    allOf.forEach((schema) => {
      const subSchemaErrors = context.validator.getErrors(context.value, schema, context.key, context.path)

      subSchemaErrors.forEach((error) => {
        error.path = context.path
      })

      errors.push(...subSchemaErrors)
    })

    errors = removeDuplicatesFromArray(errors)
  }

  return errors
}
