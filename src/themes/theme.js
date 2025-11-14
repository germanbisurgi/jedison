import { generateRandomID, isObject, isSet, isString } from '../helpers/utils.js'

/**
 * Represents a Theme instance.
 */
class Theme {
  constructor (icons = null) {
    this.icons = icons
    this.useToggleEvents = true
    this.btnContents = true
    this.btnIcons = true
    this.init()
  }

  /**
   * Inits some instance properties
   */
  init () {
    this.useToggleEvents = true
  }

  /**
   * Used to wrap the editor UI elements
   */
  getEditorContainer () {
    const html = document.createElement('div')
    html.classList.add('jedi-editor-container')
    return html
  }

  /**
   * Used to group several controls
   */
  getFieldset () {
    const html = document.createElement('fieldset')
    html.classList.add('jedi-editor-fieldset')
    html.setAttribute('role', 'group')
    return html
  }

  /**
   * Represents a caption for the content of its parent fieldset
   */
  getLegend (config) {
    const left = document.createElement('div')
    const right = document.createElement('div')
    const legend = document.createElement('legend')
    const legendText = document.createElement('label')
    const infoContainer = document.createElement('span')
    const dummyInput = document.createElement('input')
    const legendLabelId = 'legend-label-' + config.id
    const dummyInputId = 'legend-dummy-input-' + config.id

    left.classList.add('jedi-editor-legend-left')
    right.classList.add('jedi-editor-legend-right')

    legend.classList.add('jedi-editor-legend')
    legend.style.fontSize = 'inherit'
    legend.setAttribute('aria-labelledby', legendLabelId)

    legendText.classList.add('jedi-title')
    legendText.classList.add('jedi-legend')
    legendText.setAttribute('id', legendLabelId)
    legendText.innerHTML = config.content

    infoContainer.classList.add('jedi-editor-info-container')
    infoContainer.setAttribute('for', dummyInputId)

    dummyInput.setAttribute('aria-hidden', 'true')
    dummyInput.setAttribute('type', 'hidden')
    dummyInput.setAttribute('id', dummyInputId)

    this.visuallyHidden(dummyInput)

    if (config.titleHidden) {
      this.visuallyHidden(legendText)
    }

    legend.appendChild(left)
    legend.appendChild(right)
    left.appendChild(legendText)
    left.appendChild(infoContainer)
    legendText.appendChild(dummyInput)

    return { left, right, legend, legendText, infoContainer }
  }

  /**
   * Used to group several controls
   */
  getRadioFieldset () {
    const fieldset = document.createElement('fieldset')
    fieldset.classList.add('jedi-editor-radio-fieldset')
    fieldset.setAttribute('role', 'group')
    fieldset.style.marginBottom = '15px'
    fieldset.style.fontSize = 'inherit'
    return fieldset
  }

  /**
   * Represents a caption for the content of its parent fieldset
   */
  getRadioLegend (config) {
    const legendLabelId = 'legend-label-' + config.id
    const legend = document.createElement('legend')
    const legendText = document.createElement('label')
    const dummyInput = document.createElement('input')

    legend.classList.add('jedi-editor-legend')
    legend.style.fontSize = 'inherit'
    legend.setAttribute('aria-labelledby', legendLabelId)

    legendText.classList.add('jedi-title')
    legendText.classList.add('jedi-label')
    legendText.innerHTML = config.content
    legendText.setAttribute('id', legendLabelId)

    dummyInput.setAttribute('aria-hidden', 'true')
    dummyInput.setAttribute('type', 'hidden')
    dummyInput.setAttribute('disabled', '')

    this.visuallyHidden(dummyInput)

    legend.appendChild(legendText)
    legendText.appendChild(dummyInput)

    return { legend, legendText }
  }

  /**
   * Represents a caption for the content of its parent fieldset
   */
  getLabel (config) {
    const label = document.createElement('label')
    const labelText = document.createElement('span')
    const icon = document.createElement('i')

    label.setAttribute('for', config.for)
    label.classList.add('jedi-title')
    label.classList.add('jedi-label')
    labelText.innerHTML = config.text

    if (config.visuallyHidden) {
      this.visuallyHidden(label)
    }

    if (config.titleIconClass) {
      this.addIconClass(icon, config.titleIconClass)
    }

    if (config.titleIconClass) {
      label.appendChild(icon)
    }

    label.appendChild(labelText)

    return { label, labelText, icon }
  }

  getFakeLabel (config) {
    const label = document.createElement('label')
    const labelText = document.createElement('span')
    const icon = document.createElement('i')
    const dummyInput = document.createElement('input')

    label.setAttribute('for', config.for)
    label.classList.add('jedi-title')
    label.classList.add('jedi-label')

    if (config.visuallyHidden) {
      this.visuallyHidden(label)
    }

    labelText.innerHTML = config.content

    if (config.titleIconClass) {
      this.addIconClass(icon, config.titleIconClass)
    }

    dummyInput.setAttribute('aria-hidden', 'true')
    dummyInput.setAttribute('type', 'hidden')
    dummyInput.setAttribute('disabled', '')
    dummyInput.setAttribute('id', config.for)
    this.visuallyHidden(dummyInput)

    label.appendChild(icon)
    label.appendChild(labelText)
    label.appendChild(dummyInput)

    return { label, labelText, icon, dummyInput }
  }

  /**
   * Returns a icon element
   */
  addIconClass (element, classes = '') {
    let iconClasses = classes.split(' ')
    iconClasses = iconClasses.filter((className) => className.length > 0)

    if (iconClasses) {
      iconClasses.forEach((className) => {
        element.classList.add(className)
      })
    }
  }

