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
import EditorObjectCategories from './editors/object-categories.js'
import EditorObjectNav from './editors/object-nav.js'
import EditorObjectAccordion from './editors/object-accordion.js'
import EditorObjectHorizontal from './editors/object-horizontal.js'
import EditorObjectRadios from './editors/object-radios.js'
import EditorObject from './editors/object.js'
import EditorArrayTuple from './editors/array-tuple.js'
import EditorArrayTable from './editors/array-table.js'
import EditorArrayTableObject from './editors/array-table-object.js'
import EditorArrayChoices from './editors/array-choices.js'
import EditorArrayTomSelect from './editors/array-tom-select.js'
import EditorArrayNav from './editors/array-nav.js'
import EditorArray from './editors/array.js'
import EditorMultiple from './editors/multiple.js'
import EditorNull from './editors/null.js'
import EditorStringSimpleMDE from './editors/string-simplemde.js'
import EditorStringMilkdown from './editors/string-milkdown.js'
import EditorStringQuill from './editors/string-quill.js'
import EditorStringJodit from './editors/string-jodit.js'
import EditorStringPickr from './editors/string-pickr.js'
import EditorStringFlatpickr from './editors/string-flatpickr.js'
import EditorStringIMask from './editors/string-imask.js'
import EditorNumberImask from './editors/number-imask.js'
import EditorNumberRaty from './editors/number-raty.js'
import EditorIfThenElse from './editors/if-then-else.js'
import EditorAnyJson from './editors/any-json.js'
import EditorArrayCheckboxes from './editors/array-checkboxes.js'
import EditorNumberRange from './editors/number-range.js'
import EditorStringAce from './editors/string-ace.js'
import EditorStringFilepond from './editors/string-filepond.js'

function byPriorityDescending (a, b) {
  return b.priority() - a.priority()
}

class UiResolver {
  constructor (options) {
    this.customEditors = [...(options.customEditors ?? [])].sort(byPriorityDescending)
    this.refParser = options.refParser ?? null

    this.editors = [
      EditorNumberInputNullable,
      EditorMultiple,
      EditorIfThenElse,
      EditorAnyJson,
      EditorBooleanRadios,
      EditorBooleanCheckbox,
      EditorBooleanSelect,
      EditorStringRadios,
      EditorStringSelect,
      EditorStringTextarea,
      EditorStringAwesomplete,
      EditorStringEmojiButton,
      EditorStringSimpleMDE,
      EditorStringMilkdown,
      EditorStringQuill,
      EditorStringJodit,
      EditorStringPickr,
      EditorStringFlatpickr,
      EditorStringIMask,
      EditorStringAce,
      EditorStringFilepond,
      EditorStringInput,
      EditorNumberImask,
      EditorNumberRaty,
      EditorNumberRange,
      EditorNumberRadio,
      EditorNumberSelect,
      EditorNumberInput,
      EditorObjectGrid,
      EditorObjectCategories,
      EditorObjectNav,
      EditorObjectAccordion,
      EditorObjectHorizontal,
      EditorObjectRadios,
      EditorObject,
      EditorArrayChoices,
      EditorArrayTomSelect,
      EditorArrayCheckboxes,
      EditorArrayTuple,
      EditorArrayTableObject,
      EditorArrayTable,
      EditorArrayNav,
      EditorArray,
      EditorNull
    ].sort(byPriorityDescending)
  }

  getClass (schema) {
    for (const editor of this.customEditors) {
      try {
        if (editor.resolves(schema, this.refParser)) {
          return editor
        }
      } catch (e) {
        console.error(`Editor "${editor.name || 'custom editor'}" threw while resolving the schema and will be skipped.`, e)
      }
    }

    for (const editor of this.editors) {
      try {
        if (editor.resolves(schema, this.refParser)) {
          return editor
        }
      } catch (e) {
        console.error(`Editor "${editor.name || 'built-in editor'}" threw while resolving the schema and will be skipped.`, e)
      }
    }

    return null
  }
}

export default UiResolver
