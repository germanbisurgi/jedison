import { isObject, isSet } from '../../helpers/utils.js'
import { getSchemaPatternProperties } from '../../helpers/schema.js'

export function patternProperties (context) {
  let errors = []
  const patternProperties = getSchemaPatternProperties(context.schema)

  if (isObject(context.value) && isSet(patternProperties)) {
    Object.keys(context.value).forEach((propertyName) => {
      Object.keys(patternProperties).forEach((pattern) => {
        const regexp = new RegExp(pattern)
        if (regexp.test(propertyName)) {
          const schema = patternProperties[pattern]

          const editorErrors = context.validator.getErrors(context.value[propertyName], schema, propertyName, context.path + '/' + propertyName).map((error) => {
            return {
              type: 'error',
              path: context.path + '/' + propertyName,
              constraint: 'patternProperties',
              messages: error.messages
            }
          })

          errors = [...errors, ...editorErrors]
        }
      })
    })
  }

  return errors
}
