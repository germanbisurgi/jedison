/* global Feature Scenario BeforeSuite */
const theme = process.env.THEME || 'barebones'
const pathToSchema = 'features/x-buttons'

// Adversarial schema used by the security scenario. Kept as a raw JSON string
// (not a JS object) so that `__proto__` survives as an own property through
// JSON.parse in the playground's setSchema(), exactly like an untrusted schema
// arriving over the wire (F5). Exercises F1 (attribute allowlist) and
// F6 (label sanitization) as well.
const maliciousSchema = JSON.stringify({
  type: 'object',
  properties: {
    field: {
      type: 'string',
      title: 'Field',
      'x-buttons': [
        {
          label: '<img src=x onerror="window.__xssRan = true"> <i class="fas fa-check"></i> Go',
          event: { name: 'secTest' },
          attributes: {
            id: 'sec-btn',
            'data-ok': 'yes',
            onclick: 'window.__onclickRan = true',
            style: 'position:fixed;top:0;left:0',
            formaction: 'https://evil.example'
          }
        }
      ]
    }
  }
  // `__proto__` is injected as a real JSON key below: a JS object literal would
  // set the prototype instead of an own property, so it would never reach the
  // schema. JSON.parse (in the playground's setSchema) does create an own
  // "__proto__" property, which is what F5 must guard against.
}).replace(
  '"formaction":"https://evil.example"',
  '"formaction":"https://evil.example","__proto__":{"polluted":"yes"}'
)

Feature('x-buttons')

BeforeSuite(({ I }) => {
  I.amOnPage(`playground.html?theme=${theme}&iconLib=fontawesome5`)
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('@feature @x-buttons renders buttons with label, hook class and custom attributes', ({ I }) => {
  // Hook class present, no theme styling class
  I._waitForElement('[data-path="#/city"] button.jedi-x-button')
  I.seeElement('[data-path="#/city"] button.jedi-x-button[type="button"]')
  I.dontSeeElement('[data-path="#/city"] button.jedi-btn')

  // Custom attributes from the allowlist are applied
  I.seeElement('[data-path="#/city"] button.jedi-x-button.my-custom-button')
  I.seeElement('[data-path="#/city"] button.jedi-x-button[data-analytics="detect-city"]')

  // Sanitized HTML label keeps the icon element
  I.seeElement('[data-path="#/city"] button.jedi-x-button .jedi-x-button-label i.fas.fa-location-dot')

  // Multiple buttons on one editor
  I.seeElement('[data-path="#/comment"] button.jedi-x-button')

  // Buttons on a container (object) editor
  I.seeElement('[data-path="#/address"] button.jedi-x-button')
})

Scenario('@feature @x-buttons emit a namespaced event with { jedison, editor, path }', async ({ I }) => {
  I.executeScript(() => {
    window.__xbPayload = null
    window.__xbCallCount = 0
    window.editor.on('jedison:detectCity', (payload) => {
      window.__xbCallCount += 1
      window.__xbPayload = {
        path: payload.path,
        hasJedison: !!payload.jedison,
        hasEditor: !!payload.editor,
        editorInstancePath: payload.editor && payload.editor.instance && payload.editor.instance.path
      }
    })
  })

  I._click('[data-path="#/city"] button.jedi-x-button')

  const result = await I.executeScript(() => ({ payload: window.__xbPayload, callCount: window.__xbCallCount }))

  I.assertTrue(!!result.payload, 'jedison:detectCity should have fired')
  // A single click fires the handler exactly once (no double-fire).
  I.assertEqual(result.callCount, 1)
  I.assertEqual(result.payload.path, '#/city')
  I.assertTrue(result.payload.hasJedison)
  I.assertTrue(result.payload.hasEditor)
  I.assertEqual(result.payload.editorInstancePath, '#/city')
})

Scenario('@feature @x-buttons off(name, cb) removes only the given callback', async ({ I }) => {
  const result = await I.executeScript(() => {
    const calls = { a: 0, b: 0 }
    const cbA = () => { calls.a += 1 }
    const cbB = () => { calls.b += 1 }
    window.editor.on('jedison:offTest', cbA)
    window.editor.on('jedison:offTest', cbB)
    window.editor.off('jedison:offTest', cbA)
    window.editor.emit('jedison:offTest', {})
    window.editor.off('jedison:offTest')
    return calls
  })

  I.assertEqual(result.a, 0, 'the removed callback must not fire')
  I.assertEqual(result.b, 1, 'the remaining callback must still fire')
})

Scenario('@feature @x-buttons button data never leaks into getValue()', async ({ I }) => {
  const value = await I.executeScript(() => JSON.stringify(window.editor.getValue()))
  const leaks = ['detectCity', 'x-buttons', '"event"', '"label"', 'my-custom-button']
    .some((needle) => value.indexOf(needle) !== -1)
  I.assertFalse(leaks, `getValue() must not contain button config, got: ${value}`)
})

Scenario('@feature @x-buttons follow the editor disabled state', ({ I }) => {
  I._click('#disable-editor')
  I._waitForElement('[data-path="#/city"] button.jedi-x-button[disabled]')
  I._click('#enable-editor')
})

Scenario('@feature @x-buttons filter attributes and sanitize labels against an untrusted schema', async ({ I }) => {
  I.executeScript((schema) => {
    window.__xssRan = false
    window.__onclickRan = false
    document.querySelector('#schema').value = schema
  }, maliciousSchema)
  I._click('#set-schema')

  I._waitForElement('#sec-btn')

  // Allowlisted attributes survive (F1)
  I.seeElement('button#sec-btn.jedi-x-button[data-ok="yes"]')

  // Disallowed attributes are dropped (F1)
  I.dontSeeElement('#sec-btn[onclick]')
  I.dontSeeElement('#sec-btn[style]')
  I.dontSeeElement('#sec-btn[formaction]')

  // Label is sanitized: the <img> may remain but the onerror handler is stripped (F6)
  I.dontSeeElement('#sec-btn img[onerror]')
  // The safe icon in the label survives sanitization
  I.seeElement('#sec-btn .jedi-x-button-label i.fas.fa-check')

  // Clicking must not trigger an inline handler that was dropped
  I._click('#sec-btn')

  const flags = await I.executeScript(() => ({
    xssRan: window.__xssRan === true,
    onclickRan: window.__onclickRan === true,
    prototypePolluted: ({}).polluted !== undefined
  }))

  I.assertFalse(flags.xssRan, 'onerror in a label must never execute (F6)')
  I.assertFalse(flags.onclickRan, 'a dropped onclick attribute must never execute (F1)')
  I.assertFalse(flags.prototypePolluted, '__proto__ in attributes must not pollute Object.prototype (F5)')
})
