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
    _fillRangeField: function (locator, value) {
      this.executeScript(function (locator, value) {
        document.querySelector(locator).value = value
        document.querySelector(locator).dispatchEvent(new Event('change'))
      }, locator, value)
    },
    _setEditorValue: function (value) {
      this.fillField('#editor-value', value)
      this._scrollTo('#set-value')
      this._click('#set-value')
      this._scrollTo('[data-path="#"]')
    }
  })
}
