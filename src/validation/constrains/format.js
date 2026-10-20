import { compileTemplate, hasOwn, isSet, isString } from '../../helpers/utils.js'
import { formatChecks } from '../format-checks.js'
import { getSchemaFormat, getSchemaXOption } from '../../helpers/schema.js'

// Native parser instead of a regex: nested quantifiers backtracked exponentially (issue #88)
function isValidUrl (value) {
  if (/\s/.test(value)) {
    return false
  }

  try {
    const url = new URL(value)
    return /^(https?|ftp):$/.test(url.protocol) && /(\.[a-z]{2,}\.?|^\d{1,3}(\.\d{1,3}){3})$/i.test(url.hostname)
  } catch (e) {
    return false
  }
}

export function format (context) {
  const errors = []
  const format = getSchemaFormat(context.schema)
  const xAssertFormat = getSchemaXOption(context.schema, 'assertFormat')
  const assertFormat = xAssertFormat !== undefined ? xAssertFormat : context.validator.assertFormat

  if (isSet(format) && isString(context.value) && assertFormat) {
    let regexp

    if (format === 'email') {
      regexp = new RegExp(/^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/i)
    }

    if (format === 'uuid') {
      regexp = new RegExp(/^(?:urn:uuid:)?[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/i)
    }

    let invalid = false

    if (format === 'url') {
      invalid = !isValidUrl(context.value)
    } else if (hasOwn(formatChecks, format)) {
      invalid = !formatChecks[format](context.value)
    } else if (isSet(regexp)) {
      invalid = !regexp.test(context.value)
    }

    if (invalid) {
      errors.push({
        type: 'error',
        path: context.path,
        constraint: 'format',
        messages: [
          compileTemplate(context.translator.translate('errorFormat'), { format: format })
        ]
      })
    }
  }

  return errors
}
