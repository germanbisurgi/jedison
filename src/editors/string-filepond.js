import EditorString from './string.js'
import { isSet } from '../helpers/utils.js'
import { getSchemaType, getSchemaXOption } from '../helpers/schema.js'

/**
 * Represents an EditorStringFilepond instance.
 * @extends EditorString
 */
class EditorStringFilepond extends EditorString {
  static resolves (schema) {
    const format = getSchemaXOption(schema, 'format')
    return isSet(format) &&
      format === 'filepond' &&
      window.FilePond &&
      getSchemaType(schema) === 'string'
  }

  build () {
    this.control = this.theme.getInputControl({
      title: this.getTitle(),
      description: this.getDescription(),
      type: 'file',
      id: this.getIdFromPath(this.instance.path),
      titleIconClass: getSchemaXOption(this.instance.schema, 'titleIconClass'),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      info: this.getInfo()
    })

    try {
      const schemaFilepond = getSchemaXOption(this.instance.schema, 'filepond') ?? {}
      const settingsKey = schemaFilepond['x-settings']
      const settings = settingsKey && this.instance.jedison.getOption('settings')[settingsKey]
        ? this.instance.jedison.getOption('settings')[settingsKey]
        : {}
      const filepondOptions = { ...schemaFilepond, ...settings }

      this.hasServer = !!(filepondOptions.server)
      this.filepond = window.FilePond.create(this.control.input, filepondOptions)

      this.filepond.on('processfile', (error, file) => {
        if (error) return
        const serverIds = this.filepond.getFiles()
          .filter(f => f.serverId)
          .map(f => f.serverId)
        this.instance.setValue(serverIds.join(', '), true, 'user')
      })

      this.filepond.on('addfile', (error) => {
        if (error || this.hasServer) return
        const names = this.filepond.getFiles().map(f => f.filename).join(', ')
        this.instance.setValue(names, true, 'user')
      })

      this.filepond.on('processfilerevert', () => {
        const serverIds = this.filepond.getFiles()
          .filter(f => f.serverId)
          .map(f => f.serverId)
        this.instance.setValue(serverIds.join(', '), true, 'user')
      })

      this.filepond.on('removefile', () => {
        const remaining = this.filepond.getFiles()
        if (this.hasServer) {
          const serverIds = remaining.filter(f => f.serverId).map(f => f.serverId)
          this.instance.setValue(serverIds.join(', '), true, 'user')
        } else {
          this.instance.setValue(remaining.map(f => f.filename).join(', '), true, 'user')
        }
      })
    } catch (e) {
      console.error('FilePond is not available or not loaded correctly.', e)
    }
  }

  addEventListeners () {}

  refreshUI () {
    if (!this.filepond) return
    this.refreshTemplates()
    this.filepond.setOptions({ disabled: this.disabled || this.readOnly })
  }

  destroy () {
    if (this.filepond) {
      this.filepond.destroy()
    }
    super.destroy()
  }
}

export default EditorStringFilepond
