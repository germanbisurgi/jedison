import EventEmitter from '../event-emitter.js'
import Jedison from '../jedison.js'
import Theme from '../themes/theme.js'
import SchemaGenerator from '../schema-generator/schema-generator.js'
import { clone, isObject } from '../helpers/utils.js'
import { DRAFTS } from './schema-keywords.js'
import { validateSchema } from './validator.js'
import NodeEditor from './node-editor.js'
import { createElement } from './dom.js'

function detectDraft (schema) {
  if (isObject(schema) && typeof schema.$schema === 'string') {
    const draft = DRAFTS.find((d) => d.value === schema.$schema)
    if (draft) return draft.value
  }
  return DRAFTS[DRAFTS.length - 1].value
}

/**
 * A visual JSON Schema builder. It edits a schema object through structured
 * controls and previews the resulting Jedison form. Data entry is fully
 * ignored — the preview is rendered read-only.
 *
 * @extends EventEmitter
 */
class SchemaBuilder extends EventEmitter {
  /**
   * @param {object} options
   * @param {HTMLElement} options.container - Where the builder UI is rendered
   * @param {object|boolean} [options.schema] - Initial schema
   * @param {Theme} [options.theme] - Theme used for the form preview
   * @param {string} [options.draft] - JSON Schema draft uri
   * @param {number} [options.maxDepth] - Maximum nesting depth (default 20)
   * @param {object} [options.preview] - Extra options forwarded to the preview Jedison instance
   */
  constructor (options = {}) {
    super()

    this.container = options.container
    this.theme = options.theme || new Theme()
    this.draft = options.draft || detectDraft(options.schema)
    this.maxDepth = options.maxDepth ?? 20
    this.previewOptions = options.preview || {}

    this.schema = clone(options.schema)
    if (!isObject(this.schema)) {
      this.schema = { type: 'object', properties: {} }
    }

    this.errors = []
    this.preview = null
    this.previewTimer = null
    this.expandedProps = {}

    this.render()
    this.notifyChange()
  }

  /**
   * Returns a deep clone of the edited schema.
   * @returns {object}
   */
  getSchema () {
    return clone(this.schema)
  }

  /**
   * Replaces the edited schema and re-renders.
   * @param {object|boolean} schema
   */
  setSchema (schema) {
    const next = clone(schema)
    if (!isObject(next)) {
      this.schema = { type: 'object', properties: {} }
    } else {
      this.schema = next
    }
    this.draft = detectDraft(this.schema)
    this.notifyChange(true)
  }

  /**
   * Returns the latest validation errors.
   * @returns {Array<{path: string, message: string}>}
   */
  getErrors () {
    return this.errors
  }

  validate () {
    const result = validateSchema(this.schema, this.draft)
    this.errors = result.errors
    this.emit('validate', result)
    return result
  }

  notifyChange (structural = false) {
    if (structural) {
      this.renderEditorPane()
    }

    this.validate()
    this.updateStatus()

    this.emit('change', clone(this.schema))

    clearTimeout(this.previewTimer)
    this.previewTimer = setTimeout(() => {
      this.renderPreview()
    }, 300)
  }

  render () {
    if (this.container) {
      this.container.innerHTML = ''
    }

    this.container.appendChild(this.renderToolbar())

    this.builderPane = createElement('div', { class: 'jedi-sb-builder-pane', style: { flex: '1 1 50%', minWidth: '320px', overflow: 'auto', padding: '12px', borderRight: '1px solid #dee2e6', maxHeight: '75vh', overflowY: 'auto' } })
    this.previewPane = createElement('div', { class: 'jedi-sb-preview-pane', style: { flex: '1 1 50%', minWidth: '320px', overflow: 'auto', padding: '12px', maxHeight: '75vh', overflowY: 'auto' } })

    const main = createElement('div', { class: 'jedi-sb-main', style: { display: 'flex', gap: '0', flexWrap: 'wrap' } }, [this.builderPane, this.previewPane])
    this.container.appendChild(main)

    this.errorsPanel = createElement('div', { class: 'jedi-sb-errors', style: { marginTop: '8px' } })
    this.container.appendChild(this.errorsPanel)

    this.renderEditorPane()
  }

