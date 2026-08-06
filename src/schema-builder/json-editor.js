import { createElement, btn } from './dom.js'

/**
 * A plain-text JSON editor for a JSON Schema. Parses the textarea content on
 * a debounced timer, keeps the raw text untouched while typing and prettifies
 * on demand through the Format button.
 */
class JsonEditor {
  /**
   * @param {object} options
   * @param {object|boolean} options.schema - Initial schema to seed the textarea
   * @param {Function} options.onChange - (schema) => void, called with the parsed schema
   * @param {number} [options.delay] - Debounce delay in ms (default 300)
   */
  constructor ({ schema, onChange, delay = 300 }) {
    this.onChange = onChange
    this.delay = delay
    this.timer = null
    this.errorEl = null

    this.textarea = createElement('textarea', {
      class: 'jedi-sb-json',
      rows: 30,
      spellcheck: false,
      style: { width: '100%', fontFamily: 'monospace', fontSize: '12px', minHeight: '60vh' }
    })

    this.textarea.addEventListener('input', () => {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => this.parse(), this.delay)
    })

    this.sync(schema)
  }

  render () {
    const formatBtn = btn('Format', () => this.format(), { class: 'jedi-sb-format-btn' })

    this.errorEl = createElement('div', { class: 'jedi-sb-json-error', style: { color: '#b02a37', fontSize: '12px' } })

    return createElement('div', { class: 'jedi-sb-text-editor', style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, [
      createElement('div', { style: { display: 'flex', justifyContent: 'flex-end' } }, [formatBtn]),
      this.textarea,
      this.errorEl
    ])
  }

  parse () {
    try {
      const parsed = JSON.parse(this.textarea.value)
      this.setError('')
      this.onChange(parsed)
      return parsed
    } catch (error) {
      this.setError(`Invalid JSON: ${error.message}`)
      return undefined
    }
  }

  format () {
    const parsed = this.parse()
    if (parsed !== undefined) {
      this.textarea.value = JSON.stringify(parsed, null, 2)
    }
  }

  sync (schema) {
    this.textarea.value = JSON.stringify(schema, null, 2)
  }

  setError (message) {
    if (this.errorEl) {
      this.errorEl.textContent = message
    }
  }

  destroy () {
    clearTimeout(this.timer)
    this.timer = null
  }
}

export default JsonEditor