  getOptInWrapper () {
    const optInWrapper = document.createElement('span')
    const optInContainer = document.createElement('span')
    const otherContainer = document.createElement('span')

    optInWrapper.classList.add('jedi-opt-in-wrapper')
    optInWrapper.style.display = 'flex'
    optInWrapper.style.alignItems = 'center'

    optInContainer.classList.add('jedi-opt-in-container')

    otherContainer.classList.add('jedi-title-container')
    otherContainer.style.flexGrow = '1'

    optInWrapper.appendChild(otherContainer)
    optInWrapper.appendChild(optInContainer)

    return { optInWrapper, optInContainer, otherContainer }
  }

  /**
   * Container for complex editors like arrays and objects
   */
  getCard () {
    const html = document.createElement('div')
    html.classList.add('jedi-editor-card')
    return html
  }

  /**
   * Header for cards
   */
  getCardHeader () {
    const html = document.createElement('div')
    html.classList.add('jedi-editor-card-header')
    return html
  }

  /**
   * A body for the cards
   */
  getCardBody () {
    const html = document.createElement('div')
    html.classList.add('jedi-editor-card-body')
    return html
  }

  /**
   * Wrapper for editor actions buttons
   */
  getActionsSlot () {
    const html = document.createElement('div')
    html.classList.add('jedi-actions-slot')
    return html
  }

  /**
   * Wrapper for editor array specific actions buttons
   */
  getArrayActionsSlot () {
    const html = document.createElement('span')
    html.classList.add('jedi-array-actions-slot')
    return html
  }

  /**
   * Wrapper for child editors
   */
  getChildrenSlot () {
    const html = document.createElement('div')
    html.classList.add('jedi-children-slot')
    return html
  }

  /**
   * Wrapper for error messages
   */
  getMessagesSlot (config = {}) {
    const html = document.createElement('div')
    html.classList.add('jedi-messages-slot')
    html.setAttribute('aria-atomic', 'false')
    html.setAttribute('aria-live', 'polite')

    if (config.id) {
      html.setAttribute('id', config.id)
    }

    return html
  }

  /**
   * Wrapper for editor controls
   */
  getControlSlot () {
    const html = document.createElement('div')
    html.classList.add('jedi-control-slot')
    return html
  }

  /**
   * Toggles the ObjectEditor properties wrapper visibility
   */
  getPropertiesToggle (config) {
    const toggle = this.getButton(config)
    toggle.classList.add('jedi-properties-toggle')

    toggle.addEventListener('click', () => {
      if (config.propertiesContainer.open) {
        config.propertiesContainer.close()
      } else {
        config.propertiesContainer.showModal()
      }
    })

    return toggle
  }

  /**
   * Container that will collapse and expand to show and hide it contents
   */
  getCollapse (config) {
    const collapse = document.createElement('div')
    collapse.classList.add('jedi-collapse')
    collapse.setAttribute('id', config.id)

    if (this.useToggleEvents && config.startCollapsed) {
      collapse.style.display = 'none'
    }

    return collapse
  }

  /**
   * Toggle button for collapse
   */
  getCollapseToggle (config) {
    const toggle = this.getButton(config)
    toggle.classList.add('jedi-collapse-toggle')
    toggle.setAttribute('always-enabled', '')

    if (this.useToggleEvents) {
      toggle.addEventListener('click', () => {
        if (config.collapse.style.display === 'none') {
          config.collapse.style.display = 'block'
        } else {
          config.collapse.style.display = 'none'
        }
      })
    }

    let collapsed = config.startCollapsed

    if (collapsed) {
      toggle.setAttribute('aria-expanded', 'false')
    } else {
      toggle.setAttribute('aria-expanded', 'true')
    }

    toggle.style.transition = 'transform 0.1s ease'

    if (collapsed) {
      toggle.style.transform = 'rotate(90deg)'
    }

    toggle.addEventListener('click', () => {
      if (collapsed) {
        toggle.style.transform = 'rotate(0deg)'
      } else {
        toggle.style.transform = 'rotate(90deg)'
      }

      collapsed = !collapsed
    })

    return toggle
  }

  /**
   * Container for properties editing elements like property activators
   */
  getPropertiesSlot (config) {
    const html = document.createElement('dialog')
    html.classList.add('jedi-properties-slot')
    html.setAttribute('id', config.id)

    window.addEventListener('click', (event) => {
      if (event.target === html) {
        html.close()
      }
    })

    return html
  }

  /**
   * Container for properties editing elements like property activators
   */
  getJsonData (config) {
    // dialog
    const dialog = document.createElement('dialog')
    dialog.classList.add('jedi-json-data')
    dialog.setAttribute('id', config.id)

    window.addEventListener('click', (event) => {
      if (event.target === dialog) {
        dialog.close()
      }
    })

    // toggle
    const toggle = this.getButton({
      // content: config.propertiesToggleContent, // todo: use text config or something
      id: 'jedi-json-data-toggle-' + config.id,
      icon: 'edit'
    })

    toggle.classList.add('jedi-json-data-toggle')

    toggle.addEventListener('click', () => {
      if (dialog.open) {
        dialog.close()
      } else {
        dialog.showModal()
      }
    })

    const control = document.createElement('div')

    // label
    const { label } = this.getLabel({
      for: 'json-data-input-' + config.id,
      text: 'JSON Data'
    })

    // input
    const input = document.createElement('textarea')
    input.setAttribute('id', 'json-data-input-' + config.id)
    input.cols = 60
    input.style.whiteSpace = 'pre'
    input.style.overflowX = 'auto'
    input.style.resize = 'both'
    input.style.maxHeight = '60vh'

    // saveBtn
    const saveBtn = this.getButton({
      // content: config.propertiesToggleContent, // todo: use text config or something
      id: 'jedi-json-data-save-' + config.id,
      icon: 'save'
    })

    dialog.appendChild(control)
    control.appendChild(label)
    control.appendChild(input)
    dialog.appendChild(saveBtn)

    return {
      dialog,
      toggle,
      control,
      input,
      saveBtn
    }
  }

