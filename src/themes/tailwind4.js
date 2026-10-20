import Theme from './theme.js'
import { isObject } from '../helpers/utils.js'

// Tailwind only generates classes it finds as complete strings in scanned
// files, so these lookups spell every class out instead of building them.
const COL_SPAN = [
  null,
  'col-span-1',
  'col-span-2',
  'col-span-3',
  'col-span-4',
  'col-span-5',
  'col-span-6',
  'col-span-7',
  'col-span-8',
  'col-span-9',
  'col-span-10',
  'col-span-11',
  'col-span-12'
]
const SM_COL_SPAN = [
  null,
  'sm:col-span-1',
  'sm:col-span-2',
  'sm:col-span-3',
  'sm:col-span-4',
  'sm:col-span-5',
  'sm:col-span-6',
  'sm:col-span-7',
  'sm:col-span-8',
  'sm:col-span-9',
  'sm:col-span-10',
  'sm:col-span-11',
  'sm:col-span-12'
]
const MD_COL_SPAN = [
  null,
  'md:col-span-1',
  'md:col-span-2',
  'md:col-span-3',
  'md:col-span-4',
  'md:col-span-5',
  'md:col-span-6',
  'md:col-span-7',
  'md:col-span-8',
  'md:col-span-9',
  'md:col-span-10',
  'md:col-span-11',
  'md:col-span-12'
]
const LG_COL_SPAN = [
  null,
  'lg:col-span-1',
  'lg:col-span-2',
  'lg:col-span-3',
  'lg:col-span-4',
  'lg:col-span-5',
  'lg:col-span-6',
  'lg:col-span-7',
  'lg:col-span-8',
  'lg:col-span-9',
  'lg:col-span-10',
  'lg:col-span-11',
  'lg:col-span-12'
]
const MD_COL_START = [
  null,
  'md:col-start-2',
  'md:col-start-3',
  'md:col-start-4',
  'md:col-start-5',
  'md:col-start-6',
  'md:col-start-7',
  'md:col-start-8',
  'md:col-start-9',
  'md:col-start-10',
  'md:col-start-11',
  'md:col-start-12'
]
const SM_COL_START = [
  null,
  'sm:col-start-2',
  'sm:col-start-3',
  'sm:col-start-4',
  'sm:col-start-5',
  'sm:col-start-6',
  'sm:col-start-7',
  'sm:col-start-8',
  'sm:col-start-9',
  'sm:col-start-10',
  'sm:col-start-11',
  'sm:col-start-12'
]

const FIELD = 'block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-60'
const BTN = 'inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50'
const BTN_NEUTRAL = ['border-gray-300', 'bg-white', 'text-gray-700', 'hover:bg-gray-50']
const BTN_PRIMARY = ['border-blue-600', 'bg-blue-600', 'text-white', 'hover:bg-blue-700']
const CHECK = 'size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
const LABEL_COL = 3
const INPUT_COL = 6

const add = (element, classes) => {
  element.classList.add(...classes.split(' '))
  return element
}

/**
 * Represents a ThemeTailwind4 instance.
 * Needs Tailwind CSS v4 to scan this file or the built jedison files.
 * @extends Theme
 */
class ThemeTailwind4 extends Theme {
  makePrimary (button) {
    button.classList.remove(...BTN_NEUTRAL)
    button.classList.add(...BTN_PRIMARY)
    return button
  }

  getAddPropertyButton (config) {
    const btn = super.getAddPropertyButton(config)
    this.makePrimary(btn)
    btn.classList.add('w-full', 'justify-center')
    return btn
  }

  getObjectControl (config) {
    const control = super.getObjectControl(config)

    if (config.isAccordionProperties) {
      control.childrenSlot.classList.add('pb-3')
    }

    return control
  }

  _adaptHorizontalControl (control, labelCol, inputCol) {
    if (!control.label || control.label.classList.contains('jedi-horizontal-label')) return
    control.container.classList.add('grid', 'grid-cols-12', 'gap-x-4', 'items-start', 'jedi-horizontal')
    add(control.label, 'jedi-horizontal-label col-span-12 sm:text-right sm:pt-1.5')
    control.label.classList.add(SM_COL_SPAN[labelCol ?? LABEL_COL])
    const wrapper = add(document.createElement('div'), 'col-span-12')
    wrapper.classList.add(SM_COL_SPAN[inputCol ?? INPUT_COL])
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
    control.container.classList.add('grid', 'grid-cols-12', 'gap-x-4')
    const wrapper = add(document.createElement('div'), 'col-span-12')
    wrapper.classList.add(SM_COL_SPAN[inputCol ?? INPUT_COL], SM_COL_START[labelCol ?? LABEL_COL])
    Array.from(control.container.children).forEach(el => wrapper.appendChild(el))
    control.container.appendChild(wrapper)
  }

