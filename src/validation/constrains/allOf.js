import { isSet, removeDuplicatesFromArray } from '../../helpers/utils.js'
import { getSchemaAllOf, getSchemaXOption } from '../../helpers/schema.js'

export function allOf (context) {
  let errors = []
  const allOf = getSchemaAllOf(context.schema)

  if (isSet(allOf)) {
    const enableSubErrors = getSchemaXOption(context.schema, 'subErrors') ?? context.validator.subErrors

    if (enableSubErrors) {
      const schemaResults = []

      allOf.forEach((schema, index) => {
        const subSchemaErrors = context.validator.getErrors(context.value, schema, context.key, context.path)

        if (subSchemaErrors.length > 0) {
          schemaResults.push({ schemaIndex: index, errors: subSchemaErrors })
        }
      })

      if (schemaResults.length > 0) {
        errors.push({
          type: 'error',
          path: context.path,
          constraint: 'allOf',
          subErrors: schemaResults
        })
      }
    } else {
      allOf.forEach((schema) => {
        const subSchemaErrors = context.validator.getErrors(context.value, schema, context.key, context.path)

        subSchemaErrors.forEach((error) => {
          error.path = context.path
        })

        errors.push(...subSchemaErrors)
      })

      errors = removeDuplicatesFromArray(errors)
    }
  }

  return errors
}