  /**
   * Container for screen reader announced messages
   */
  getPropertiesAriaLive () {
    const html = document.createElement('div')
    html.classList.add('jedi-properties-aria-live')
    html.setAttribute('role', 'status')
    html.setAttribute('aria-live', 'polite')
    return html
  }

  /**
   * A message that will be announced by screen reader
   */
  getAriaLiveMessage (message) {
    const html = document.createElement('p')
    html.classList.add('jedi-aria-live-message')
    html.textContent = message
    this.visuallyHidden(html)
    return html
  }

  /**
   * Wrapper for property activators
   */
  getPropertiesActivators () {
    const html = document.createElement('div')
    html.classList.add('jedi-properties-activators')
    return html
  }

  /**
   * Group for property activators
   */
  getPropertiesGroup (config = {}) {
    const container = document.createElement('div')
    container.classList.add('jedi-properties-group-container')

    const group = document.createElement('div')
    group.classList.add('jedi-properties-group')

    const name = document.createElement('p')
    name.classList.add('jedi-properties-group-name')
    name.textContent = config.name ?? ''

    container.appendChild(name)
    container.appendChild(group)
    return { container, group, name }
  }

  /**
   * Wrapper buttons
   */
  getBtnGroup () {
    const html = document.createElement('span')
    html.classList.add('jedi-btn-group')
    return html
  }

  /**
   * A button
   */
  getButton (config = {}) {
    const button = document.createElement('button')
    const text = document.createElement('span')
    const icon = document.createElement('i')

    button.classList.add('jedi-btn')
    button.setAttribute('type', 'button')

    if (config.value) {
      button.value = config.value
    }

    if (config.id) {
      button.setAttribute('id', config.id)
    }

    text.textContent = ' ' + config.content

    if (this.btnIcons && this.icons && config.icon) {
      this.addIconClass(icon, this.icons[config.icon])
      icon.setAttribute('title', config.content)
    }

    if (!this.btnContents) {
      this.visuallyHidden(text)
    }

    if (this.icons && config.icon) {
      button.appendChild(icon)
    }

    button.appendChild(text)

    return button
  }

  getAddPropertyButton (config) {
    const html = this.getButton(config)
    html.classList.add('jedi-add-property-btn')
    return html
  }

  /**
   * Array "add" item button
   */
  getArrayBtnAdd (config) {
    const html = this.getButton({
      content: config.content,
      icon: 'add'
    })
    html.classList.add('jedi-array-add')
    return html
  }

  /**
   * Array "delete" item button
   */
  getDeleteItemBtn (config) {
    const deleteItemBtn = this.getButton({
      content: config.content,
      icon: 'delete'
    })
    deleteItemBtn.classList.add('jedi-array-delete')
    return deleteItemBtn
  }

  /**
   * Array "move up" item button
   */
  getMoveUpItemBtn (config) {
    const moveUpItemBtn = this.getButton({
      content: config.content,
      icon: 'moveUp'
    })
    moveUpItemBtn.classList.add('jedi-array-move-up')
    return moveUpItemBtn
  }

  /**
   * Array "move down" item button
   */
  getMoveDownItemBtn (config) {
    const moveDownItemBtn = this.getButton({
      content: config.content,
      icon: 'moveDown'
    })
    moveDownItemBtn.classList.add('jedi-array-move-down')
    return moveDownItemBtn
  }

  getDragItemBtn (config) {
    const dragItemBtn = this.getButton({
      content: config.content,
      icon: 'drag'
    })
    dragItemBtn.classList.add('jedi-array-drag')
    return dragItemBtn
  }

  /**
   * Wrapper for the editor description
   */
  getDescription (config = {}) {
    const description = document.createElement('small')
    description.style.display = 'block'
    description.classList.add('jedi-description')

    if (config.content) {
      description.innerHTML = config.content
    }

    if (config.id) {
      description.setAttribute('id', config.id)
    }

    return description
  }

  /**
   * Info button to display extra information
   */
  getInfo (config = {}) {
    const container = document.createElement('span')
    const info = document.createElement('a')
    const infoText = document.createElement('span')
    const icon = document.createElement('i')

    container.classList.add('jedi-info-button-container')
    container.style.display = 'inline-block'

    info.setAttribute('href', '#')
    info.classList.add('jedi-info-button')
    info.style.marginLeft = '4px'

    if (isObject(config.attributes)) {
      for (const [key, value] of Object.entries(config.attributes)) {
        info.setAttribute(key, value)
      }
    }

    infoText.textContent = 'Info'

    if (!this.btnContents && this.btnIcons) {
      this.visuallyHidden(infoText)
    }

    icon.setAttribute('title', 'More information')

    if (this.icons) {
      this.addIconClass(icon, this.icons['info'])
    }

    info.appendChild(icon)
    info.appendChild(infoText)
    container.appendChild(info)

    return { container, info }
  }

  /**
   * Dialog or modal that contains extra information about the control
   */
  infoAsModal (info, id, config = {}) {
    const dialog = document.createElement('dialog')
    const title = document.createElement('div')
    const content = document.createElement('div')
    const closeBtn = this.getButton({
      content: 'Close',
      icon: 'close'
    })

    dialog.classList.add('jedi-modal-dialog')

    title.classList.add('jedi-modal-title')

    if (isString(config.title)) {
      title.innerHTML = config.title
    }

    content.classList.add('jedi-modal-content')

    if (isString(config.content)) {
      content.innerHTML = config.content
    }

    closeBtn.classList.add('jedi-modal-close')
    closeBtn.setAttribute('always-enabled', '')

    window.addEventListener('click', (event) => {
      if (event.target === dialog) {
        dialog.close()
      }
    })

    closeBtn.addEventListener('click', () => {
      dialog.close()
    })

    info.info.addEventListener('click', () => {
      dialog.showModal()
    })

    info.container.appendChild(dialog)
    dialog.appendChild(title)
    dialog.appendChild(content)
    dialog.appendChild(closeBtn)
  }

