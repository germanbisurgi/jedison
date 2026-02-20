import Theme from './theme.js'
import { isString } from '../helpers/utils.js'

/**
 * Represents a ThemeBootstrap3 instance.
 * @extends Theme
 */
class ThemeBootstrap3 extends Theme {
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
      collapse.classList.add('in')
    }

    return collapse
  }

  getJsonData (config) {
    const jsonData = super.getJsonData(config)
    jsonData.control.classList.add('form-group')
    jsonData.input.classList.add('form-control')
    jsonData.saveBtn.classList.add('btn-primary')
    jsonData.saveBtn.classList.add('btn-block')
    return jsonData
  }

  getFieldset () {
    const fieldset = super.getFieldset()
    fieldset.classList.add('panel')
    fieldset.classList.add('panel-default')
    fieldset.style.marginBottom = '15px'
    return fieldset
  }

  getLegend (config) {
    const superLegend = super.getLegend(config)
    const { legend } = superLegend
    legend.classList.add('panel-heading')
    legend.classList.add('pull-left')
    legend.style.margin = '0'
    legend.style.display = 'flex'
    legend.style.justifyContent = 'space-between'
    legend.style.alignItems = 'center'
    return superLegend
  }

  getRadioLegend (config) {
    const superRadioLegend = super.getRadioLegend(config)
    const { legend } = superRadioLegend
    legend.style.fontWeight = 'inherit'
    legend.style.border = 'none'
    legend.style.marginBottom = '0'
    return superRadioLegend
  }

  getLabel (config) {
    const labelObj = super.getLabel(config)

    if (labelObj.icon.classList) {
      labelObj.icon.style.marginRight = '5px'
    }

    return labelObj
  }

  getCard () {
    const card = super.getCard()
    card.classList.add('panel')
    card.classList.add('panel-default')
    return card
  }

  getCardHeader (config) {
    const header = super.getCardHeader(config)
    header.classList.add('panel-heading')
    header.classList.add('text-right')
    return header
  }

  getCardBody () {
    const html = super.getCardBody()
    html.classList.add('panel-body')
    html.style.clear = 'both'
    html.style.paddingBottom = '0'
    return html
  }

  getBtnGroup () {
    const html = super.getBtnGroup()
    html.classList.add('btn-group')
    html.style.display = 'inline-flex'
    return html
  }

  getButton (config) {
    const html = super.getButton(config)
    html.classList.add('btn')
    html.classList.add('btn-xs')
    html.classList.add('btn-default')
    return html
  }

  getDescription (config) {
    const description = super.getDescription(config)
    description.classList.add('text-muted')
    description.style.marginBottom = '5px'
    return description
  }

  getPropertiesGroup (config = {}) {
    const propertiesGroup = super.getPropertiesGroup(config)
    const br = document.createElement('br')
    propertiesGroup.container.appendChild(br)
    propertiesGroup.group.classList.add('pl-3')
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
    return super.getInputRangeControl(config)
  }

  adaptForTableInputControl (control, td) {
    super.adaptForTableInputControl(control, td)
    control.container.classList.remove('form-group')
  }

  getRadiosControl (config) {
    const control = super.getRadiosControl(config)
    const { fieldset, radios, labels, labelTexts, radioControls, description, messages } = control

    radioControls.forEach((radioControl, index) => {
      radioControl.classList.add('radio')

      if (config.inline) {
        radioControl.style.display = 'inline-flex'
        radioControl.style.alignItems = 'center'
        radioControl.style.paddingLeft = '0'
        radioControl.style.marginRight = '15px'
      }

      fieldset.appendChild(radioControls[index])
      radioControl.appendChild(labels[index])
      labels[index].appendChild(radios[index])
      labels[index].appendChild(labelTexts[index])
    })

    fieldset.appendChild(description)
    fieldset.appendChild(messages)

    return control
  }

  adaptForTableRadiosControl (control, td) {
    super.adaptForTableRadiosControl(control, td)
    control.fieldset.classList.remove('panel')
    control.fieldset.classList.remove('panel-default')
    control.fieldset.style.marginBottom = '0'
  }

  getCheckboxesControl (config) {
    const control = super.getCheckboxesControl(config)
    const { fieldset, checkboxes, labels, labelTexts, checkboxControls } = control

    checkboxControls.forEach((checkboxControl, index) => {
      checkboxControl.classList.add('checkbox')

      if (config.inline) {
        checkboxControl.style.display = 'inline-flex'
        checkboxControl.style.alignItems = 'center'
        checkboxControl.style.paddingLeft = '0'
        checkboxControl.style.marginRight = '30px'
      }

      fieldset.appendChild(checkboxControls[index])
      checkboxControl.appendChild(labels[index])
      labels[index].appendChild(checkboxes[index])
      labels[index].appendChild(labelTexts[index])
    })

    return control
  }

  adaptForTableCheckboxesControl (control, td) {
    super.adaptForTableCheckboxesControl(control, td)
    control.fieldset.classList.remove('panel')
    control.fieldset.classList.remove('panel-default')
    control.body.classList.remove('panel-body')
  }

  getCheckboxControl (config) {
    const control = super.getCheckboxControl(config)
    const { container, formGroup, description, messages } = control

    container.appendChild(formGroup)
    container.appendChild(description)
    container.appendChild(messages)
    return control
  }

  adaptForTableCheckboxControl (control, td) {
    super.adaptForTableCheckboxControl(control, td)
  }

  getSelectControl (config) {
    const control = super.getSelectControl(config)
    const { container, input, label } = control
    container.classList.add('form-group')
    input.classList.add('form-control')

    if (config.titleHidden) {
      this.visuallyHidden(label)
    }

    return control
  }

  adaptForTableSelectControl (control, td) {
    super.adaptForTableSelectControl(control, td)
    control.container.classList.remove('form-group')
  }

  adaptForTableMultipleControl (control, td) {
    super.adaptForTableMultipleControl(control, td)
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
    return html
  }

  getWarningFeedback (config) {
    const html = super.getWarningFeedback(config)
    html.classList.add('text-warning')
    return html
  }

  getRow () {
    const row = super.getRow()
    row.classList.add('row')
    return row
  }

  getCol (xs, sm, md, lg, offsetMd) {
    const col = super.getCol()
    col.classList.add('col-xs-' + xs)
    col.classList.add('col-sm-' + sm)
    col.classList.add('col-md-' + md)
    col.classList.add('col-lg-' + lg)

    if (offsetMd) {
      col.classList.add('col-md-offset-' + offsetMd)
    }

    return col
  }

  getTabList (config) {
    const tabList = super.getTabList(config)
    tabList.classList.add('nav')
    tabList.style.marginBottom = '1rem'

    if (config.variant === 'horizontal') {
      tabList.classList.add('nav-tabs')
    } else {
      tabList.classList.add('nav-pills')
      tabList.classList.add('nav-stacked')
    }

    return tabList
  }

  getTab (config) {
    const tab = super.getTab(config)

    // Flex layout on <a>: [arrayActions] [text] [warning]
    tab.link.style.display = 'flex'
    tab.link.style.alignItems = 'center'

    // Left: action buttons — don't shrink or wrap
    tab.arrayActions.style.flexShrink = '0'
    tab.arrayActions.style.whiteSpace = 'nowrap'

    // Middle: text fills remaining space, can wrap
    tab.text.style.flex = '1'
    tab.text.style.marginLeft = '5px'
    tab.text.style.marginRight = '5px'

    // Right: move warning from inside text to end of link
    if (config.hasErrors) {
      const warning = tab.text.querySelector('.jedi-nav-warning')
      if (warning) {
        tab.text.removeChild(warning)
        warning.style.flexShrink = '0'
        warning.style.whiteSpace = 'nowrap'
        tab.link.appendChild(warning)
      }
    }

    if (config.active) {
      tab.list.classList.add('active')
    }

    tab.link.setAttribute('data-toggle', 'tab')
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

    table.appendChild(thead)
    table.appendChild(tbody)
    container.appendChild(table)

    return { container, table, thead, tbody }
  }

  setTabPaneAttributes (element, active, id) {
    super.setTabPaneAttributes(element, active, id)
    element.classList.add('tab-pane')

    if (active) {
      element.classList.add('in')
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
    modalHeader.appendChild(closeBtn)
    modalHeader.appendChild(modalTitle)
    modalContent.appendChild(modalBody)
  }

  visuallyHidden (element) {
    element.classList.add('sr-only')
  }

  visuallyVisible (element) {
    element.classList.remove('sr-only')
  }
}

export default ThemeBootstrap3
