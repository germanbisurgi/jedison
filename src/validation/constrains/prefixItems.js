import { compileTemplate, isArray, isSet } from '../../helpers/utils.js'
import { getSchemaPrefixItems, getSchemaXOption } from '../../helpers/schema.js'

export function prefixItems (context) {
  const errors = []
  const prefixItems = getSchemaPrefixItems(context.schema)

  if (isArray(context.value) && isSet(prefixItems)) {
    const enableSubErrors = getSchemaXOption(context.schema, 'subErrors') ?? context.validator.subErrors

    prefixItems.forEach((itemSchema, index) => {
      const itemValue = context.value[index]

      if (isSet(itemValue)) {
        const tmpErrors = context.validator.getErrors(itemValue, itemSchema, index, context.path + '/' + index)

        if (tmpErrors.length > 0) {
          const error = {
            type: 'error',
            path: context.path,
            constraint: 'prefixItems',
            messages: [
              compileTemplate(context.translator.translate('errorPrefixItems'), {
                index: index
              })
            ]
          }

          if (enableSubErrors) {
            error.subErrors = tmpErrors
          }

          errors.push(error)
        }
      }
    })
  }

  return errors
}
