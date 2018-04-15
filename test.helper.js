const puppeteer = require('puppeteer')

module.exports = { startup, client }

function client(test){
  return async function({ end }){
    const { page, destroy } = await startup()
    try {
      await page.evaluate(test)
      await destroy()
      end()
    } catch (e) {
      console.error('error', e)
    }
  }
}

function startup(body = '') { 
  return puppeteer
    .launch({ headless: process.env.HEADLESS !== 'false', timeout: 999999 })
    .then(async browser => {
      const ripple = require('rijs')({ port: 0, dir: __dirname, watch: false })
      ripple.server.express.use((req, res) => res.send(`
        <script src="/ripple.js"></script>
        <script>window.require = window.import = ripple.get</script>
        <body>${body}</body> 
      `))

      await ripple.server.once('listening')

      const page = await browser.newPage()

      await page.goto(`http://localhost:${ripple.server.port}`)
      if (process.env.DEBUG == 'true')
        page.on('console', (...args) => console.log('(CLIENT):', ...args))

      return { page, destroy }

      async function destroy(argument) {
        await page.close()
        await browser.close()
        await new Promise(resolve => ripple.server.http.close(resolve))
      }
    })
}