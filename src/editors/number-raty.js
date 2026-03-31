/* global Raty */

import EditorNumber from './number.js'
import { isSet } from '../helpers/utils.js'
import { getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents a EditorNumberRaty instance.
 * @extends EditorString
 */
class EditorNumberRaty extends EditorNumber {
  static resolves (schema) {
    const format = getSchemaXOption(schema, 'format')

    return isSet(format) &&
      format === 'raty' &&
      typeof Raty !== 'undefined' &&
      getSchemaType(schema) === 'number'
  }

  build () {
    this.control = this.theme.getPlaceholderControl({
      title: this.getTitle(),
      description: this.getDescription(),
      id: this.getIdFromPath(this.instance.path),
      titleIconClass: getSchemaXOption(this.instance.schema, 'titleIconClass'),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      info: this.getInfo()
    })

    try {
      const ratyOptions = getSchemaXOption(this.instance.schema, 'raty') ?? {}

      this.raty = new Raty(this.control.placeholder, Object.assign({}, ratyOptions, {
        click: (score) => {
          this.instance.setValue(score, true, 'user')
        }
      }))
      this.raty.init()
    } catch (e) {
      console.error('Raty is not available or not loaded correctly.', e)
    }
  }

  adaptForTable () {
    this.theme.visuallyHidden(this.control.label)
    this.theme.visuallyHidden(this.control.description)
  }

  refreshDisabledState () {
    if (this.disabled || this.readOnly) {
      this.raty.readOnly(true)
    } else {
      this.raty.readOnly(false)
    }
  }

  refreshUI () {
    super.refreshUI()
    this.raty.score(this.instance.getValue())
  }
}

export default EditorNumberRaty
