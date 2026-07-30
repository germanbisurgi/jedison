import Editor from './editor.js'
import {
  isSet
} from '../helpers/utils.js'
import {
  getSchemaDescription,
  getSchemaIf,
  getSchemaXOption
} from '../helpers/schema.js'

/**
 * Represents an EditorIfThenElse instance.
 * @extends Editor
 */
class EditorIfThenElse extends Editor {
  static resolves (schema) {
    const schemaIf = getSchemaIf(schema)
    return isSet(schemaIf)
  }

  build () {
    this.control = this.theme.getIfThenElseControl({
      title: 'Options',
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      id: this.getIdFromPath(this.instance.path),
      description: getSchemaDescription(this.instance.schema)
    })
  }

  refreshUI () {
    this.refreshDisabledState()

    // Only swap the mounted branch when it actually changed. Re-appending the
    // same container on every refresh would tear down the active branch's DOM
    // (e.g. a nav's tabs) mid-interaction and eat clicks (issue #65).
    const activeContainer = this.instance.activeInstance.ui.control.container
    if (this.control.childrenSlot.firstChild !== activeContainer) {
      this.control.childrenSlot.innerHTML = ''
      this.control.childrenSlot.appendChild(activeContainer)
    }

    // An if/then/else node has no anchor of its own (its header/legend is
    // never mounted) — forward switcherSlot to whatever control the active
    // branch actually renders, so an ancestor Multiple/IfThenElse embeds its
    // switcher there instead of it floating above the branch editor.
    // Recomputed on every refresh since the active branch can change.
    this.control.switcherSlot = this.instance.activeInstance.ui.control.switcherSlot

    if (this.disabled || this.instance.isReadOnly()) {
      this.instance.activeInstance.ui.disable()
    } else {
      this.instance.activeInstance.ui.enable()
    }
  }

  getErrorFeedback (config) {
    return this.theme.getAlert(config)
  }
}

export default EditorIfThenElse
