/**
 * constrains unevaluatedItems
 */

import { compileTemplate, hasOwn, isArray, isBoolean, isObject, isSet } from '../../helpers/utils.js'
import {
  getSchemaUnevaluatedItems,
  getSchemaItems,
  getSchemaPrefixItems,
  getSchemaContains,
  getSchemaIf,
  getSchemaThen,
  getSchemaElse,
  getSchemaAnyOf, getSchemaAllOf, getSchemaOneOf
} from '../../helpers/schema.js'

/**
 * Collects the indexes of the items of context.value that were evaluated by the
 * keywords of a schema, including the subschemas that applied and were valid.
 * Items touched by a failing subschema do not count.
 */
function collectEvaluated (context, schema, evaluated, includeOwnUnevaluated) {
  if (isBoolean(schema)) {
    return
  }

  // the target is evaluated on its own, expanding would overwrite sibling arrays like prefixItems
  if (context.validator.refParser && hasOwn(schema, '$ref')) {
    const { $ref, ...siblings } = schema

    collectEvaluated(context, context.validator.refParser.expand({ $ref }), evaluated, true)
    schema = siblings
  }

  const indexes = context.value.map((item, index) => index)
  const isValid = (subschema) => context.validator.getErrors(context.value, subschema, context.key, context.path).length === 0
  const merge = (subschema) => collectEvaluated(context, subschema, evaluated, true)

  const prefixItems = getSchemaPrefixItems(schema)

  if (isSet(prefixItems)) {
    indexes.slice(0, prefixItems.length).forEach((index) => evaluated.add(index))
  }

  // items, and a nested unevaluatedItems, evaluate everything that is left
  if (isSet(getSchemaItems(schema)) || (includeOwnUnevaluated && isSet(getSchemaUnevaluatedItems(schema)))) {
    indexes.forEach((index) => evaluated.add(index))
  }

  const contains = getSchemaContains(schema)

  if (isSet(contains)) {
    context.value.forEach((item, index) => {
      if (context.validator.getErrors(item, contains, index, context.path + '/' + index).length === 0) {
        evaluated.add(index)
      }
    })
  }

  const allOf = getSchemaAllOf(schema)

  if (isSet(allOf)) {
    allOf.forEach(merge)
  }

  ;[getSchemaAnyOf(schema), getSchemaOneOf(schema)].forEach((subschemas) => {
    if (isSet(subschemas)) {
      subschemas.filter(isValid).forEach(merge)
    }
  })

  const schemaIf = getSchemaIf(schema)

  if (isSet(schemaIf)) {
    const schemaThen = getSchemaThen(schema)
    const schemaElse = getSchemaElse(schema)

    if (isValid(schemaIf)) {
      merge(schemaIf)

      if (isSet(schemaThen)) {
        merge(schemaThen)
      }
    } else if (isSet(schemaElse)) {
      merge(schemaElse)
    }
  }
}

export function unevaluatedItems (context) {
  let errors = []
  const unevaluatedSchema = getSchemaUnevaluatedItems(context.schema)

  if (isArray(context.value) && isSet(unevaluatedSchema)) {
    const evaluated = new Set()

    collectEvaluated(context, context.schema, evaluated, false)

    context.value.forEach((item, index) => {
      if (evaluated.has(index)) {
        return
      }

      if (unevaluatedSchema === false) {
        errors.push({
          type: 'error',
          path: context.path,
          constraint: 'unevaluatedItems',
          messages: [
            compileTemplate(context.translator.translate('errorUnevaluatedItems'), { index })
          ]
        })
      } else if (isObject(unevaluatedSchema)) {
        const itemErrors = context.validator.getErrors(item, unevaluatedSchema, index, context.path + '/' + index).map((error) => {
          return {
            type: 'error',
            path: context.path + '/' + index,
            constraint: 'unevaluatedItems',
            messages: error.messages
          }
        })

        errors = [...errors, ...itemErrors]
      }
    })
  }

  return errors
}
