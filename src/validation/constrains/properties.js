import { compileTemplate, hasOwn, isObject, isSet } from '../../helpers/utils.js'
import { getSchemaProperties } from '../../helpers/schema.js'

export function properties (context) {
  const schemaProperties = getSchemaProperties(context.schema)
  const invalidProperties = []

  if (isObject(context.value) && isSet(schemaProperties)) {
    Object.keys(schemaProperties).forEach((propertyName) => {
      if (hasOwn(context.value, propertyName)) {
        const propertySchema = schemaProperties[propertyName]

        const propertyErrors = context.validator.getErrors(
          context.value[propertyName],
          propertySchema,
          propertyName,
          context.path + '/' + propertyName
        )

        if (propertyErrors.length > 0) {
          invalidProperties.push(propertyName)
        }
      }
    })
  }

  if (invalidProperties.length > 0) {
    return [{
      type: 'error',
      path: context.path,
      constraint: 'properties',
      messages: [
        compileTemplate(context.translator.translate('errorProperties'), { properties: invalidProperties.join(', ') })
      ]
    }]
  }

  return []
}