  getPlaceholderControl (config) {
    const descriptionId = config.id + '-description'
    const messagesId = config.id + '-messages'

    const container = document.createElement('div')
    const placeholder = document.createElement('div')
    const actions = this.getActionsSlot()
    const info = this.getInfo(config.info)
    const { label, labelText } = this.getLabel({
      for: config.id,
      text: config.title,
      visuallyHidden: config.titleHidden,
      titleIconClass: config.titleIconClass
    })
    const description = this.getDescription({
      content: config.description,
      id: descriptionId
    })
    const messages = this.getMessagesSlot({
      id: messagesId
    })

    if (config?.info?.variant === 'modal') {
      this.infoAsModal(info, config.id, config.info)
    }

    container.appendChild(label)

    if (isObject(config.info)) {
      label.appendChild(info.container)
    }

    container.appendChild(placeholder)
    container.appendChild(description)
    container.appendChild(messages)
    container.appendChild(actions)

    return { container, placeholder, label, labelText, description, messages, actions }
  }

  /**
   * Object control is a card containing multiple editors.
   * Each editor is mapped to an object instance property.
   * Properties can be added, activated and deactivated depending on configuration
   */
  getObjectControl (config) {
    const collapseId = 'collapse-' + config.id

    const container = document.createElement('div')
    const actions = this.getActionsSlot()
    const body = this.getCardBody()
    const ariaLive = this.getPropertiesAriaLive()
    const messages = this.getMessagesSlot()
    const childrenSlot = this.getChildrenSlot()
    const propertiesActivators = this.getPropertiesActivators()
    const info = this.getInfo(config.info)
    const description = this.getDescription({
      content: config.description
    })
    const jsonData = this.getJsonData({
      id: 'json-data-' + config.id
    })
    const propertiesContainer = this.getPropertiesSlot({
      id: 'properties-slot-' + config.id
    })
    const propertiesToggle = this.getPropertiesToggle({
      content: config.propertiesToggleContent,
      id: 'properties-slot-toggle-' + config.id,
      icon: 'properties',
      propertiesContainer: propertiesContainer
    })
    const collapse = this.getCollapse({
      id: collapseId,
      startCollapsed: config.startCollapsed
    })
    const collapseToggle = this.getCollapseToggle({
      content: config.collapseToggleContent,
      id: 'collapse-toggle-' + config.id,
      icon: 'collapse',
      collapseId: collapseId,
      collapse: collapse,
      startCollapsed: config.startCollapsed
    })
    const addPropertyControl = this.getInputControl({
      type: 'text',
      id: 'jedi-add-property-input-' + config.id,
      title: config.addPropertyContent
    })
    const addPropertyBtn = this.getAddPropertyButton({
      content: config.addPropertyContent,
      icon: 'add'
    })
    const fieldset = this.getFieldset()
    const { legend, infoContainer, legendText } = this.getLegend({
      content: config.title,
      id: config.id,
      titleHidden: config.titleHidden
    })

    if (config?.info?.variant === 'modal') {
      this.infoAsModal(info, config.id, config.info)
    }

    addPropertyBtn.classList.add('jedi-object-add')

    container.appendChild(fieldset)
    container.appendChild(propertiesContainer)

    if (config.editJsonData) {
      container.appendChild(jsonData.dialog)
    }

    fieldset.appendChild(legend)

    if (isObject(config.info)) {
      infoContainer.appendChild(info.container)
    }

    fieldset.appendChild(collapse)
    collapse.appendChild(body)

    if (config.description) {
      body.appendChild(description)
    }

    body.appendChild(messages)

    if (config.readOnly === false) {
      legend.appendChild(actions)
    }

    body.appendChild(childrenSlot)

    if (config.addProperty) {
      propertiesContainer.appendChild(addPropertyControl.container)
      propertiesContainer.appendChild(addPropertyBtn)
      propertiesContainer.appendChild(document.createElement('hr'))
    }

    if (config.editJsonData) {
      actions.appendChild(jsonData.toggle)
    }

    if (config.enablePropertiesToggle) {
      actions.appendChild(propertiesToggle)
      propertiesContainer.appendChild(ariaLive)
      propertiesContainer.appendChild(propertiesActivators)
    }

    if (config.enableCollapseToggle) {
      actions.appendChild(collapseToggle)
    }

    return {
      container,
      collapse,
      collapseToggle,
      description,
      body,
      actions,
      messages,
      childrenSlot,
      propertiesToggle,
      jsonData,
      propertiesContainer,
      addPropertyControl,
      addPropertyBtn,
      ariaLive,
      propertiesActivators,
      legend,
      legendText,
      infoContainer
    }
  }

