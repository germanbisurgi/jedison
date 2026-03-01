import { isSet, notSet } from '../../helpers/utils.js'
import { getSchemaElse, getSchemaIf, getSchemaThen } from '../../helpers/schema.js'

export function ifThenElse (context) {
  const schemaIf = getSchemaIf(context.schema)
  const schemaThen = getSchemaThen(context.schema)
  const schemaElse = getSchemaElse(context.schema)

  if (isSet(schemaIf)) {
    if (notSet(schemaThen) && notSet(schemaElse)) {
      return []
    }

    if (schemaIf === true) {
      return isSet(schemaThen) ? context.validator.getErrors(context.value, schemaThen, context.key, context.path) : []
    }

    if (schemaIf === false) {
      return isSet(schemaElse) ? context.validator.getErrors(context.value, schemaElse, context.key, context.path) : []
    }

    const ifErrors = context.validator.getErrors(context.value, schemaIf, context.key, context.path)

    if (ifErrors.length === 0) {
      return isSet(schemaThen) ? context.validator.getErrors(context.value, schemaThen, context.key, context.path) : []
    }

    return isSet(schemaElse) ? context.validator.getErrors(context.value, schemaElse, context.key, context.path) : []
  }

  return []
}
