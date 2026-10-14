import EditorString from './string.js'
import { isSet } from '../helpers/utils.js'
import { getSchemaType, getSchemaXOption } from '../helpers/schema.js'

class EditorStringBpmn extends EditorString {
  static resolves (schema) {
    const format = getSchemaXOption(schema, 'format')

    return isSet(format) &&
      format === 'bpmn' &&
      window.BpmnJS &&
      getSchemaType(schema) === 'string'
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

    const options = getSchemaXOption(this.instance.schema, 'bpmn') ?? {}

    this.bpmnContainer = document.createElement('div')
    this.bpmnContainer.style.height = options.height || '400px'
    this.bpmnContainer.style.width = options.width || '100%'
    this.bpmnContainer.style.border = '1px solid #ced4da'

    this.control.input.style.display = 'none'
    this.control.input.parentNode.insertBefore(this.bpmnContainer, this.control.input)

    this.bpmn = new window.BpmnJS({ container: this.bpmnContainer })
    this.lastXml = null

    this.buildToolbar(options)
    this.importValue(this.instance.getValue())
  }

  buildToolbar (options) {
    this.fileName = options.fileName || 'diagram.bpmn'
    this.importError = document.createElement('div')

    const toolbar = this.theme.getBtnGroup()
    this.importBtn = this.getTextButton('Import')
    this.exportBtn = this.getTextButton('Export')
    this.exportSvgBtn = this.getTextButton('Export SVG')

    this.fileInput = document.createElement('input')
    this.fileInput.type = 'file'
    this.fileInput.accept = '.bpmn,.xml'
    this.fileInput.style.display = 'none'

    if (options.import !== false) toolbar.appendChild(this.importBtn)
    if (options.export !== false) {
      toolbar.appendChild(this.exportBtn)
      toolbar.appendChild(this.exportSvgBtn)
    }

    toolbar.style.display = 'block'
    toolbar.style.marginTop = '0.5rem'
    this.bpmnContainer.after(toolbar, this.fileInput, this.importError)
  }

  // The themes have no upload/download icons, so the label must stay visible
  // even when btnContents is off (icon-only buttons).
  getTextButton (content) {
    const button = this.theme.getButton({ content })
    button.textContent = content
    return button
  }

  showImportError (message) {
    this.importError.innerHTML = ''

    if (message) {
      this.importError.appendChild(this.theme.getErrorFeedback({ message }))
    }
  }

  download (content, fileName, type) {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([content], { type }))
    link.download = fileName
    link.click()
    URL.revokeObjectURL(link.href)
  }

  async importValue (value) {
    const xml = typeof value === 'string' ? value : ''
    this.lastXml = xml

    try {
      if (xml) {
        await this.bpmn.importXML(xml)
      } else {
        await this.bpmn.createDiagram()
      }
      // build() runs before the control is in the page, so fit after layout
      window.requestAnimationFrame(() => this.bpmn.get('canvas').zoom('fit-viewport', 'auto'))
      this.showImportError('')
      return true
    } catch (e) {
      console.error('BPMN diagram could not be imported.', e)
      this.showImportError('The BPMN diagram could not be imported: ' + e.message.split('\n')[0])
      return false
    }
  }

  addEventListeners () {
    this.bpmn.on('commandStack.changed', async () => {
      try {
        const { xml } = await this.bpmn.saveXML({ format: true })
        this.lastXml = xml

        if (xml !== this.instance.getValue()) {
          this.instance.setValue(xml, true, 'user')
        }
      } catch (e) {
        console.error('BPMN diagram could not be exported.', e)
      }
    })

    this.importBtn.addEventListener('click', () => this.fileInput.click())

    this.fileInput.addEventListener('change', async () => {
      const file = this.fileInput.files[0]
      this.fileInput.value = ''

      if (!file) return

      const xml = await file.text()

      if (await this.importValue(xml)) {
        this.instance.setValue(xml, true, 'user')
      }
    })

    this.exportBtn.addEventListener('click', async () => {
      const { xml } = await this.bpmn.saveXML({ format: true })
      this.download(xml, this.fileName, 'application/xml')
    })

    this.exportSvgBtn.addEventListener('click', async () => {
      const { svg } = await this.bpmn.saveSVG()
      this.download(svg, this.fileName.replace(/\.[^.]+$/, '') + '.svg', 'image/svg+xml')
    })
  }

  refreshDisabledState () {
    const locked = this.disabled || this.readOnly

    this.bpmnContainer.style.pointerEvents = locked ? 'none' : ''
    this.bpmnContainer.style.opacity = locked ? '0.6' : '1'
    this.importBtn.disabled = locked
  }

  refreshUI () {
    super.refreshUI()

    const value = this.instance.getValue()
    const xml = typeof value === 'string' ? value : ''

    // Only re-import on external changes, not on the echo of our own export.
    if (xml !== this.lastXml) {
      this.importValue(xml)
    }
  }

  destroy () {
    this.bpmn.destroy()
    super.destroy()
  }
}

export default EditorStringBpmn