  /**
   * Array control is a card containing multiple editors.
   * Items can bve added, deleted or moved up or down.
   */
  getArrayControl (config) {
    const collapseId = 'collapse-' + config.id

    const container = document.createElement('div')
    const actions = this.getActionsSlot()
    const body = this.getCardBody()
    const messages = this.getMessagesSlot()
    const childrenSlot = this.getChildrenSlot()
    const btnGroup = this.getBtnGroup()
    const addBtn = this.getArrayBtnAdd({
      content: config.arrayAddContent
    })

    const fieldset = this.getFieldset()
    const info = this.getInfo(config.info)
    const { legend, legendText, infoContainer } = this.getLegend({
      content: config.title,
      id: config.id,
      titleHidden: config.titleHidden
    })
    const description = this.getDescription({
      content: config.description
    })
    const jsonData = this.getJsonData({
      id: 'json-data-' + config.id
    })
    const collapse = this.getCollapse({
      id: collapseId,
      startCollapsed: config.startCollapsed
    })
    const collapseToggle = this.getCollapseToggle({
      content: config.collapseToggleContent,
      id: 'collapse-toggle-' + config.id,
      icon: 'collapse',
      collapseId: collapseId,
      collapse: collapse,
      startCollapsed: config.startCollapsed
    })

    if (config?.info?.variant === 'modal') {
      this.infoAsModal(info, config.id, config.info)
    }

    container.appendChild(fieldset)

    if (config.editJsonData) {
      container.appendChild(jsonData.dialog)
    }

    fieldset.appendChild(legend)

    if (isObject(config.info)) {
      infoContainer.appendChild(info.container)
    }

    fieldset.appendChild(collapse)
    collapse.appendChild(body)

    if (config.description) {
      body.appendChild(description)
    }

    body.appendChild(messages)

    legend.appendChild(actions)

    actions.appendChild(btnGroup)

    if (config.editJsonData) {
      btnGroup.appendChild(jsonData.toggle)
    }

    if (isSet(config.arrayAdd) && config.arrayAdd === true) {
      btnGroup.appendChild(addBtn)
    }

    body.appendChild(childrenSlot)

    if (config.enableCollapseToggle) {
      actions.appendChild(collapseToggle)
    }

    return {
      container,
      collapseToggle,
      collapse,
      body,
      actions,
      messages,
      childrenSlot,
      btnGroup,
      addBtn,
      jsonData,
      legend,
      legendText
    }
  }

  getArrayItem (config = {}) {
    const container = document.createElement('div')
    const body = document.createElement('div')
    const actions = this.getActionsSlot()
    const arrayActions = this.getArrayActionsSlot()

    actions.style.textAlign = 'right'

    container.classList.add('jedi-array-item')
    body.classList.add('jedi-array-item-body')

    if (isSet(config.index)) {
      container.setAttribute('jedi-array-item-index', config.index)
    }

    actions.appendChild(arrayActions)

    container.appendChild(actions)

    container.appendChild(body)

    return {
      container,
      actions,
      arrayActions,
      body
    }
  }

  /**
   * Multiple control is a card containing multiple editors options that can be
   * selected with a switcher control. Only one editor can be active/visible
   * at a time
   */
  getMultipleControl (config = {}) {
    const container = document.createElement('div')
    const header = document.createElement('div')
    const body = document.createElement('div')
    const messages = this.getMessagesSlot()
    const childrenSlot = this.getChildrenSlot()
    const randomId = generateRandomID(5)

    let switcher

    if (config.switcher === 'select') {
      switcher = this.getSwitcherSelect({
        values: config.switcherOptionValues,
        titles: config.switcherOptionsLabels,
        title: config.id + '-switcher',
        id: config.id + '-switcher' + '-' + randomId,
        label: config.id + '-switcher' + '-' + randomId,
        titleHidden: true,
        readOnly: config.readOnly
      })
    }

    if (config.switcher === 'radios' || config.switcher === 'radios-inline') {
      switcher = this.getSwitcherRadios({
        values: config.switcherOptionValues,
        titles: config.switcherOptionsLabels,
        title: config.id + '-switcher',
        id: config.id + '-switcher' + '-' + randomId,
        label: config.id + '-switcher' + '-' + randomId,
        titleHidden: true,
        readOnly: config.readOnly,
        inline: config.switcher === 'radios-inline'
      })
    }

    switcher.container.classList.add('jedi-switcher')

    container.appendChild(header)
    container.appendChild(body)
    header.appendChild(switcher.container)
    body.appendChild(messages)
    body.appendChild(childrenSlot)

    return {
      container,
      header,
      body,
      messages,
      childrenSlot,
      switcher
    }
  }

  adaptForTableMultipleControl (control, td) {
  }

  getIfThenElseControl (config) {
    const container = document.createElement('div')
    const card = this.getCard()
    const actions = this.getActionsSlot()
    const body = this.getCardBody()
    const messages = this.getMessagesSlot()
    const childrenSlot = this.getChildrenSlot()
    const header = this.getCardHeader({
      content: config.title,
      titleHidden: config.titleHidden
    })
    const description = this.getDescription({
      content: config.description
    })

    body.appendChild(description)
    container.appendChild(messages)
    container.appendChild(childrenSlot)

    return {
      container,
      card,
      header,
      body,
      actions,
      messages,
      childrenSlot
    }
  }

  /**
   * Control for NullEditor
   */
  getNullControl (config) {
    const descriptionId = config.id + '-description'

    const container = document.createElement('div')
    const actions = this.getActionsSlot()
    const messages = this.getMessagesSlot()
    const br = document.createElement('br')
    const info = this.getInfo(config.info)
    const { label, labelText } = this.getFakeLabel({
      for: config.id,
      content: config.title,
      visuallyHidden: config.titleHidden,
      titleIconClass: config.titleIconClass
    })
    const description = this.getDescription({
      content: config.description,
      id: descriptionId
    })

    if (config?.info?.variant === 'modal') {
      this.infoAsModal(info, config.id, config.info)
    }

    container.appendChild(label)

    if (isObject(config.info)) {
      label.appendChild(info.container)
    }

    container.appendChild(br)
    container.appendChild(description)
    container.appendChild(messages)
    container.appendChild(actions)

    return { container, label, labelText, description, messages, actions }
  }

