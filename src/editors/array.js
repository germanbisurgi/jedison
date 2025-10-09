import Editor from './editor.js'
import { clamp, isArray, isSet } from '../helpers/utils.js'
import {
  getSchemaMaxItems,
  getSchemaMinItems,
  getSchemaType,
  getSchemaXOption
} from '../helpers/schema.js'

/**
 * Represents an EditorArray instance.
 * @extends Editor
 */
class EditorArray extends Editor {
  static resolves (schema) {
    return getSchemaType(schema) === 'array'
  }

  init () {
    super.init()
    this.activeItemIndex = 0
  }

  build () {
    this.control = this.theme.getArrayControl({
      title: this.getTitle(),
      description: this.getDescription(),
      titleHidden: getSchemaXOption(this.instance.schema, 'titleHidden'),
      id: this.getIdFromPath(this.instance.path),
      enableCollapseToggle: getSchemaXOption(this.instance.schema, 'enableCollapseToggle') ?? this.instance.jedison.options.enableCollapseToggle,
      startCollapsed: getSchemaXOption(this.instance.schema, 'startCollapsed') ?? this.instance.jedison.options.startCollapsed,
      readOnly: this.instance.isReadOnly(),
      info: this.getInfo(),
      editJsonData: getSchemaXOption(this.instance.schema, 'editJsonData') ?? this.instance.jedison.options.editJsonData,
      arrayAdd: getSchemaXOption(this.instance.schema, 'arrayAdd') ?? this.instance.jedison.options.arrayAdd,
      arrayAddContent: getSchemaXOption(this.instance.schema, 'arrayAddContent') ?? this.instance.jedison.translator.translate('arrayAdd'),
      collapseToggleContent: getSchemaXOption(this.instance.schema, 'collapseToggleContent') ?? this.instance.jedison.translator.translate('collapseToggle')
    })

    this.control.jsonData.input.value = JSON.stringify(this.instance.getValue(), null, 2)
  }

  addEventListeners () {
    this.control.addBtn.addEventListener('click', () => {
      this.instance.addItem('user')
    })

    this.control.jsonData.saveBtn.addEventListener('click', () => {
      try {
        const inputValue = JSON.parse(this.control.jsonData.input.value)
        this.instance.setValue(inputValue, true, 'user')
        this.control.jsonData.dialog.close()
      } catch (error) {
        // eslint-disable-next-line no-undef
        alert('Invalid JSON')
      }
    })

    this.control.jsonData.toggle.addEventListener('click', () => {
      this.refreshJsonDataInputSize()
    })
  }

  getErrorFeedback (config) {
    return this.theme.getAlert(config)
  }

  sanitize (value) {
    if (isArray(value)) {
      return value
    }

    return []
  }

  getButtons (index) {
    const schemaDeleteContent = getSchemaXOption(this.instance.schema, 'arrayDeleteContent')
    const schemaMoveUpContent = getSchemaXOption(this.instance.schema, 'arrayMoveUpContent')
    const schemaMoveDownContent = getSchemaXOption(this.instance.schema, 'arrayMoveDownContent')
    const schemaDragContent = getSchemaXOption(this.instance.schema, 'arrayDragContent')

    const deleteBtn = this.theme.getDeleteItemBtn({
      content: schemaDeleteContent ?? this.instance.jedison.translator.translate('arrayDelete')
    })

    const moveUpBtn = this.theme.getMoveUpItemBtn({
      content: schemaMoveUpContent ?? this.instance.jedison.translator.translate('arrayMoveUp')
    })

    const moveDownBtn = this.theme.getMoveDownItemBtn({
      content: schemaMoveDownContent ?? this.instance.jedison.translator.translate('arrayMoveDown')
    })

    const dragBtn = this.theme.getDragItemBtn({
      content: schemaDragContent ?? this.instance.jedison.translator.translate('arrayDrag')
    })

    const btnGroup = this.theme.getBtnGroup()

    deleteBtn.addEventListener('click', () => {
      const confirmDeletion = window.confirm(this.instance.jedison.translator.translate('arrayConfirmDelete'))

      if (confirmDeletion) {
        this.activeItemIndex = clamp((index - 1), 0, (this.instance.value.length - 1))
        this.instance.deleteItem(index, 'user')
      }
    })

    moveUpBtn.addEventListener('click', () => {
      const toIndex = index - 1
      this.activeItemIndex = toIndex
      this.instance.move(index, toIndex, 'user')
    })

    moveDownBtn.addEventListener('click', () => {
      const toIndex = index + 1
      this.activeItemIndex = toIndex
      this.instance.move(index, toIndex, 'user')
    })

    if (index === 0) {
      moveUpBtn.setAttribute('always-disabled', true)
    }

    if (index === this.instance.children.length - 1) {
      moveDownBtn.setAttribute('always-disabled', true)
    }

    return { deleteBtn, moveUpBtn, moveDownBtn, btnGroup, dragBtn }
  }

