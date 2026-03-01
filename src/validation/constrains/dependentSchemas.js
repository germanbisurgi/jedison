import { isObject, isSet } from '../../helpers/utils.js'
import { getSchemaDependentSchemas } from '../../helpers/schema.js'

export function dependentSchemas (context) {
  let errors = []
  const dependentSchemas = getSchemaDependentSchemas(context.schema)

  if (isObject(context.value) && isSet(dependentSchemas)) {
    Object.keys(dependentSchemas).forEach((key) => {
      if (isSet(context.value[key])) {
        const dependentSchema = dependentSchemas[key]
        const tmpErrors = context.validator.getErrors(context.value, dependentSchema, context.key, context.path)
        errors = [...errors, ...tmpErrors]
      }
    })
  }

  return errors
}
