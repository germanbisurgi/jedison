// Usage: yarn build:lib && node tests/perf/array-benchmark.cjs [items] [x-format, e.g. table, table-object, nav-vertical]
// Measures DOM cost of large arrays in a real browser (timings vary per machine, compare before/after).
const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const ITEMS = parseInt(process.argv[2] || '300', 10)
const FORMAT = process.argv[3]
const bundle = fs.readFileSync(path.resolve(__dirname, '../../dist/umd/jedison.umd.js'), 'utf8')

const run = async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.setContent('<div id="root"></div>')
  await page.evaluate(bundle)

  const result = await page.evaluate((items, format) => {
    const time = (fn) => {
      const start = performance.now()
      fn()
      return Math.round(performance.now() - start)
    }
    const data = () => Array.from({ length: items }, (_, i) => ({ a: 'a' + i, b: 'b' + i, c: 'c' + i }))
    const schema = {
      type: 'array',
      ...(format ? { 'x-format': format } : {}),
      items: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' }, c: { type: 'string' } } }
    }
    const out = {}
    let jedison
    out.firstRenderMs = time(() => {
      jedison = new window.Jedison.Create({ theme: new window.Jedison.ThemeBootstrap5(), container: document.getElementById('root'), schema, data: data() })
    })
    out.setValueSameMs = time(() => jedison.setValue(data()))
    const changed = data()
    changed[10].a = 'changed'
    out.setValueOneChangeMs = time(() => jedison.setValue(changed))
    const input = document.querySelectorAll('input[type=text], input:not([type])')[items]
    out.editOneFieldMs = time(() => {
      input.value = 'typed'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })
    out.domNodes = document.querySelectorAll('*').length
    return out
  }, ITEMS, FORMAT)

  console.log(`items: ${ITEMS}, format: ${FORMAT || 'default'}`)
  console.table(result)
  await browser.close()
}

run().catch((error) => { console.error(error); process.exit(1) })