  /**
   * A Textarea
   */
  getTextareaControl (config) {
    const descriptionId = config.id + '-description'
    const messagesId = config.id + '-messages'
    const describedBy = messagesId + ' ' + descriptionId

    const container = document.createElement('div')
    const actions = this.getActionsSlot()
    const input = document.createElement('textarea')
    const info = this.getInfo(config.info)
    const { label, labelText } = this.getLabel({
      for: config.id,
      text: config.title,
      visuallyHidden: config.titleHidden
    })
    const description = this.getDescription({
      content: config.description,
      id: descriptionId
    })
    const messages = this.getMessagesSlot({
      id: messagesId
    })

    input.setAttribute('aria-describedby', describedBy)
    input.setAttribute('id', config.id)
    input.setAttribute('name', config.id)
    input.style.width = '100%'

    if (config?.info?.variant === 'modal') {
      this.infoAsModal(info, config.id, config.info)
    }

    container.appendChild(label)

    if (isObject(config.info)) {
      label.appendChild(info.container)
    }

    container.appendChild(input)
    container.appendChild(description)
    container.appendChild(messages)
    container.appendChild(actions)

    return { container, input, label, labelText, description, messages, actions }
  }

  adaptForTableTextareaControl (control) {
    this.visuallyHidden(control.label)
    this.visuallyHidden(control.description)
    control.input.setAttribute('rows', '1')
  }

  /**
   * An Input control
   */
  getInputControl (config) {
    const messagesId = config.id + '-messages'
    const descriptionId = config.id + '-description'
    const describedBy = messagesId + ' ' + descriptionId

    const container = document.createElement('div')
    const actions = this.getActionsSlot()
    const input = document.createElement('input')
    const info = this.getInfo(config.info)
    const searchPanel = this.getSearchPanel()
    const { label, labelText } = this.getLabel({
      for: config.id,
      text: config.title,
      visuallyHidden: config.titleHidden,
      titleIconClass: config.titleIconClass
    })
    const description = this.getDescription({
      content: config.description,
      id: descriptionId
    })
    const messages = this.getMessagesSlot({
      id: messagesId
    })

    input.setAttribute('aria-describedby', describedBy)
    input.setAttribute('type', config.type)
    input.setAttribute('id', config.id)
    input.setAttribute('name', config.id)
    input.style.width = '100%'

    container.appendChild(label)

    if (config?.info?.variant === 'modal') {
      this.infoAsModal(info, config.id, config.info)
    }

    if (isObject(config.info)) {
      label.appendChild(info.container)
    }

    container.appendChild(input)
    container.appendChild(description)
    container.appendChild(messages)
    container.appendChild(actions)

    if (isObject(config.searchPanel)) {
      container.appendChild(searchPanel.container)
    }

    return { container, input, label, info, searchPanel, labelText, description, messages, actions }
  }

  getInputRangeControl (config) {
    const control = this.getInputControl(config)

    // Create output element to display current value
    const output = document.createElement('output')
    output.className = 'range-output'
    output.style.marginLeft = '10px'
    output.style.fontWeight = 'bold'

    // Insert output after the input
    control.input.parentNode.insertBefore(output, control.input.nextSibling)

    return { ...control, output }
  }

  adaptForTableInputControl (control) {
    this.visuallyHidden(control.label)
    this.visuallyHidden(control.description)
  }

  /**
   * A radio group control
   */
  getRadiosControl (config) {
    const messagesId = config.id + '-messages'
    const descriptionId = config.id + '-description'

    const container = document.createElement('div')
    const fieldset = this.getRadioFieldset()
    const info = this.getInfo(config.info)
    const { legend, legendText } = this.getRadioLegend({
      content: config.title,
      id: config.id,
      for: config.id
    })
    const messages = this.getMessagesSlot({
      id: messagesId
    })
    const description = this.getDescription({
      content: config.description,
      id: descriptionId
    })

    if (config?.info?.variant === 'modal') {
      this.infoAsModal(info, config.id, config.info)
    }

    if (config.titleHidden) {
      this.visuallyHidden(legend)
    }

    const radioControls = []
    const radios = []
    const labels = []
    const labelTexts = []

    config.values.forEach((value, index) => {
      const describedBy = messagesId + ' ' + descriptionId

      const radioControl = document.createElement('div')
      const radio = document.createElement('input')
      const label = document.createElement('label')
      const labelText = document.createElement('span')

      radio.setAttribute('type', 'radio')
      radio.setAttribute('id', config.id + '-' + index)
      radio.setAttribute('name', config.id)
      radio.setAttribute('value', value)
      radio.setAttribute('aria-describedby', describedBy)

      label.setAttribute('for', config.id + '-' + index)
      label.classList.add('jedi-title')
      label.classList.add('jedi-label')

      labelTexts.push(labelText)

      if (isSet(config.titles) && isSet(config.titles[index])) {
        labelText.textContent = config.titles[index] ?? value
      }

      radioControls.push(radioControl)
      radios.push(radio)
      labels.push(label)
    })

    container.appendChild(fieldset)
    fieldset.appendChild(legend)

    if (isObject(config.info)) {
      legendText.appendChild(info.container)
    }

    radioControls.forEach((radioControl, index) => {
      fieldset.appendChild(radioControls[index])
      radioControl.appendChild(radios[index])
      radioControl.appendChild(labels[index])
      labels[index].appendChild(labelTexts[index])
    })

    fieldset.appendChild(description)
    fieldset.appendChild(messages)

    return {
      container,
      fieldset,
      legend,
      legendText,
      info,
      radios,
      labels,
      labelTexts,
      radioControls,
      description,
      messages
    }
  }

  adaptForTableRadiosControl (control) {
    this.visuallyHidden(control.legend)
    this.visuallyHidden(control.description)
  }

