/**
 * constrains propertyNames
 */

import { compileTemplate, isObject, isSet } from '../../helpers/utils.js'
import {
  getSchemaPropertyNames
} from '../../helpers/schema.js'

export function propertyNames (context) {
  const errors = []
  const schemaPropertyNames = getSchemaPropertyNames(context.schema)

  if (isObject(context.value) && isSet(schemaPropertyNames)) {
    Object.keys(context.value).forEach((propertyName) => {
      const invalid = context.validator.getErrors(propertyName, schemaPropertyNames, propertyName, context.path).length > 0

      if (invalid) {
        errors.push({
          type: 'error',
          path: context.path,
          constraint: 'propertyNames',
          messages: [
            compileTemplate(context.translator.translate('errorPropertyNames'), { propertyName: propertyName })
          ]
        })
      }
    })
  }

  return errors
}
