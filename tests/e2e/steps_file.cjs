/* global actor */

const waitTime = 10

module.exports = function () {
  return actor({
    _scrollIntoView: function (locator) {
      this.executeScript(function (locator) {
        document.querySelector(locator).scrollIntoView()
      }, locator)
    },
    _waitForElement: function (locator) {
      this.waitForElement(locator, waitTime)
    },
    _waitForVisible: function (locator) {
      this.waitForVisible(locator, waitTime)
    },
    _waitForInvisible: function (locator) {
      this.waitForInvisible(locator, waitTime)
    },
    _waitForText: function (text, context) {
      this.waitForText(text, waitTime, context)
    },
    _waitForValue: function (locator, value) {
      this.waitForValue(locator, value, waitTime)
    },
    _scrollTo: function (locator) {
      this._scrollIntoView(locator)
      this.wait(1)
    },
    _click: function (locator) {
      this._scrollIntoView(locator)
      this.wait(1)
      this.click(locator)
    },
    _checkOption: function (locator) {
      this._scrollIntoView(locator)
      this.wait(1)
      this.checkOption(locator)
    },
    _uncheckOption: function (locator) {
      this._scrollIntoView(locator)
      this.wait(1)
      this.uncheckOption(locator)
    },
    _fillField: function (locator, value) {
      this.fillField(locator, value)
      this.pressKey('Tab')
    },
    _pressKey: function (key) {
      this.pressKey(key)
      this.wait(0.1)
    },
    _fillRangeField: function (locator, value) {
      this.executeScript(function (locator, value) {
        document.querySelector(locator).value = value
        document.querySelector(locator).dispatchEvent(new Event('change'))
      }, locator, value)
    },
    // Changing a playground select reloads the page. Wait until the new page is ready,
    // the old page also has .jedi-ready and would let the next step run mid-navigation.
    _selectAndWaitForReload: function (locator, value, param, timeout = waitTime) {
      this.selectOption(locator, value)
      this.waitForFunction(function (param, value) {
        return new URLSearchParams(window.location.search).get(param) === value && !!document.querySelector('.jedi-ready')
      }, [param, value], timeout)
    },
    _selectExample: function (example, timeout) {
      this._selectAndWaitForReload('#examples', example, 'example', timeout)
    },
    _selectShowErrors: function (showErrors) {
      this._selectAndWaitForReload('#show-errors', showErrors, 'showErrors')
    },
    _setEditorValue: function (value) {
      this.fillField('#editor-value', value)
      this._scrollTo('#set-value')
      this._click('#set-value')
      this._scrollTo('[data-path="#"]')
    }
  })
}