  /**
   * A checkbox control
   */
  getCheckboxControl (config) {
    const descriptionId = config.id + '-description'
    const messagesId = config.id + '-messages'
    const describedBy = messagesId + ' ' + descriptionId

    const container = document.createElement('div')
    const actions = this.getActionsSlot()
    const formGroup = document.createElement('span')
    const input = document.createElement('input')
    const info = this.getInfo(config.info)
    const { label, labelText } = this.getLabel({
      for: config.id,
      text: config.title,
      visuallyHidden: config.titleHidden
    })
    const description = this.getDescription({
      content: config.description,
      id: descriptionId
    })
    const messages = this.getMessagesSlot({
      id: messagesId
    })

    input.setAttribute('type', 'checkbox')
    input.setAttribute('id', config.id)
    input.setAttribute('name', config.id)
    input.setAttribute('aria-describedby', describedBy)

    if (config?.info?.variant === 'modal') {
      this.infoAsModal(info, config.id, config.info)
    }

    container.appendChild(formGroup)
    container.appendChild(actions)
    formGroup.appendChild(input)
    formGroup.appendChild(label)

    if (isObject(config.info)) {
      label.appendChild(info.container)
    }

    formGroup.appendChild(description)
    formGroup.appendChild(messages)

    return { container, formGroup, input, label, info, labelText, description, messages, actions }
  }

  adaptForTableCheckboxControl (control, td) {
    this.visuallyHidden(control.label)
    this.visuallyHidden(control.description)
  }

  getCheckboxesControl (config) {
    const messagesId = config.id + '-messages'
    const descriptionId = config.id + '-description'

    const container = document.createElement('div')
    const fieldset = this.getRadioFieldset()
    const info = this.getInfo(config.info)
    const { legend, legendText } = this.getRadioLegend({
      content: config.title,
      id: config.id,
      for: config.id
    })
    const messages = this.getMessagesSlot({
      id: messagesId
    })
    const description = this.getDescription({
      content: config.description,
      id: descriptionId
    })

    if (config.titleHidden) {
      this.visuallyHidden(legend)
    }

    const checkboxControls = []
    const checkboxes = []
    const labels = []
    const labelTexts = []

    config.values.forEach((value, index) => {
      const describedBy = messagesId + ' ' + descriptionId
      const checkboxId = config.id + '-' + index

      const checkboxControl = document.createElement('div')
      const checkbox = document.createElement('input')
      const label = document.createElement('label')
      const labelText = document.createElement('span')

      checkbox.setAttribute('type', 'checkbox')
      checkbox.setAttribute('id', checkboxId)
      checkbox.setAttribute('name', config.id)
      checkbox.setAttribute('value', value)
      checkbox.setAttribute('aria-describedby', describedBy)

      label.setAttribute('for', checkboxId)

      if (config.titles && config.titles[index]) {
        labelText.textContent = config.titles[index]
      }

      checkboxControls.push(checkboxControl)
      checkboxes.push(checkbox)
      labelTexts.push(labelText)
      labels.push(label)
    })

    if (config?.info?.variant === 'modal') {
      this.infoAsModal(info, config.id, config.info)
    }

    container.appendChild(fieldset)
    fieldset.appendChild(legend)

    if (isObject(config.info)) {
      legendText.appendChild(info.container)
    }

    checkboxControls.forEach((checkboxControl, index) => {
      fieldset.appendChild(checkboxControls[index])
      checkboxControl.appendChild(checkboxes[index])
      checkboxControl.appendChild(labels[index])
      labels[index].appendChild(labelTexts[index])
    })

    fieldset.appendChild(description)
    fieldset.appendChild(messages)

    return {
      container,
      fieldset,
      legend,
      legendText,
      checkboxes,
      labels,
      labelTexts,
      checkboxControls,
      description,
      messages
    }
  }

  adaptForTableCheckboxesControl (control, td) {
    this.visuallyHidden(control.legend)
    this.visuallyHidden(control.description)
  }

  /**
   * A select control
   */
  getSelectControl (config) {
    const descriptionId = config.id + '-description'
    const messagesId = config.id + '-messages'
    const describedBy = messagesId + ' ' + descriptionId

    const container = document.createElement('div')
    const actions = this.getActionsSlot()
    const input = document.createElement('select')
    const info = this.getInfo(config.info)
    const { label, labelText } = this.getLabel({
      for: config.id,
      text: config.title,
      visuallyHidden: config.titleHidden
    })
    const messages = this.getMessagesSlot({
      id: messagesId
    })
    const description = this.getDescription({
      content: config.description,
      id: descriptionId
    })

    input.setAttribute('id', config.id)
    input.setAttribute('name', config.id)
    input.setAttribute('aria-describedby', describedBy)

    config.values.forEach((value, index) => {
      const option = document.createElement('option')
      option.setAttribute('value', value)

      if (config.titles && config.titles[index]) {
        option.textContent = config.titles[index]
      }

      input.appendChild(option)
    })

    if (config?.info?.variant === 'modal') {
      this.infoAsModal(info, config.id, config.info)
    }

    container.appendChild(label)

    if (isObject(config.info)) {
      label.appendChild(info.container)
    }

    container.appendChild(input)
    container.appendChild(description)
    container.appendChild(messages)
    container.appendChild(actions)

    return { container, input, label, info, labelText, description, messages, actions }
  }

  adaptForTableSelectControl (control) {
    this.visuallyHidden(control.label)
    this.visuallyHidden(control.description)
  }

  /**
   * Control to switch between multiple editors options
   */
  getSwitcherSelect (config) {
    return this.getSelectControl(config)
  }

  /**
   * Control to switch between multiple editors options
   */
  getSwitcherRadios (config) {
    return this.getRadiosControl(config)
  }

