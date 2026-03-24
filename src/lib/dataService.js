// Atlasio Data Service
// Uses Yahoo Finance via CORS proxy for live market data
// Replace YAHOO_PROXY with your own backend if needed

const PROXY = 'https://query1.finance.yahoo.com/v8/finance/chart/'
const CORS = 'https://corsproxy.io/?'

const QUOTE_URL = (symbol) =>
  `${CORS}${encodeURIComponent(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`)}`

const CHART_URL = (symbol, range = '1d', interval = '5m') =>
  `${CORS}${encodeURIComponent(`${PROXY}${symbol}?range=${range}&interval=${interval}`)}`

const NEWS_URL = (symbol) =>
  `${CORS}${encodeURIComponent(`https://query2.finance.yahoo.com/v1/finance/search?q=${symbol}&newsCount=8&enableFuzzyQuery=false`)}`

export async function fetchQuotes(symbols) {
  try {
    const url = QUOTE_URL(symbols.join(','))
    const res = await fetch(url)
    const data = await res.json()
    const results = data?.quoteResponse?.result || []
    return results.map(q => ({
      symbol: q.symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePct: q.regularMarketChangePercent,
      open: q.regularMarketOpen,
      high: q.regularMarketDayHigh,
      low: q.regularMarketDayLow,
      volume: q.regularMarketVolume,
      avgVolume: q.averageDailyVolume3Month,
      marketCap: q.marketCap,
      pe: q.trailingPE,
      eps: q.epsTrailingTwelveMonths,
      week52High: q.fiftyTwoWeekHigh,
      week52Low: q.fiftyTwoWeekLow,
      shortName: q.shortName,
      ma50: q.fiftyDayAverage,
      ma200: q.twoHundredDayAverage,
    }))
  } catch (e) {
    console.warn('fetchQuotes failed', e)
    return []
  }
}

export async function fetchChart(symbol, range = '1d', interval = '5m') {
  try {
    const url = CHART_URL(symbol, range, interval)
    const res = await fetch(url)
    const data = await res.json()
    const chart = data?.chart?.result?.[0]
    if (!chart) return null
    const timestamps = chart.timestamp || []
    const closes = chart.indicators?.quote?.[0]?.close || []
    const opens = chart.indicators?.quote?.[0]?.open || []
    const highs = chart.indicators?.quote?.[0]?.high || []
    const lows = chart.indicators?.quote?.[0]?.low || []
    const volumes = chart.indicators?.quote?.[0]?.volume || []
    return timestamps.map((t, i) => ({
      time: t,
      open: opens[i],
      high: highs[i],
      low: lows[i],
      close: closes[i],
      volume: volumes[i],
    })).filter(d => d.close !== null && d.close !== undefined)
  } catch (e) {
    console.warn('fetchChart failed', e)
    return null
  }
}

export async function fetchNews(query = 'stock market') {
  try {
    const url = NEWS_URL(query)
    const res = await fetch(url)
    const data = await res.json()
    return (data?.news || []).map(n => ({
      title: n.title,
      publisher: n.publisher,
      link: n.link,
      time: n.providerPublishTime,
      thumbnail: n.thumbnail?.resolutions?.[0]?.url,
    }))
  } catch (e) {
    console.warn('fetchNews failed', e)
    return []
  }
}

// Macro regime computation based on price vs moving averages
export function computeRegime(price, ma50, ma200) {
  if (!price || !ma50 || !ma200) return 'unknown'
  const aboveMa50 = price > ma50
  const aboveMa200 = price > ma200
  const ma50AboveMa200 = ma50 > ma200

  if (aboveMa50 && aboveMa200 && ma50AboveMa200) return 'uptrend'
  if (!aboveMa50 && !aboveMa200 && !ma50AboveMa200) return 'breakdown'
  return 'transition'
}

// Support/Resistance estimation from 52-week range
export function computeSR(low52, high52, price) {
  const range = high52 - low52
  const support = Math.max(low52, price - range * 0.15).toFixed(2)
  const resistance = Math.min(high52, price + range * 0.15).toFixed(2)
  return { support, resistance }
}

// Bias score: momentum + regime combined
export function computeBias(changePct, regime) {
  let base = Math.round(changePct * 3)
  if (regime === 'uptrend') base += 5
  if (regime === 'breakdown') base -= 5
  return Math.max(-20, Math.min(20, base))
}

export const MACRO_ASSETS = [
  { symbol: '^GSPC', label: 'S&P 500', linked: 'SPY', category: 'equity' },
  { symbol: 'GC=F', label: 'Gold', linked: 'GLD', category: 'commodity' },
  { symbol: 'HG=F', label: 'Copper', linked: 'FCX', category: 'commodity' },
  { symbol: 'CL=F', label: 'Crude Oil', linked: 'XOM', category: 'energy' },
  { symbol: '^TNX', label: '10Y Yield', linked: 'TLT', category: 'rates' },
  { symbol: 'DX-Y.NYB', label: 'DXY', linked: 'UUP', category: 'fx' },
  { symbol: 'BTC-USD', label: 'Bitcoin', linked: 'IBIT', category: 'crypto' },
  { symbol: '^VIX', label: 'VIX', linked: 'UVXY', category: 'volatility' },
]

export const DEFAULT_WATCHLIST = ['AAPL', 'NVDA', 'MSFT', 'TSLA', 'AMZN', 'META', 'GOOGL', 'SPY']

export function fmt(n, decimals = 2) {
  if (n == null || isNaN(n)) return '--'
  return Number(n).toFixed(decimals)
}

export function fmtPct(n) {
  if (n == null || isNaN(n)) return '--'
  const sign = n >= 0 ? '+' : ''
  return `${sign}${Number(n).toFixed(2)}%`
}

export function fmtLarge(n) {
  if (!n) return '--'
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  return String(n)
}

export function fmtTime(unix) {
  const d = new Date(unix * 1000)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function fmtDate(unix) {
  const d = new Date(unix * 1000)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
