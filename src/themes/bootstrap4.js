import Theme from './theme.js'
import { isObject, isString } from '../helpers/utils.js'

/**
 * Represents a ThemeBootstrap4 instance.
 * @extends Theme
 */
class ThemeBootstrap4 extends Theme {
  init () {
    this.useToggleEvents = false
  }

  getAddPropertyButton (config) {
    const btn = super.getAddPropertyButton(config)
    btn.classList.add('btn-primary')
    btn.classList.add('btn-block')
    return btn
  }

  getCollapseToggle (config) {
    const toggle = super.getCollapseToggle(config)
    toggle.setAttribute('href', '#' + config.collapseId)
    toggle.setAttribute('data-toggle', 'collapse')
    toggle.setAttribute('always-enabled', '')
    return toggle
  }

  getCollapse (config) {
    const collapse = super.getCollapse(config)
    collapse.classList.add('collapse')

    if (!config.startCollapsed) {
      collapse.classList.add('show')
    }

    return collapse
  }

  getFieldset () {
    const fieldset = document.createElement('fieldset')
    fieldset.setAttribute('role', 'group')
    fieldset.classList.add('card')
    fieldset.classList.add('mb-3')
    return fieldset
  }

  getLegend (config) {
    const superLegend = super.getLegend(config)
    const { legend } = superLegend
    legend.classList.add('card-header')
    legend.classList.add('d-flex')
    legend.classList.add('justify-content-between')
    legend.classList.add('align-items-center')
    legend.classList.add('float-left')
    legend.classList.add('py-2')
    return superLegend
  }

  getLabel (config) {
    const labelObj = super.getLabel(config)

    if (labelObj.icon.classList) {
      labelObj.icon.classList.add('mr-1')
    }

    return labelObj
  }

  getCard () {
    const card = super.getCard()
    card.classList.add('card')
    card.classList.add('mb-3')
    return card
  }

  getCardHeader (config) {
    const html = super.getCardHeader(config)
    html.classList.add('card-header')
    html.classList.add('d-flex')
    html.classList.add('justify-content-end')
    html.classList.add('align-items-center')
    html.classList.add('py-1')
    return html
  }

  getCardBody () {
    const html = super.getCardBody()
    html.classList.add('card-body')
    html.classList.add('pb-0')
    return html
  }

  getBtnGroup () {
    const html = super.getBtnGroup()
    html.classList.add('btn-group')
    return html
  }

  getButton (config) {
    const html = super.getButton(config)
    html.classList.add('btn')
    html.classList.add('btn-sm')
    return html
  }

  getDescription (config) {
    const description = super.getDescription(config)
    description.classList.add('text-muted')
    description.classList.add('fs-sm')
    description.classList.add('mb-1')
    return description
  }

  getPropertiesGroup (config = {}) {
    const propertiesGroup = super.getPropertiesGroup(config)
    propertiesGroup.group.classList.add('pl-3')
    propertiesGroup.name.classList.add('mb-3')
    propertiesGroup.container.classList.add('mb-4')
    return propertiesGroup
  }

  getTextareaControl (config) {
    const control = super.getTextareaControl(config)
    const { container, input, label } = control
    container.classList.add('form-group')
    input.classList.add('form-control')

    if (config.titleHidden) {
      this.visuallyHidden(label)
    }

    return control
  }

  adaptForTableTextareaControl (control) {
    super.adaptForTableTextareaControl(control)
    control.container.classList.remove('form-group')
  }

  getInputControl (config) {
    const control = super.getInputControl(config)
    const { container, input, label } = control
    container.classList.add('form-group')
    input.classList.add('form-control')

    if (config.titleHidden) {
      this.visuallyHidden(label)
    }

    return control
  }

  getInputRangeControl (config) {
    const control = super.getInputRangeControl(config)
    const { container, input, label } = control

    container.classList.add('form-group')
    input.classList.add('custom-range')
    input.classList.remove('form-control')

    if (config.titleHidden) {
      this.visuallyHidden(label)
    }

    return control
  }