  adaptForHorizontalRadiosControl (control, labelCol, inputCol) {
    if (control.legend.parentElement !== control.fieldset) return
    control.container.classList.add('grid', 'grid-cols-12', 'gap-x-4', 'items-start')
    add(control.legend, 'col-span-12 sm:text-right')
    control.legend.classList.add(SM_COL_SPAN[labelCol ?? LABEL_COL])
    control.container.insertBefore(control.legend, control.fieldset)
    const wrapper = add(document.createElement('div'), 'col-span-12')
    wrapper.classList.add(SM_COL_SPAN[inputCol ?? INPUT_COL])
    control.fieldset.replaceWith(wrapper)
    wrapper.appendChild(control.fieldset)
  }

  adaptForHorizontalCheckboxesControl (control, labelCol, inputCol) {
    this.adaptForHorizontalRadiosControl(control, labelCol, inputCol)
  }

  _adaptHorizontalComplexControl (control, labelCol, inputCol, title) {
    if (control.container.classList.contains('jedi-horizontal')) return
    const fakeLabel = add(document.createElement('label'), 'col-span-12 text-sm font-medium text-gray-700 sm:text-right sm:pt-1.5')
    fakeLabel.classList.add(SM_COL_SPAN[labelCol ?? LABEL_COL])
    fakeLabel.textContent = title || ''
    const wrapper = add(document.createElement('div'), 'col-span-12')
    wrapper.classList.add(SM_COL_SPAN[inputCol ?? INPUT_COL])
    Array.from(control.container.children).forEach(el => wrapper.appendChild(el))
    add(control.container, 'grid grid-cols-12 gap-x-4 items-start jedi-horizontal')
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
    const item = super.getAccordionItem(config)
    add(item.container, 'mb-2 rounded-lg border border-gray-200 bg-white')
    add(item.toggle, 'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-800 hover:bg-gray-50')
    add(item.body, 'px-3 pb-3')
    return item
  }

  getJsonData (config) {
    const jsonData = super.getJsonData(config)
    jsonData.control.classList.add('mb-3')
    add(jsonData.input, FIELD)
    add(jsonData.copyBtn, 'w-full justify-center')
    add(jsonData.saveBtn, 'w-full justify-center')
    this.makePrimary(jsonData.saveBtn)
    return jsonData
  }

  getFieldset () {
    this.ensureLegendStyle()
    const fieldset = super.getFieldset()
    add(fieldset, 'mb-3 min-w-0 rounded-lg border border-gray-200 bg-white p-0')
    return fieldset
  }

  /**
   * A floated legend lays out like a normal block (no border cut-out).
   * The sibling after it has to clear the float, which utilities can't
   * express, so a rule is injected once, like the nav styles in theme.js.
   */
  ensureLegendStyle () {
    if (document.getElementById('jedi-tailwind4-legend-style')) return
    const style = document.createElement('style')
    style.id = 'jedi-tailwind4-legend-style'
    style.textContent = 'legend.jedi-tailwind4-legend + * { clear: left; }'
    document.head.appendChild(style)
  }

  getLegend (config) {
    const superLegend = super.getLegend(config)
    const { legend, infoContainer } = superLegend
    add(legend, 'jedi-tailwind4-legend float-left flex w-full items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-50 px-3 py-2 text-base font-medium')
    infoContainer.classList.add('mr-1')
    return superLegend
  }

  styleLegendWarning (span) {
    span.classList.add('mr-1')
  }

  getRadioLegend (config) {
    const radioLegend = super.getRadioLegend(config)
    add(radioLegend.legendText, 'mb-1 text-sm font-medium text-gray-700')
    return radioLegend
  }

  getLabel (config) {
    const labelObj = super.getLabel(config)
    add(labelObj.label, 'mb-1 inline-block text-sm font-medium text-gray-700')
    return labelObj
  }

  getInfo (config = {}) {
    const info = super.getInfo(config)
    info.container.classList.add('mr-1')
    return info
  }

  getDialog () {
    const dialog = super.getDialog()
    add(dialog, 'm-auto rounded-lg p-4 shadow-xl backdrop:bg-black/40')
    return dialog
  }

  infoAsModal (info, id, config = {}) {
    super.infoAsModal(info, id, config)
    const dialog = info.container.querySelector('.jedi-modal-dialog')
    add(dialog.querySelector('.jedi-modal-title'), 'mb-2 text-lg font-semibold')
    add(dialog.querySelector('.jedi-modal-content'), 'mb-4 text-sm')
  }

