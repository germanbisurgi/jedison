import { compileTemplate, hasOwn, isArray, isObject, isSet } from '../../helpers/utils.js'
import { getSchemaDependentRequired } from '../../helpers/schema.js'

export function dependentRequired (context) {
  const errors = []
  const dependentRequired = getSchemaDependentRequired(context.schema)

  if (isObject(context.value) && isSet(dependentRequired)) {
    let missingProperties = []

    Object.keys(dependentRequired).forEach((key) => {
      if (isSet(context.value[key])) {
        const requiredProperties = dependentRequired[key]

        if (isArray(requiredProperties)) {
          missingProperties = requiredProperties.filter((property) => {
            return !hasOwn(context.value, property)
          })
        }
      }
    })

    const invalid = missingProperties.length > 0

    if (invalid) {
      errors.push({
        type: 'error',
        path: context.path,
        constraint: 'dependentRequired',
        messages: [
          compileTemplate(context.translator.translate('errorDependentRequired'), {
            dependentRequired: missingProperties.join(', ')
          })
        ]
      })
    }
  }

  return errors
}
