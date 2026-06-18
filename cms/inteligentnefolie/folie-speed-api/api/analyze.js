const isPrivateHost = (hostname) => {
  const h = hostname.toLowerCase()
  if (h === 'localhost' || h === '127.0.0.1' || h === '::1') return true
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) {
    const parts = h.split('.').map((x) => Number(x))
    if (parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true
    const [a, b] = parts
    if (a === 10) return true
    if (a === 127) return true
    if (a === 0) return true
    if (a === 169 && b === 254) return true
    if (a === 192 && b === 168) return true
    if (a === 172 && b >= 16 && b <= 31) return true
  }
  return false
}

const parseBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw.trim()) return {}
  return JSON.parse(raw)
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Allow', 'POST')
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  let body
  try {
    body = await parseBody(req)
  } catch {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Invalid JSON body' }))
    return
  }

  const urlRaw = typeof body?.url === 'string' ? body.url.trim() : ''
  let url
  try {
    url = new URL(urlRaw)
  } catch {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Invalid URL' }))
    return
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Only http/https URLs are allowed' }))
    return
  }

  if (isPrivateHost(url.hostname)) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Private/localhost URLs are not allowed' }))
    return
  }

  const [{ default: lighthouse }, chromeLauncher, chromium] = await Promise.all([
    import('lighthouse'),
    import('chrome-launcher'),
    import('@sparticuz/chromium'),
  ])

  let chrome
  try {
    let chromePath = null
    try {
      chromePath = await chromium.executablePath()
    } catch {
      chromePath = null
    }

    const chromeFlags = chromePath ? chromium.args : []

    chrome = await chromeLauncher.launch({
      chromePath: chromePath || undefined,
      chromeFlags: [...chromeFlags, '--headless=new', '--no-sandbox', '--disable-dev-shm-usage'],
      logLevel: 'silent',
    })

    const result = await lighthouse(url.toString(), {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance'],
    })

    const score = result?.lhr?.categories?.performance?.score
    const performance = typeof score === 'number' ? Math.round(score * 100) : null

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        url: url.toString(),
        performance,
      }),
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: message }))
  } finally {
    try {
      if (chrome) await chrome.kill()
    } catch {}
  }
}
