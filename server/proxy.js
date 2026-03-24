// Atlasio Workspace — Backend Proxy Server
// Run: node server/proxy.js
// This avoids CORS issues when calling Yahoo Finance from the browser

const express = require('express')
const cors = require('cors')
const https = require('https')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: ['http://localhost:3000', 'https://your-domain.com'] }))
app.use(express.json())

// Generic Yahoo Finance proxy
function fetchYahoo(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    }
    https.get(url, options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(new Error('Parse error')) }
      })
    }).on('error', reject)
  })
}

// GET /api/quotes?symbols=AAPL,NVDA,MSFT
app.get('/api/quotes', async (req, res) => {
  const { symbols } = req.query
  if (!symbols) return res.status(400).json({ error: 'symbols required' })
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`
    const data = await fetchYahoo(url)
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/chart/:symbol?range=1d&interval=5m
app.get('/api/chart/:symbol', async (req, res) => {
  const { symbol } = req.params
  const { range = '1d', interval = '5m' } = req.query
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`
    const data = await fetchYahoo(url)
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/news?q=stock+market
app.get('/api/news', async (req, res) => {
  const { q = 'stock market' } = req.query
  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&newsCount=8`
    const data = await fetchYahoo(url)
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

app.listen(PORT, () => {
  console.log(`Atlasio proxy server running on http://localhost:${PORT}`)
})
