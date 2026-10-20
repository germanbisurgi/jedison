import { compileTemplate, isNumber, isSet } from '../../helpers/utils.js'
import { getSchemaMultipleOf } from '../../helpers/schema.js'

const decimals = (number) => {
  const match = /\.([0-9]+)$/.exec(String(number))

  return match ? match[1].length : 0
}

// 0.3 / 0.1 is 2.9999999999999996, so numbers with decimals are compared as scaled integers
function divides (value, multipleOf) {
  const scale = Math.pow(10, Math.max(decimals(value), decimals(multipleOf)))
  const scaledValue = Math.round(value * scale)
  const scaledMultipleOf = Math.round(multipleOf * scale)

  if (scale > 1 && Number.isSafeInteger(scaledValue) && Number.isSafeInteger(scaledMultipleOf) && scaledMultipleOf !== 0) {
    return scaledValue % scaledMultipleOf === 0
  }

  return value / multipleOf === Math.floor(value / multipleOf)
}

export function multipleOf (context) {
  const errors = []
  const multipleOf = getSchemaMultipleOf(context.schema)

  if (isNumber(context.value) && isSet(multipleOf)) {
    if (context.value === 0) {
      return errors
    }

    const isMultipleOf = divides(context.value, multipleOf)
    const invalid = (!isMultipleOf || context.value.toString().includes('e'))

    if (invalid) {
      errors.push({
        type: 'error',
        path: context.path,
        constraint: 'multipleOf',
        messages: [
          compileTemplate(context.translator.translate('errorMultipleOf'), {
            multipleOf: multipleOf
          })
        ]
      })
    }
  }

  return errors
}
