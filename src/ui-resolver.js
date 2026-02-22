import EditorBooleanRadios from './editors/boolean-radios.js'
import EditorBooleanSelect from './editors/boolean-select.js'
import EditorBooleanCheckbox from './editors/boolean-checkbox.js'
import EditorStringRadios from './editors/string-radios.js'
import EditorStringSelect from './editors/string-select.js'
import EditorStringTextarea from './editors/string-textarea.js'
import EditorStringAwesomplete from './editors/string-awesomplete.js'
import EditorStringEmojiButton from './editors/string-emoji-button.js'
import EditorStringInput from './editors/string-input.js'
import EditorNumberRadio from './editors/number-radios.js'
import EditorNumberSelect from './editors/number-select.js'
import EditorNumberInputNullable from './editors/number-input-nullable.js'
import EditorNumberInput from './editors/number-input.js'
import EditorObjectGrid from './editors/object-grid.js'
import EditorObjectNav from './editors/object-nav.js'
import EditorObject from './editors/object.js'
import EditorArrayTuple from './editors/array-tuple.js'
import EditorArrayTable from './editors/array-table.js'
import EditorArrayTableObject from './editors/array-table-object.js'
import EditorArrayChoices from './editors/array-choices.js'
import EditorArrayNav from './editors/array-nav.js'
import EditorArray from './editors/array.js'
import EditorMultiple from './editors/multiple.js'
import EditorNull from './editors/null.js'
import EditorStringSimpleMDE from './editors/string-simplemde.js'
import EditorStringQuill from './editors/string-quill.js'
import EditorStringJodit from './editors/string-jodit.js'
import EditorStringFlatpickr from './editors/string-flatpickr.js'
import EditorStringIMask from './editors/string-imask.js'
import EditorNumberImask from './editors/number-imask.js'
import EditorNumberRaty from './editors/number-raty.js'
import EditorIfThenElse from './editors/if-then-else.js'
import EditorArrayCheckboxes from './editors/array-checkboxes.js'
import EditorNumberRange from './editors/number-range.js'
import EditorStringAce from './editors/string-ace.js'

class UiResolver {
  constructor (options) {
    this.customEditors = options.customEditors ?? []
    this.refParser = options.refParser ?? null

    this.editors = [
      EditorNumberInputNullable,
      EditorMultiple,
      EditorIfThenElse,
      EditorBooleanRadios,
      EditorBooleanCheckbox,
      EditorBooleanSelect,
      EditorStringRadios,
      EditorStringSelect,
      EditorStringTextarea,
      EditorStringAwesomplete,
      EditorStringEmojiButton,
      EditorStringSimpleMDE,
      EditorStringQuill,
      EditorStringJodit,
      EditorStringFlatpickr,
      EditorStringIMask,
      EditorStringAce,
      EditorStringInput,
      EditorNumberImask,
      EditorNumberRaty,
      EditorNumberRange,
      EditorNumberRadio,
      EditorNumberSelect,
      EditorNumberInput,
      EditorObjectGrid,
      EditorObjectNav,
      EditorObject,
      EditorArrayChoices,
      EditorArrayCheckboxes,
      EditorArrayTuple,
      EditorArrayTableObject,
      EditorArrayTable,
      EditorArrayNav,
      EditorArray,
      EditorNull
    ]
  }

  getClass (schema) {
    for (const editor of this.customEditors) {
      if (editor.resolves(schema, this.refParser)) {
        return editor
      }
    }

    for (const editor of this.editors) {
      if (editor.resolves(schema, this.refParser)) {
        return editor
      }
    }

    return null
  }
}

export default UiResolver
