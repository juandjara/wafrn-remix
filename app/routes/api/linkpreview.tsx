import { json, LoaderFunction } from "@remix-run/node"

export type LinkPreviewInfo = {
  url: string
  title: string
  description: string
  publisher: string
  logo: string
  image: string
  iframe: string
}

const metascraper = require('metascraper')([
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-logo')(),
  require('metascraper-logo-favicon')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')(),
  require('metascraper-iframe')()
])

const getHTML = require('html-get')
const createBrowser = require('browserless')

async function getLinkPreview(link: string) {
  // a browserless factory that will keep a singleton process running
  const browser = createBrowser()

  // create a browser context with separate cookies/cache
  const browserless = browser.createContext()
  
  // fetch html from page using fancy npm magic that skips ads and connection blockers 
  const html = await getHTML(link, { getBrowserless: () => browserless })
  const info = metascraper(html)
  
  // free memory and shutdown the browser process
  await (await browserless).destroyContext()
  await browser.close()

  return info as LinkPreviewInfo
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url).searchParams.get('url') as string
  try {
    const info = await getLinkPreview(url)
    return json(info, {
      headers: {
        'Cache-Control': 'max-age=600' // cache link preview for 10min
      }
    })
  } catch (err: any) {
    return new Response(err.message, { status: 500, statusText: 'Scraping Error' })
  }
}
