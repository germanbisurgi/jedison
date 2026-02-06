const show = process.env.SHOW || false
const width = 1400
const height = 5000

exports.config = {
  tests: './**/*_test.cjs',
  output: './output',
  include: {
    I: './steps_file.cjs'
  },
  helpers: {
    Puppeteer: {
      url: 'http://localhost:8181/',
      show: show,
      waitForAction: 500,
      waitForTimeout: 5000,
      windowSize: `${width}x${height}`,
      restart: false,
      waitForNavigation: ['load', 'networkidle0', 'domcontentloaded'],
      chrome: {
        args: ['--no-sandbox', '--disable-setuid-sandbox', `--window-size=${width},${height}`]
      }
    },
    ChaiWrapper: {
      require: 'codeceptjs-chai'
    }
  }
}
