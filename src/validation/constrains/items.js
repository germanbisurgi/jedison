import { compileTemplate, isArray, isObject, isSet } from '../../helpers/utils.js'
import { getSchemaItems, getSchemaPrefixItems } from '../../helpers/schema.js'

export function items (context) {
  const errors = []
  const items = getSchemaItems(context.schema)
  const prefixItems = getSchemaPrefixItems(context.schema)

  if (isArray(context.value) && isSet(items)) {
    const prefixItemsSchemasCount = isSet(prefixItems) ? prefixItems.length : 0

    if (items === false && context.value.length > 0 && context.value.length > prefixItemsSchemasCount) {
      errors.push({
        type: 'error',
        path: context.path,
        constraint: 'items',
        messages: [context.translator.translate('errorItems')]
      })
    } else if (isObject(items)) {
      context.value.slice(prefixItemsSchemasCount).forEach((itemValue, i) => {
        const index = prefixItemsSchemasCount + i
        const tmpErrors = context.validator.getErrors(itemValue, items, index, context.path + '/' + index)

        if (tmpErrors.length > 0) {
          errors.push({
            type: 'error',
            path: context.path,
            constraint: 'items',
            messages: [
              compileTemplate(context.translator.translate('errorItems'), { index })
            ]
          })
        }
      })
    }
  }

  return errors
}
