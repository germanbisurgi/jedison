import Editor from './editor.js'
import { getSchemaXOption } from '../helpers/schema.js'

class EditorAnyJson extends Editor {
  static resolves (schema) {
    return getSchemaXOption(schema, 'format') === 'json'
  }

  build () {
    this.control = this.theme.getTextareaControl({
      title: this.getTitle(),
      description: this.getDescription(),
      id: this.getIdFromPath(this.instance.path),
      titleIconClass: getSchemaXOption(this.instance.schema, 'titleIconClass'),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      info: this.getInfo()
    })

    this.jsonErrorEl = document.createElement('div')
    this.jsonErrorEl.style.color = 'red'
    this.control.container.appendChild(this.jsonErrorEl)
  }

  addEventListeners () {
    this.control.input.addEventListener('change', () => {
      try {
        const parsed = JSON.parse(this.control.input.value)
        this.jsonErrorEl.textContent = ''
        this.instance.setValue(parsed, true, 'user')
      } catch (e) {
        this.jsonErrorEl.textContent = e.message
      }
    })
  }

  refreshUI () {
    this.control.input.value = JSON.stringify(this.instance.getValue(), null, 2)
  }
}

export default EditorAnyJson
