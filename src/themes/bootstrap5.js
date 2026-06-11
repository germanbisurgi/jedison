/* global MutationObserver */

import Theme from './theme.js'
import { isObject, isString } from '../helpers/utils.js'

/**
 * Represents a ThemeBootstrap5 instance.
 * @extends Theme
 */
class ThemeBootstrap5 extends Theme {
  init () {
    this.useToggleEvents = false
  }

  getAddPropertyButton (config) {
    const btn = super.getAddPropertyButton(config)
    btn.classList.add('btn-primary')
    btn.classList.add('w-100')
    return btn
  }

  getCollapseToggle (config) {
    const toggle = super.getCollapseToggle(config)
    toggle.setAttribute('href', '#' + config.collapseId)
    toggle.setAttribute('data-bs-toggle', 'collapse')
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

  getObjectControl (config) {
    const control = super.getObjectControl(config)

    if (config.isAccordion) {
      const { childrenSlot } = control
      const accordionId = childrenSlot.id
      const originalAppendChild = childrenSlot.appendChild.bind(childrenSlot)
      childrenSlot.appendChild = (child) => {
        const collapse = child.querySelector('.collapse')
        if (collapse) {
          collapse.classList.remove('show')
          collapse.setAttribute('data-bs-parent', '#' + accordionId)
        }
        return originalAppendChild(child)
      }
    }

    if (config.isAccordionProperties) {
      control.childrenSlot.classList.add('accordion', 'pb-3')
    }

    return control
  }

  _adaptHorizontalControl (control, labelCol, inputCol) {
    if (!control.label || control.label.classList.contains('col-form-label')) return
    const lc = labelCol ?? 3
    const ic = inputCol ?? 6
    control.container.classList.add('row')
    control.label.classList.add('col-form-label', 'text-sm-end', `col-sm-${lc}`)
    const wrapper = document.createElement('div')
    wrapper.classList.add(`col-sm-${ic}`)
    Array.from(control.container.children)
      .filter(el => el !== control.label)
      .forEach(el => wrapper.appendChild(el))
    control.container.appendChild(wrapper)
  }

  adaptForHorizontalInputControl (control, labelCol, inputCol) {
    this._adaptHorizontalControl(control, labelCol, inputCol)
  }

  adaptForHorizontalTextareaControl (control, labelCol, inputCol) {
    this._adaptHorizontalControl(control, labelCol, inputCol)
  }

  adaptForHorizontalSelectControl (control, labelCol, inputCol) {
    this._adaptHorizontalControl(control, labelCol, inputCol)
  }

  adaptForHorizontalCheckboxControl (control, labelCol, inputCol) {
    if (control.formGroup.parentElement !== control.container) return
    const lc = labelCol ?? 3
    const ic = inputCol ?? 6
    control.container.classList.add('row')
    const wrapper = document.createElement('div')
    wrapper.classList.add(`col-sm-${ic}`, `offset-sm-${lc}`)
    Array.from(control.container.children).forEach(el => wrapper.appendChild(el))
    control.container.appendChild(wrapper)
  }

  adaptForHorizontalRadiosControl (control, labelCol, inputCol) {
    if (control.legend.parentElement !== control.fieldset) return
    const lc = labelCol ?? 3
    const ic = inputCol ?? 6
    control.container.classList.add('row')
    control.legend.classList.add('col-form-label', 'text-sm-end', `col-sm-${lc}`)
    control.container.insertBefore(control.legend, control.fieldset)
    const wrapper = document.createElement('div')
    wrapper.classList.add(`col-sm-${ic}`)
    control.fieldset.replaceWith(wrapper)
    wrapper.appendChild(control.fieldset)
  }

  adaptForHorizontalCheckboxesControl (control, labelCol, inputCol) {
    this.adaptForHorizontalRadiosControl(control, labelCol, inputCol)
  }

  _adaptHorizontalComplexControl (control, labelCol, inputCol, title) {
    if (control.container.classList.contains('jedi-horizontal')) return
    const lc = labelCol ?? 3
    const ic = inputCol ?? 6
    const fakeLabel = document.createElement('label')
    fakeLabel.classList.add('col-form-label', 'text-sm-end', `col-sm-${lc}`)
    fakeLabel.textContent = title || ''
    const wrapper = document.createElement('div')
    wrapper.classList.add(`col-sm-${ic}`)
    Array.from(control.container.children).forEach(el => wrapper.appendChild(el))
    control.container.classList.add('row', 'jedi-horizontal')
    control.container.appendChild(fakeLabel)
    control.container.appendChild(wrapper)
    if (control.legendText) {
      control.legendText.style.display = 'none'
    }
  }

  adaptForHorizontalArrayControl (control, labelCol, inputCol, title) {
    this._adaptHorizontalComplexControl(control, labelCol, inputCol, title)
  }

  adaptForHorizontalObjectControl (control, labelCol, inputCol, title) {
    this._adaptHorizontalComplexControl(control, labelCol, inputCol, title)
  }

  adaptForHorizontalMultipleControl (control, labelCol, inputCol, title) {
    this._adaptHorizontalComplexControl(control, labelCol, inputCol, title)
  }

  getAccordionItem (config) {
    const collapseId = config.id + '-acc-collapse'

    const container = document.createElement('div')
    container.classList.add('accordion-item')

    const header = document.createElement('h2')
    header.classList.add('accordion-header')

    const toggle = document.createElement('button')
    toggle.type = 'button'
    toggle.classList.add('accordion-button', 'collapsed')
    toggle.setAttribute('data-bs-toggle', 'collapse')
    toggle.setAttribute('data-bs-target', '#' + collapseId)
    toggle.setAttribute('data-bs-parent', '#' + config.accordionId)
    // Remove Bootstrap's default right-side chevron via injected style (::after can't be targeted via JS)
    toggle.classList.add('jedi-accordion-button')
    if (!document.getElementById('jedi-accordion-button-style')) {
      const style = document.createElement('style')
      style.id = 'jedi-accordion-button-style'
      style.textContent = '.jedi-accordion-button::after { display: none !important; }'
      document.head.appendChild(style)
    }

    const chevron = document.createElement('i')
    chevron.classList.add('jedi-accordion-chevron')
    if (this.icons && this.icons['collapse']) {
      this.addIconClass(chevron, this.icons['collapse'])
    } else {
      chevron.textContent = '▾'
    }
    chevron.classList.add('d-inline-block', 'me-2')
    chevron.style.transition = 'transform 0.1s ease'

    toggle.appendChild(chevron)
    toggle.appendChild(document.createTextNode(config.title))

    const collapse = document.createElement('div')
    collapse.id = collapseId
    collapse.classList.add('accordion-collapse', 'collapse')
    collapse.setAttribute('data-bs-parent', '#' + config.accordionId)

    const syncState = () => {
      const collapsed = toggle.classList.contains('collapsed')
      chevron.style.transform = collapsed ? 'rotate(-90deg)' : 'rotate(0deg)'
    }

    syncState()

    new MutationObserver(syncState).observe(toggle, { attributes: true, attributeFilter: ['class'] })

    const body = document.createElement('div')
    body.classList.add('accordion-body', 'pb-3')

    header.appendChild(toggle)
    collapse.appendChild(body)
    container.appendChild(header)
    container.appendChild(collapse)

    return { container, header, toggle, collapse, body }
  }

  getJsonData (config) {
    const jsonData = super.getJsonData(config)
    jsonData.control.classList.add('mb-3')
    jsonData.input.classList.add('form-control')
    jsonData.copyBtn.classList.add('btn-secondary')
    jsonData.copyBtn.classList.add('w-100')
    jsonData.saveBtn.classList.add('btn-primary')
    jsonData.saveBtn.classList.add('w-100')
    return jsonData
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
    const { legend, infoContainer } = superLegend
    legend.classList.add('card-header')
    legend.classList.add('d-flex')
    legend.classList.add('justify-content-between')
    legend.classList.add('align-items-center')
    legend.classList.add('py-2')
    infoContainer.classList.add('me-1')
    return superLegend
  }

  styleLegendWarning (span) {
    span.classList.add('me-1')
  }

  getLabel (config) {
    const labelObj = super.getLabel(config)
    labelObj.label.classList.add('mb-1')
    return labelObj
  }

  getInfo (config = {}) {
    const info = super.getInfo(config)
    info.container.classList.add('me-1')
    return info
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

  getArrayFooter () {
    const footer = super.getArrayFooter()
    footer.classList.add('card-footer')
    return footer
  }

  getControlSlot () {
    const controlSlot = super.getControlSlot()
    controlSlot.classList.add('mb-3')
    return controlSlot
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
    description.classList.add('mb-1')
    return description
  }

  getPropertiesGroup (config = {}) {
    const propertiesGroup = super.getPropertiesGroup(config)
    propertiesGroup.group.classList.add('ps-3')
    propertiesGroup.container.classList.add('mb-4')
    return propertiesGroup
  }

  getTextareaControl (config) {
    const control = super.getTextareaControl(config)
    const { container, input, label } = control
    container.classList.add('mb-3')
    input.classList.add('form-control')

    if (config.titleHidden) {
      this.visuallyHidden(label)
    }

    return control
  }

  adaptForTableTextareaControl (control) {
    super.adaptForTableTextareaControl(control)
    control.container.classList.remove('mb-3')
  }

  getInputControl (config) {
    const control = super.getInputControl(config)
    const { container, input, label } = control
    container.classList.add('mb-3')
    input.classList.add('form-control')

    if (config.titleHidden) {
      this.visuallyHidden(label)
    }

    return control
  }

  getInputRangeControl (config) {
    const control = super.getInputRangeControl(config)
    const { container, input, label } = control

    container.classList.add('mb-3')
    input.classList.add('form-range')
    input.classList.remove('form-control')

    if (config.titleHidden) {
      this.visuallyHidden(label)
    }

    return control
  }

  adaptForTableInputControl (control, td) {
    super.adaptForTableInputControl(control, td)
    control.container.classList.remove('mb-3')
  }

  getRadiosControl (config) {
    const control = super.getRadiosControl(config)
    const { container, fieldset, radios, labels, labelTexts, radioControls, description, messages } = control

    if (!config.noSpacing) {
      container.classList.add('mb-3')
    }

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
    control.container.classList.remove('mb-3')
    control.fieldset.classList.remove('card')
    control.fieldset.classList.add('mb-0')
  }

  getCheckboxesControl (config) {
    const control = super.getCheckboxesControl(config)
    const { checkboxes, labels, checkboxControls } = control

    checkboxControls.forEach((checkboxControl, index) => {
      checkboxControl.classList.add('mb-3')
      checkboxControl.classList.add('form-check')
      checkboxes[index].classList.add('form-check-input')
      labels[index].classList.add('form-check-label')

      if (config.inline) {
        checkboxControl.classList.add('form-check-inline')
      }
    })

    return control
  }

  getCheckboxControl (config) {
    const control = super.getCheckboxControl(config)
    const { container, formGroup, input, label, info, description, messages } = control
    container.classList.add('mb-3')
    formGroup.classList.add('form-check')
    input.classList.add('form-check-input')
    label.classList.add('form-check-label')

    if (config.titleHidden) {
      this.visuallyHidden(label)
    }

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
    control.container.classList.remove('mb-3')
    control.formGroup.classList.remove('form-check')
  }

  getSelectControl (config) {
    const control = super.getSelectControl(config)
    const { container, input } = control

    if (!config.noSpacing) {
      container.classList.add('mb-3')
    }

    input.classList.add('form-select')
    return control
  }

  adaptForTableSelectControl (control, td) {
    super.adaptForTableSelectControl(control, td)
    control.container.classList.remove('mb-3')
  }

  getSwitcherSelect (config) {
    const control = super.getSwitcherSelect(config)
    control.input.classList.add('form-select-sm')
    return control
  }

  getSwitcherModal (config) {
    const control = super.getSwitcherModal(config)
    control.trigger.classList.add('badge', 'bg-primary')
    control.dialogBody.classList.add('btn-group', 'btn-group-vertical', 'w-100')
    control.optionButtons.forEach(btn => {
      btn.classList.add('btn', 'btn-light')
    })
    return control
  }

  setSwitcherOptionActive (btn, active) {
    super.setSwitcherOptionActive(btn, active)
    btn.classList.toggle('btn-primary', active)
    btn.classList.toggle('btn-light', !active)
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
    html.classList.add('d-block')
    html.classList.add('form-text')
    return html
  }

  getWarningFeedback (config) {
    const html = super.getWarningFeedback(config)
    html.classList.add('text-warning')
    html.classList.add('d-block')
    html.classList.add('form-text')
    return html
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
    const tabList = super.getTabList(config)
    tabList.classList.add('nav')
    tabList.classList.add('mb-3')

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
    // tab.list.classList.add('mb-3')
    tab.link.classList.add('nav-link')

    // Flex layout on <a>: [arrayActions] [text] [warning]
    tab.link.classList.add('d-flex', 'align-items-center')

    // Left: action buttons — don't shrink or wrap
    tab.arrayActions.classList.add('flex-shrink-0', 'text-nowrap')

    // Middle: text fills remaining space, can wrap
    tab.text.classList.add('flex-grow-1', 'mx-2')

    // Right: move warning from inside text to end of link
    if (config.hasErrors) {
      const warning = tab.text.querySelector('.jedi-nav-warning')
      if (warning) {
        tab.text.removeChild(warning)
        warning.classList.add('flex-shrink-0', 'text-nowrap')
        tab.link.appendChild(warning)
      }
    }

    tab.link.setAttribute('data-bs-toggle', 'tab')

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
    element.classList.toggle('active', active)
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
    closeBtn.setAttribute('data-bs-dismiss', 'modal')
    closeBtn.setAttribute('always-enabled', '')
    info.info.setAttribute('data-bs-toggle', 'modal')
    info.info.setAttribute('data-bs-target', '#' + modalId)
    modal.classList.add('modal')
    modal.classList.add('fade')
    modalDialog.classList.add('modal-dialog')
    modalContent.classList.add('modal-content')
    modalHeader.classList.add('modal-header')
    modalTitle.classList.add('modal-title')
    modalBody.classList.add('modal-body')
    closeBtn.classList.add('jedi-modal-close')

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
    element.classList.add('visually-hidden')
  }

  visuallyVisible (element) {
    element.classList.remove('visually-hidden')
  }
}

export default ThemeBootstrap5