  /**
   * Another type of error message container used for more complex editors like
   * object, array and multiple editors
   */
  getAlert (config) {
    return this.getErrorFeedback(config)
  }

  /**
   * Error messages
   * @public
   */
  getErrorFeedback (config) {
    const html = document.createElement('div')
    const invalidFeedbackText = document.createElement('small')
    const invalidFeedbackIcon = document.createElement('span')

    invalidFeedbackText.textContent = config.message
    invalidFeedbackIcon.textContent = '⚠ '
    invalidFeedbackIcon.classList.add('jedi-error-message')
    invalidFeedbackIcon.setAttribute('aria-hidden', 'true')

    html.classList.add('jedi-error-message')

    html.appendChild(invalidFeedbackIcon)
    html.appendChild(invalidFeedbackText)
    return html
  }

  /**
   * Error messages
   * @public
   */
  getWarningFeedback (config) {
    const html = document.createElement('div')
    const invalidFeedbackText = document.createElement('small')
    const invalidFeedbackIcon = document.createElement('span')

    invalidFeedbackText.textContent = config.message
    invalidFeedbackIcon.textContent = '⚠ '
    invalidFeedbackIcon.classList.add('jedi-warning-message')
    invalidFeedbackIcon.setAttribute('aria-hidden', 'true')

    html.classList.add('jedi-warning-message')

    html.appendChild(invalidFeedbackIcon)
    html.appendChild(invalidFeedbackText)
    return html
  }

  /**
   * Container for columns
   */
  getRow () {
    const row = document.createElement('div')
    row.classList.add('jedi-row')
    return row
  }

  /**
   * A column to contain content to a specific width
   */
  getCol (xs, sm, md, lg, offsetMd) {
    const col = document.createElement('div')
    col.classList.add('jedi-col')
    col.classList.add('jedi-col-xs-' + xs)
    col.classList.add('jedi-col-sm-' + sm)
    col.classList.add('jedi-col-md-' + md)
    col.classList.add('jedi-col-lg-' + lg)

    if (offsetMd) {
      col.classList.add('jedi-col-md-offset-' + offsetMd)
    }

    return col
  }

  /**
   * Clearfix fixes layout issues in some libraries like bootstrap 3
   */
  getClearfix () {
    const clearfix = document.createElement('div')
    clearfix.classList.add('clearfix')
    return clearfix
  }

  /**
   * Tab list is a list of links that triggers tabs visibility ne at the time
   */
  getTabList () {
    const tabList = document.createElement('ul')
    tabList.classList.add('jedi-nav-list')
    return tabList
  }

  /**
   * A Tab is a wrapper for content
   */
  getTab (config) {
    const list = document.createElement('li')
    const link = document.createElement('a')
    const arrayActions = document.createElement('span')
    const text = document.createElement('span')
    link.classList.add('jedi-nav-link')
    link.setAttribute('href', '#' + 'tab-pane-' + config.id)
    text.classList.add('jedi-nav-text')
    text.textContent = config.hasErrors ? '⚠ ' + config.title : config.title
    link.appendChild(arrayActions)
    link.appendChild(text)
    list.appendChild(link)
    return { list, link, arrayActions, text }
  }

  /**
   * Wrapper for tabs
   */
  getTabContent () {
    const tabContent = document.createElement('div')
    tabContent.classList.add('tab-content')
    return tabContent
  }

  /**
   * A simple table layout
   */
  getTable () {
    const container = document.createElement('div')
    const table = document.createElement('table')
    const thead = document.createElement('thead')
    const tbody = document.createElement('tbody')

    table.appendChild(thead)
    table.appendChild(tbody)
    container.appendChild(table)

    return { container, table, thead, tbody }
  }

  /**
   * Returns a <td> element
   */
  getTableDefinition () {
    const td = document.createElement('td')
    td.style.whiteSpace = 'nowrap'
    return td
  }

  /**
   * Returns a <th> element
   */
  getTableHeader (config = {}) {
    const th = document.createElement('th')
    th.style.paddingLeft = '12px'
    th.style.paddingRight = '12px'
    th.style.textWrap = 'nowrap'
    th.style.verticalAlign = 'bottom'

    if (config.minWidth) {
      th.style.minWidth = config.minWidth
    }

    return th
  }

  /**
   * Set tab attributes to make it toggleable
   */
  setTabPaneAttributes (element, active, id) {
    element.setAttribute('id', 'tab-pane-' + id)
    element.classList.add('jedi-tab-pane')
  }

  /**
   * Creates a search panel with search input and results container
   */
  getSearchPanel () {
    const container = document.createElement('div')
    container.classList.add('jedi-search-container')

    const searchControl = document.createElement('input')
    searchControl.setAttribute('type', 'search')

    const resultsContainer = document.createElement('div')

    resultsContainer.style.display = 'flex'
    resultsContainer.style.flexWrap = 'wrap'
    resultsContainer.style.gap = '10px'
    resultsContainer.style.marginTop = '10px'

    container.appendChild(searchControl)
    container.appendChild(resultsContainer)

    return { container, searchControl, resultsContainer }
  }

  /**
   * Makes an element visually hidden
   */
  visuallyHidden (element) {
    element.style.position = 'absolute'
    element.style.width = '1px'
    element.style.height = '1px'
    element.style.padding = '0'
    element.style.margin = '-1px'
    element.style.overflow = 'hidden'
    element.style.clip = 'rect(0,0,0,0)'
    element.style.border = '0'
  }

  /**
   * Reveals a visually hidden element
   */
  visuallyVisible (element) {
    element.removeAttribute('style')
  }

  /**
   * Makes an element physically hidden
   */
  physicallyHidden (element) {
    element.style.display = 'none'
  }
}

export default Theme