  getCard () {
    return add(super.getCard(), 'mb-3 rounded-lg border border-gray-200 bg-white')
  }

  getCardHeader (config) {
    return add(super.getCardHeader(config), 'flex items-center justify-end rounded-t-lg border-b border-gray-200 bg-gray-50 px-3 py-1')
  }

  getCardBody () {
    return add(super.getCardBody(), 'p-3 pb-0')
  }

  getArrayFooter () {
    return add(super.getArrayFooter(), 'rounded-b-lg border-t border-gray-200 bg-gray-50 px-3 py-2')
  }

  getControlSlot () {
    return add(super.getControlSlot(), 'mb-3')
  }

  getBtnGroup () {
    return add(super.getBtnGroup(), 'inline-flex gap-1')
  }

  getButton (config) {
    return add(super.getButton(config), BTN)
  }

  getDescription (config) {
    return add(super.getDescription(config), 'mb-1 text-sm text-gray-500')
  }

  getPropertiesGroup (config = {}) {
    const propertiesGroup = super.getPropertiesGroup(config)
    propertiesGroup.group.classList.add('pl-4')
    propertiesGroup.container.classList.add('mb-4')
    return propertiesGroup
  }

  getTextareaControl (config) {
    const control = super.getTextareaControl(config)
    const { container, input, label } = control
    container.classList.add('mb-3')
    add(input, FIELD)

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
    add(input, FIELD)

    if (config.titleHidden) {
      this.visuallyHidden(label)
    }

    return control
  }

  getInputRangeControl (config) {
    const control = super.getInputRangeControl(config)
    const { container, input, label } = control
    container.classList.add('mb-3')
    add(input, 'w-full accent-blue-600')

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
      add(radioControl, config.inline ? 'mr-4 inline-flex items-center gap-2' : 'flex items-center gap-2')
      add(radios[index], CHECK)
      add(labels[index], 'text-sm text-gray-700')

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
    control.fieldset.classList.remove('mb-3', 'rounded-lg', 'border', 'border-gray-200', 'bg-white')
  }

  getCheckboxesControl (config) {
    const control = super.getCheckboxesControl(config)
    const { checkboxes, labels, checkboxControls } = control

    checkboxControls.forEach((checkboxControl, index) => {
      add(checkboxControl, config.inline ? 'mb-3 mr-4 inline-flex items-center gap-2' : 'mb-3 flex items-center gap-2')
      add(checkboxes[index], CHECK)
      add(labels[index], 'text-sm text-gray-700')
    })

    return control
  }

  getCheckboxControl (config) {
    const control = super.getCheckboxControl(config)
    const { container, formGroup, input, label, info, description, messages } = control
    container.classList.add('mb-3')
    add(formGroup, 'flex items-center gap-2')
    add(input, CHECK)
    add(label, 'text-sm text-gray-700')

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
  }

  getSelectControl (config) {
    const control = super.getSelectControl(config)
    const { container, input } = control

    if (!config.noSpacing) {
      container.classList.add('mb-3')
    }

    add(input, FIELD)
    return control
  }

  adaptForTableSelectControl (control, td) {
    super.adaptForTableSelectControl(control, td)
    control.container.classList.remove('mb-3')
  }

  getSwitcherSelect (config) {
    const control = super.getSwitcherSelect(config)
    add(control.input, FIELD)
    return control
  }

  getSwitcherSelectInline (config) {
    const control = super.getSwitcherSelectInline(config)
    control.container.classList.add('mb-1')
    add(control.input, FIELD)
    return control
  }

  getSwitcherModal (config) {
    const control = super.getSwitcherModal(config)
    add(control.trigger, 'inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white')
    add(control.dialogBody, 'flex w-full flex-col gap-1')
    control.optionButtons.forEach(btn => {
      add(btn, 'w-full justify-center border-gray-100 bg-gray-100 px-3 py-1 text-sm text-gray-800 hover:bg-gray-200')
    })
    return control
  }

  setSwitcherOptionActive (btn, active) {
    super.setSwitcherOptionActive(btn, active)
    btn.classList.toggle('bg-blue-600', active)
    btn.classList.toggle('border-blue-600', active)
    btn.classList.toggle('text-white', active)
    btn.classList.toggle('bg-gray-100', !active)
    btn.classList.toggle('border-gray-100', !active)
    btn.classList.toggle('text-gray-800', !active)
  }