  isSortable () {
    return window.Sortable && isSet(getSchemaXOption(this.instance.schema, 'sortable'))
  }

  refreshSortable (container) {
    if (this.isSortable()) {
      if (this.sortable) {
        this.sortable.destroy()
      }

      this.sortable = window.Sortable.create(container, {
        animation: 150,
        handle: '.jedi-array-drag',
        disabled: this.disabled || this.readOnly,
        onEnd: (evt) => {
          this.instance.move(evt.oldIndex, evt.newIndex)
        }
      })
    }
  }

  refreshAddBtn () {
    const maxItems = getSchemaMaxItems(this.instance.schema)
    const enforceMaxItems = getSchemaXOption(this.instance.schema, 'enforceMaxItems') ?? this.instance.jedison.options.enforceMaxItems

    if (isSet(maxItems) && enforceMaxItems && maxItems <= this.instance.value.length) {
      this.control.addBtn.setAttribute('disabled', '')
      this.control.addBtn.setAttribute('always-disabled', true)
    } else {
      if (!this.disabled && !this.readOnly) {
        this.control.addBtn.removeAttribute('disabled')
        this.control.addBtn.removeAttribute('always-disabled')
      }
    }
  }

  refreshUI () {
    super.refreshUI()
    const minItems = getSchemaMinItems(this.instance.schema)
    const arrayDelete = getSchemaXOption(this.instance.schema, 'arrayDelete') ?? this.instance.jedison.options.arrayDelete
    const arrayMove = getSchemaXOption(this.instance.schema, 'arrayMove') ?? this.instance.jedison.options.arrayMove

    this.control.childrenSlot.innerHTML = ''

    this.instance.children.forEach((child, index) => {
      const { deleteBtn, moveUpBtn, moveDownBtn, dragBtn, btnGroup } = this.getButtons(index)
      const { container, arrayActions, body } = this.theme.getArrayItem({
        readOnly: this.instance.isReadOnly(),
        index: index
      })

      arrayActions.appendChild(btnGroup)

      if (isSet(arrayDelete) && arrayDelete === true) {
        btnGroup.appendChild(deleteBtn)
      }

      if (isSet(arrayMove) && arrayMove === true) {
        btnGroup.appendChild(moveUpBtn)
        btnGroup.appendChild(moveDownBtn)
      }

      if (this.isSortable()) {
        btnGroup.appendChild(dragBtn)
      }

      this.control.childrenSlot.appendChild(container)
      body.appendChild(child.ui.control.container)

      if (this.disabled || this.instance.isReadOnly()) {
        child.ui.disable()
      } else {
        child.ui.enable()
      }

      if (isSet(minItems) && this.instance.value.length <= minItems) {
        deleteBtn.setAttribute('disabled', '')
      }
    })

    this.refreshDisabledState()
    this.refreshSortable(this.control.childrenSlot)

    this.instance.children.forEach((child) => {
      child.ui.refreshUI()
    })

    this.refreshAddBtn()
    this.refreshJsonData()
  }
}

export default EditorArray