  renderToolbar () {
    const draftSelect = createElement('select', { class: 'jedi-sb-draft', style: { fontSize: '12px', padding: '2px 4px' } })
    DRAFTS.forEach((draft) => {
      draftSelect.appendChild(createElement('option', { value: draft.value, selected: draft.value === this.draft }, [draft.label]))
    })
    draftSelect.addEventListener('change', () => {
      this.draft = draftSelect.value
      if (isObject(this.schema)) {
        this.schema.$schema = this.draft
      }
      this.notifyChange(true)
    })

    this.statusBadge = createElement('span', { class: 'jedi-sb-status', style: { fontWeight: '600', fontSize: '12px', marginLeft: '12px' } })

    const fromJsonBtn = this.toolbarButton('Import JSON', () => this.openImportDialog())
    const generateBtn = this.toolbarButton('Generate from JSON', () => this.openGenerateDialog())
    const copyBtn = this.toolbarButton('Copy JSON', () => this.openExportDialog())

    return createElement('div', { class: 'jedi-sb-toolbar', style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderBottom: '1px solid #dee2e6', flexWrap: 'wrap' } }, [
      createElement('label', { for: 'jedi-sb-draft-select', style: { fontSize: '12px' } }, ['Draft']),
      draftSelect,
      fromJsonBtn,
      generateBtn,
      copyBtn,
      this.statusBadge
    ])
  }

  toolbarButton (label, onClick) {
    return createElement('button', {
      type: 'button',
      class: 'jedi-sb-btn',
      onClick,
      style: { padding: '3px 10px', fontSize: '12px', cursor: 'pointer' }
    }, [label])
  }

  renderEditorPane () {
    if (!this.builderPane) return

    this.builderPane.innerHTML = ''

    const editor = new NodeEditor({
      schema: this.schema,
      draft: this.draft,
      depth: 0,
      maxDepth: this.maxDepth,
      path: '#',
      onChange: () => this.notifyChange(false),
      onStructuralChange: () => this.notifyChange(true),
      expanded: this.expandedProps,
      onSetExpanded: (key, expanded) => {
        if (expanded) {
          this.expandedProps[key] = true
        } else {
          delete this.expandedProps[key]
        }
      },
      renderNodeEditor: this.renderNodeEditor
    })

    this.builderPane.appendChild(editor.render())
  }

  renderNodeEditor (schema, path, depth) {
    if (depth > this.maxDepth) {
      return createElement('div', { style: { color: '#b02a37', fontSize: '12px', margin: '8px 0' } }, ['Maximum nesting depth reached.'])
    }

    const editor = new NodeEditor({
      schema,
      draft: this.draft,
      depth,
      maxDepth: this.maxDepth,
      path,
      onChange: () => this.notifyChange(false),
      onStructuralChange: () => this.notifyChange(true),
      expanded: this.expandedProps,
      onSetExpanded: (key, expanded) => {
        if (expanded) {
          this.expandedProps[key] = true
        } else {
          delete this.expandedProps[key]
        }
      },
      renderNodeEditor: this.renderNodeEditor
    })

    return editor.render()
  }

  updateStatus () {
    if (!this.statusBadge) return
    this.statusBadge.textContent = this.errors.length === 0
      ? '✓ Valid'
      : `${this.errors.length} error${this.errors.length === 1 ? '' : 's'}`
    this.statusBadge.style.color = this.errors.length === 0 ? '#198754' : '#b02a37'
    this.renderErrors()
  }

  renderErrors () {
    if (!this.errorsPanel) return
    this.errorsPanel.innerHTML = ''

    if (this.errors.length === 0) return

    const list = createElement('ul', { style: { fontSize: '12px', color: '#b02a37', margin: 0, paddingLeft: '20px' } })
    this.errors.forEach((error) => {
      list.appendChild(createElement('li', {}, [`${error.path}: ${error.message}`]))
    })

    this.errorsPanel.appendChild(createElement('div', { style: { background: '#f8d7da', border: '1px solid #f5c2c7', borderRadius: '4px', padding: '8px 12px' } }, [
      createElement('strong', {}, ['Schema validation errors']),
      list
    ]))
  }

  renderPreview () {
    if (this.preview) {
      this.preview.destroy()
      this.preview = null
    }

    this.previewPane.innerHTML = ''

    if (this.errors.length > 0) {
      this.previewPane.appendChild(createElement('div', { style: { color: '#6c757d', fontSize: '13px', fontStyle: 'italic' } }, ['Fix the validation errors to preview the form.']))
      return
    }

    const previewSchema = clone(this.schema)
    if (isObject(previewSchema)) {
      previewSchema.readOnly = true
    }

    const options = {
      container: this.previewPane,
      schema: previewSchema,
      theme: this.theme,
      showErrors: 'change',
      ...this.previewOptions
    }

    try {
      this.preview = new Jedison(options)
    } catch (error) {
      this.previewPane.appendChild(createElement('div', { style: { color: '#b02a37', fontSize: '13px' } }, [`Preview failed: ${error.message}`]))
    }
  }

  openImportDialog () {
    this.openOverlay({
      title: 'Import JSON schema',
      value: JSON.stringify(this.schema, null, 2),
      placeholder: 'Paste a JSON schema here…',
      confirmLabel: 'Load',
      onConfirm: (text) => {
        this.setSchema(JSON.parse(text))
      }
    })
  }

  openGenerateDialog () {
    this.openOverlay({
      title: 'Generate schema from JSON',
      value: '{\n  "name": "Ada"\n}',
      placeholder: 'Paste example JSON here…',
      confirmLabel: 'Generate',
      onConfirm: (text) => {
        const generated = SchemaGenerator.generate(JSON.parse(text))
        generated.$schema = this.draft
        this.setSchema(generated)
      }
    })
  }

  openExportDialog () {
    const textarea = createElement('textarea', {
      class: 'jedi-sb-export',
      rows: 20,
      readonly: true,
      style: { width: '100%', fontFamily: 'monospace', fontSize: '12px' },
      value: JSON.stringify(this.schema, null, 2)
    })

    const overlay = this.openOverlay({ title: 'Export schema JSON', content: textarea, confirmLabel: 'Copy' })

    overlay.confirmBtn.addEventListener('click', () => {
      textarea.select()
      document.execCommand('copy')
      overlay.close()
    })
  }

  openOverlay ({ title, value, placeholder, content, confirmLabel, onConfirm }) {
    const textarea = content || createElement('textarea', {
      class: 'jedi-sb-overlay-textarea',
      rows: 20,
      style: { width: '100%', fontFamily: 'monospace', fontSize: '12px' },
      value: value || ''
    })

    if (placeholder) {
      textarea.setAttribute('placeholder', placeholder)
    }

    const closeBtn = createElement('button', { type: 'button', style: { cursor: 'pointer' } }, ['Cancel'])
    const confirmBtn = createElement('button', { type: 'button', style: { cursor: 'pointer', marginLeft: '8px' } }, [confirmLabel || 'OK'])

    const footer = createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', marginTop: '8px' } }, [closeBtn, confirmBtn])

    const box = createElement('div', {
      class: 'jedi-sb-overlay-box',
      style: { background: '#fff', border: '1px solid #dee2e6', borderRadius: '6px', padding: '12px', maxWidth: '640px', width: '90%', margin: '0 auto' }
    }, [
      createElement('h3', { style: { margin: '0 0 8px', fontSize: '16px' } }, [title]),
      textarea,
      footer
    ])

    const overlay = createElement('div', {
      class: 'jedi-sb-overlay',
      style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', zIndex: 1000 }
    }, [box])

    const close = () => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay)
      }
    }

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close()
    })
    closeBtn.addEventListener('click', close)

    confirmBtn.addEventListener('click', () => {
      try {
        if (onConfirm) {
          onConfirm(textarea.value)
        }
        close()
      } catch (error) {
        this.showOverlayError(box, error.message)
      }
    })

    document.body.appendChild(overlay)
    textarea.focus()

    return { overlay, textarea, confirmBtn, close }
  }

  showOverlayError (box, message) {
    let errorEl = box.querySelector('.jedi-sb-overlay-error')
    if (!errorEl) {
      errorEl = createElement('div', { class: 'jedi-sb-overlay-error', style: { color: '#b02a37', fontSize: '12px', marginTop: '8px' } })
      box.appendChild(errorEl)
    }
    errorEl.textContent = message
  }

  /**
   * Destroys the preview and removes the builder UI.
   */
  destroy () {
    clearTimeout(this.previewTimer)

    if (this.preview) {
      this.preview.destroy()
      this.preview = null
    }

    if (this.container) {
      this.container.innerHTML = ''
    }

    Object.keys(this).forEach((key) => {
      delete this[key]
    })
  }
}

export default SchemaBuilder
