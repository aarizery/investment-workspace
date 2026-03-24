import { useState, useEffect, useCallback, useRef } from 'react'
import {
  fetchQuotes, fetchChart, fetchNews,
  computeRegime, computeSR, computeBias,
  MACRO_ASSETS, DEFAULT_WATCHLIST
} from '../lib/dataService'

const POLL_INTERVAL = 15000 // 15s

export function useMarketData() {
  const [macroData, setMacroData] = useState([])
  const [watchlist, setWatchlist] = useState(DEFAULT_WATCHLIST)
  const [watchlistData, setWatchlistData] = useState([])
  const [focusSymbol, setFocusSymbol] = useState('AAPL')
  const [focusChart, setFocusChart] = useState(null)
  const [focusQuote, setFocusQuote] = useState(null)
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [chartRange, setChartRange] = useState('1d')
  const timerRef = useRef(null)

  const enrichQuote = (q) => {
    const regime = computeRegime(q.price, q.ma50, q.ma200)
    const { support, resistance } = computeSR(q.week52Low, q.week52High, q.price)
    const bias = computeBias(q.changePct, regime)
    const impact = Math.min(99, Math.abs(Math.round(q.changePct * 12 + (q.volume / (q.avgVolume || 1)) * 5)))
    return { ...q, regime, support, resistance, bias, impact }
  }

  const loadMacro = useCallback(async () => {
    const symbols = MACRO_ASSETS.map(a => a.symbol)
    const quotes = await fetchQuotes(symbols)
    const enriched = MACRO_ASSETS.map(asset => {
      const q = quotes.find(r => r.symbol === asset.symbol) || {}
      return { ...asset, ...enrichQuote({ ...q, symbol: asset.symbol }) }
    })
    setMacroData(enriched)
  }, [])

  const loadWatchlist = useCallback(async (symbols) => {
    const quotes = await fetchQuotes(symbols)
    const enriched = quotes.map(enrichQuote)
    setWatchlistData(enriched)
  }, [])

  const loadFocus = useCallback(async (symbol, range = '1d') => {
    const interval = range === '1d' ? '5m' : range === '5d' ? '30m' : '1d'
    const [chartData, quotes] = await Promise.all([
      fetchChart(symbol, range, interval),
      fetchQuotes([symbol])
    ])
    setFocusChart(chartData)
    if (quotes[0]) setFocusQuote(enrichQuote(quotes[0]))
  }, [])

  const loadNews = useCallback(async () => {
    const items = await fetchNews('financial markets stocks')
    setNews(items)
  }, [])

  const refresh = useCallback(async () => {
    await Promise.all([
      loadMacro(),
      loadWatchlist(watchlist),
      loadFocus(focusSymbol, chartRange),
    ])
    setLastUpdate(new Date())
    setLoading(false)
  }, [loadMacro, loadWatchlist, loadFocus, watchlist, focusSymbol, chartRange])

  // Initial load
  useEffect(() => {
    refresh()
    loadNews()
  }, [])

  // Poll
  useEffect(() => {
    timerRef.current = setInterval(refresh, POLL_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [refresh])

  // When focus changes
  useEffect(() => {
    loadFocus(focusSymbol, chartRange)
  }, [focusSymbol, chartRange])

  const addToWatchlist = useCallback((symbol) => {
    const upper = symbol.toUpperCase().trim()
    if (!upper || watchlist.includes(upper)) return
    const next = [...watchlist, upper]
    setWatchlist(next)
    loadWatchlist(next)
  }, [watchlist, loadWatchlist])

  const removeFromWatchlist = useCallback((symbol) => {
    const next = watchlist.filter(s => s !== symbol)
    setWatchlist(next)
    loadWatchlist(next)
  }, [watchlist, loadWatchlist])

  return {
    macroData,
    watchlist,
    watchlistData,
    focusSymbol,
    setFocusSymbol,
    focusChart,
    focusQuote,
    news,
    loading,
    lastUpdate,
    chartRange,
    setChartRange,
    addToWatchlist,
    removeFromWatchlist,
    refresh,
  }
}