  adaptForTableMultipleControl (control, td) {
    super.adaptForTableMultipleControl(control, td)
    control.container.classList.remove('mb-3')
  }

  getAlert (config) {
    return add(super.getAlert(config), 'mb-3 rounded-md border border-red-200 bg-red-50 p-3')
  }

  getErrorFeedback (config) {
    return add(super.getErrorFeedback(config), 'block break-words text-sm text-red-600')
  }

  getWarningFeedback (config) {
    return add(super.getWarningFeedback(config), 'block break-words text-sm text-amber-600')
  }

  getRow () {
    return add(super.getRow(), 'grid grid-cols-12 gap-x-4')
  }

  getCol (xs, sm, md, lg, offsetMd) {
    const col = super.getCol(xs, sm, md, lg, offsetMd)
    const classes = [COL_SPAN[xs], SM_COL_SPAN[sm], MD_COL_SPAN[md], LG_COL_SPAN[lg], MD_COL_START[offsetMd]]
    col.classList.add(...classes.filter(Boolean))
    return col
  }

  /**
   * Vertical nav: stacked below the container's 36rem, side by side above it.
   * Uses Tailwind container queries instead of the injected nav styles.
   */
  getNavRow (variant, widthOptions = {}) {
    if (variant === 'horizontal') {
      return super.getNavRow(variant, widthOptions)
    }

    const row = add(document.createElement('div'), 'jedi-nav-row flex flex-wrap gap-4 @container')
    const tabListCol = add(document.createElement('div'), 'jedi-col jedi-nav-list-col w-full @xl:w-auto @xl:max-w-(--jedi-nav-max-width) @xl:min-w-(--jedi-nav-min-width)')
    const tabContentCol = add(document.createElement('div'), 'jedi-col jedi-nav-content-col w-full min-w-0 @xl:w-auto @xl:flex-1')

    tabListCol.style.setProperty('--jedi-nav-max-width', widthOptions.maxWidth ?? '40%')
    if (widthOptions.minWidth) tabListCol.style.setProperty('--jedi-nav-min-width', widthOptions.minWidth)

    return { row, tabListCol, tabContentCol }
  }

  getTabList (config) {
    const tabList = super.getTabList(config)
    tabList.classList.add('mb-3', 'flex', 'list-none', 'gap-1', 'p-0')

    if (config.variant === 'horizontal') {
      tabList.classList.add('flex-wrap', 'border-b', 'border-gray-200', 'pb-1')
    } else {
      tabList.classList.add('flex-col')
    }

    return tabList
  }

  getTab (config) {
    const tab = super.getTab(config)
    add(tab.link, 'flex items-center rounded-md px-3 py-2 text-sm text-gray-700 no-underline hover:bg-gray-100 [&.active]:bg-blue-600 [&.active]:text-white')
    add(tab.arrayActions, 'shrink-0 whitespace-nowrap')
    add(tab.text, 'mx-2 grow')

    if (config.hasErrors) {
      const warning = tab.text.querySelector('.jedi-nav-warning')
      if (warning) {
        tab.text.removeChild(warning)
        add(warning, 'shrink-0 whitespace-nowrap')
        tab.link.appendChild(warning)
      }
    }

    if (config.active) {
      tab.link.classList.add('active')
    }

    // No Tailwind JS exists, so the theme switches the tabs itself
    tab.link.addEventListener('click', (event) => {
      event.preventDefault()
      this.activateTab(tab, tab.link.getAttribute('href').slice(1))
    })

    return tab
  }

  activateTab (tab, paneId) {
    const pane = document.getElementById(paneId)
    if (!pane) return

    Array.from(tab.list.parentElement.children).forEach(item => {
      const active = item === tab.list
      item.classList.toggle('active', active)
      item.firstElementChild?.classList.toggle('active', active)
    })

    Array.from(pane.parentElement.children)
      .filter(el => el.classList.contains('jedi-tab-pane'))
      .forEach(el => {
        el.classList.toggle('hidden', el !== pane)
        el.classList.toggle('active', el === pane)
      })
  }

  getTable () {
    const table = super.getTable()
    add(table.container, 'overflow-x-auto')
    add(table.table, 'w-full text-sm align-middle')
    return table
  }

  setTabPaneAttributes (element, active, id) {
    super.setTabPaneAttributes(element, active, id)
    element.classList.toggle('hidden', !active)
    element.classList.toggle('active', active)
  }

  visuallyHidden (element) {
    element.classList.add('sr-only')
  }

  visuallyVisible (element) {
    element.classList.remove('sr-only')
  }
}

export default ThemeTailwind4
