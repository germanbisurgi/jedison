const Helper = require('codeceptjs').helper

/**
 * codeceptjs's Puppeteer helper re-adds a 'dialog' listener on every _after()
 * when restart:false, without removing the previous one. Over a long-running
 * worker session listeners pile up on the same page, and Puppeteer's Dialog.accept()
 * throws "Cannot accept dialog which is already handled" once more than one fires.
 * Reset to a single listener before each test to avoid the leak.
 */
class DialogListenerFix extends Helper {
  _before () {
    const puppeteerHelper = this.helpers.Puppeteer
    const page = puppeteerHelper && puppeteerHelper.page

    if (!page) {
      return
    }

    page.removeAllListeners('dialog')
    puppeteerHelper._addPopupListener(page)
  }
}

module.exports = DialogListenerFix