  adaptForTableInputControl (control, td) {
    super.adaptForTableInputControl(control, td)
    control.container.classList.remove('form-group')
  }

  getRadiosControl (config) {
    const control = super.getRadiosControl(config)
    const { container, fieldset, radios, labels, labelTexts, radioControls, description, messages } = control

    container.classList.add('form-group')

    radioControls.forEach((radioControl, index) => {
      radioControl.classList.add('form-check')
      radios[index].classList.add('form-check-input')
      labels[index].classList.add('form-check-label')

      if (config.inline) {
        radioControl.classList.add('form-check-inline')
      }

      fieldset.appendChild(radioControls[index])
      radioControl.appendChild(radios[index])
      radioControl.appendChild(labels[index])
      labels[index].appendChild(labelTexts[index])
    })

    fieldset.appendChild(description)
    fieldset.appendChild(messages)

    return control
  }

  adaptForTableRadiosControl (control, td) {
    super.adaptForTableRadiosControl(control, td)
    control.container.classList.remove('form-group')
    control.fieldset.classList.remove('card')
    control.fieldset.style.marginBottom = '0'
  }

  getCheckboxesControl (config) {
    const control = super.getCheckboxesControl(config)
    const { checkboxes, labels, checkboxControls } = control

    checkboxControls.forEach((checkboxControl, index) => {
      checkboxControl.classList.add('form-group')
      checkboxControl.classList.add('form-check')
      checkboxes[index].classList.add('form-check-input')
      labels[index].classList.add('form-check-label')

      if (config.inline) {
        checkboxControl.classList.add('form-check-inline')
      }
    })

    return control
  }

  adaptForTableCheckboxesControl (control, td) {
    super.adaptForTableCheckboxesControl(control, td)
    control.container.classList.remove('form-group')
    control.fieldset.classList.remove('card')
    control.fieldset.classList.remove('mb-3')
    control.body.classList.remove('card-body')

    control.body.classList.remove('card-body')
  }

  getCheckboxControl (config) {
    const control = super.getCheckboxControl(config)
    const { container, formGroup, input, label, info, description, messages } = control
    container.classList.add('form-group')
    formGroup.classList.add('form-check')
    input.classList.add('form-check-input')
    label.classList.add('form-check-label')

    container.appendChild(formGroup)
    formGroup.appendChild(input)
    formGroup.appendChild(label)

    if (isObject(config.info)) {
      label.appendChild(info.container)
    }

    container.appendChild(description)
    container.appendChild(messages)
    return control
  }

  adaptForTableCheckboxControl (control, td) {
    super.adaptForTableCheckboxControl(control, td)
    control.container.classList.remove('form-group')
    control.formGroup.classList.remove('form-check')
    control.input.classList.remove('form-check-input')
    control.label.classList.remove('form-check-label')
  }

  getSelectControl (config) {
    const control = super.getSelectControl(config)
    const { container, input } = control
    container.classList.add('form-group')
    input.classList.add('form-control')
    return control
  }

  adaptForTableSelectControl (control, td) {
    super.adaptForTableSelectControl(control, td)
    control.container.classList.remove('form-group')
  }

  adaptForTableMultipleControl (control, td) {
    super.adaptForTableMultipleControl(control, td)
    control.container.classList.remove('mb-3')
  }

  getAlert (config) {
    const html = super.getAlert(config)
    html.classList.add('alert')
    html.classList.add('alert-danger')
    return html
  }

  getErrorFeedback (config) {
    const html = super.getErrorFeedback(config)
    html.classList.add('text-danger')
    html.classList.add('form-text')
    html.classList.add('d-block')
    return html
  }

  getWarningFeedback (config) {
    const html = super.getWarningFeedback(config)
    html.classList.add('text-warning')
    html.classList.add('form-text')
    html.classList.add('d-block')
    return html
  }

  getColumnClass (size, cols) {
    return 'col-' + size + '-' + cols
  }

  getRow () {
    const row = super.getRow()
    row.classList.add('row')
    return row
  }

  getCol (xs, sm, md, lg, offsetMd) {
    const col = super.getCol(xs, md, offsetMd)
    col.classList.add('col-' + xs)
    col.classList.add('col-sm' + sm)
    col.classList.add('col-md-' + md)
    col.classList.add('col-lg-' + lg)

    if (offsetMd) {
      col.classList.add('offset-md-' + offsetMd)
    }

    return col
  }

  getTabList (config) {
    const tabList = super.getTabList()
    tabList.classList.add('nav')

    if (config.variant === 'horizontal') {
      tabList.classList.add('nav-tabs')
    } else {
      tabList.classList.add('nav-pills')
      tabList.classList.add('flex-column')
    }

    return tabList
  }

  getTab (config) {
    const tab = super.getTab(config)
    tab.list.classList.add('nav-item')
    tab.list.classList.add('mb-3')
    tab.text.classList.add('ml-3')
    tab.link.classList.add('nav-link')
    tab.link.setAttribute('data-toggle', 'tab')

    if (config.active) {
      tab.link.classList.add('active')
    }

    return tab
  }

  /**
   * A simple table layout
   */
  getTable () {
    const container = document.createElement('div')
    const table = document.createElement('table')
    const thead = document.createElement('thead')
    const tbody = document.createElement('tbody')

    container.classList.add('table-responsive')
    table.classList.add('table')
    table.classList.add('table-borderless')
    table.classList.add('table-sm')
    table.classList.add('align-middle')

    table.appendChild(thead)
    table.appendChild(tbody)
    container.appendChild(table)

    return { container, table, thead, tbody }
  }

  setTabPaneAttributes (element, active, id) {
    super.setTabPaneAttributes(element, active, id)
    element.classList.add('tab-pane')

    if (active) {
      element.classList.add('active')
    }
  }

  infoAsModal (info, id, config = {}) {
    const modal = document.createElement('div')
    const modalDialog = document.createElement('div')
    const modalContent = document.createElement('div')
    const modalHeader = document.createElement('div')
    const modalTitle = document.createElement('div')
    const modalBody = document.createElement('div')
    const closeBtn = this.getButton({
      content: 'Close',
      icon: 'close'
    })
    const modalId = id + '-modal'

    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-modal', 'true')
    modal.setAttribute('id', modalId)
    closeBtn.setAttribute('data-dismiss', 'modal')
    closeBtn.setAttribute('always-enabled', '')
    info.info.setAttribute('data-toggle', 'modal')
    info.info.setAttribute('data-target', '#' + modalId)
    info.container.classList.add('ml-1')
    modal.classList.add('modal')
    modal.classList.add('fade')
    modalDialog.classList.add('modal-dialog')
    modalContent.classList.add('modal-content')
    modalHeader.classList.add('modal-header')
    modalTitle.classList.add('modal-title')
    modalBody.classList.add('modal-body')
    closeBtn.classList.add('jedi-modal-close')
    closeBtn.classList.add('close')

    if (isString(config.title)) {
      modalTitle.innerHTML = config.title
    }

    if (isString(config.content)) {
      modalBody.innerHTML = config.content
    }

    info.container.appendChild(modal)
    modal.appendChild(modalDialog)
    modalDialog.appendChild(modalContent)
    modalContent.appendChild(modalHeader)
    modalHeader.appendChild(modalTitle)
    modalHeader.appendChild(closeBtn)
    modalContent.appendChild(modalBody)
  }

  visuallyHidden (element) {
    element.classList.add('sr-only')
  }

  visuallyVisible (element) {
    element.classList.remove('sr-only')
  }
}

export default ThemeBootstrap4
