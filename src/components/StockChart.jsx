import React, { useEffect, useRef, useState } from 'react'
import { fmt, fmtPct, fmtTime } from '../lib/dataService'

const RANGES = ['1d', '5d', '1mo', '3mo', '6mo', '1y']

function MiniChart({ data, color }) {
  const canvasRef = useRef()

  useEffect(() => {
    if (!data || !data.length) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    const prices = data.map(d => d.close).filter(Boolean)
    if (!prices.length) return
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const range = max - min || 1
    const pad = 4

    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, height)
    grad.addColorStop(0, `${color}40`)
    grad.addColorStop(1, `${color}00`)

    ctx.beginPath()
    data.forEach((d, i) => {
      if (!d.close) return
      const x = pad + (i / (data.length - 1)) * (width - pad * 2)
      const y = height - pad - ((d.close - min) / range) * (height - pad * 2)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Fill
    ctx.lineTo(width - pad, height)
    ctx.lineTo(pad, height)
    ctx.fillStyle = grad
    ctx.fill()
  }, [data, color])

  return <canvas ref={canvasRef} width={600} height={160} style={{ width: '100%', height: 160 }} />
}

function CandlestickChart({ data }) {
  const canvasRef = useRef()
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (!data || !data.length) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const prices = data.flatMap(d => [d.high, d.low]).filter(Boolean)
    const minP = Math.min(...prices)
    const maxP = Math.max(...prices)
    const range = maxP - minP || 1
    const padX = 8, padY = 16
    const chartW = W - padX * 2
    const chartH = H - padY * 2

    const toY = (p) => padY + ((maxP - p) / range) * chartH
    const barW = Math.max(2, (chartW / data.length) * 0.7)

    // Grid
    ctx.strokeStyle = '#1e2230'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padY + (i / 4) * chartH
      ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(W - padX, y); ctx.stroke()
    }

    data.forEach((d, i) => {
      if (!d.open || !d.close) return
      const x = padX + (i / data.length) * chartW + chartW / data.length / 2
      const up = d.close >= d.open
      const color = up ? '#00c896' : '#ff4560'

      ctx.strokeStyle = color
      ctx.fillStyle = up ? `${color}80` : color
      ctx.lineWidth = 1

      // Wick
      if (d.high && d.low) {
        ctx.beginPath()
        ctx.moveTo(x, toY(d.high))
        ctx.lineTo(x, toY(d.low))
        ctx.stroke()
      }

      // Body
      const top = toY(Math.max(d.open, d.close))
      const bottom = toY(Math.min(d.open, d.close))
      const bodyH = Math.max(1, bottom - top)
      ctx.fillRect(x - barW / 2, top, barW, bodyH)
    })
  }, [data])

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={220}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
}

export default function StockChart({ quote, chartData, range, onRangeChange, onFocusChange, watchlist }) {
  if (!quote) return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-dim)',
      borderRadius: 'var(--panel-radius)', flex: 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text-muted)', fontSize: 12,
    }}>
      Select a stock from the watchlist
    </div>
  )

  const up = (quote.changePct || 0) >= 0
  const regimeColors = {
    uptrend: 'var(--regime-uptrend)',
    breakdown: 'var(--regime-breakdown)',
    transition: 'var(--regime-transition)',
    ranging: 'var(--regime-ranging)',
  }

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-dim)',
      borderRadius: 'var(--panel-radius)',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-dim)',
        background: 'var(--bg-elevated)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-orange)', letterSpacing: '0.04em' }}>
                {quote.symbol}
              </span>
              {quote.shortName && (
                <span style={{ fontSize: 11, color: 'var(--text-dim)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {quote.shortName}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
            <span style={{ fontSize: 22, fontWeight: 300, color: 'var(--text-white)', letterSpacing: '-0.02em' }}>
              {fmt(quote.price)}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: up ? 'var(--green)' : 'var(--red)' }}>
              {fmtPct(quote.changePct)}
            </span>
            <span style={{ fontSize: 12, color: up ? 'var(--green)' : 'var(--red)' }}>
              {up ? '▲' : '▼'} {fmt(Math.abs(quote.change))}
            </span>
          </div>

          <span style={{
            fontSize: 11, fontWeight: 700,
            color: regimeColors[quote.regime] || 'var(--text-muted)',
            padding: '2px 8px',
            background: `${regimeColors[quote.regime] || '#888'}15`,
            border: `1px solid ${regimeColors[quote.regime] || '#888'}30`,
            borderRadius: 2,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {quote.regime || '?'}
          </span>
        </div>

        {/* Range selector */}
        <div style={{ display: 'flex', gap: 2 }}>
          {RANGES.map(r => (
            <button key={r}
              onClick={() => onRangeChange(r)}
              style={{
                fontSize: 10, fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 2,
                color: range === r ? 'var(--accent-orange)' : 'var(--text-muted)',
                background: range === r ? 'rgba(245,166,35,0.12)' : 'transparent',
                border: range === r ? '1px solid var(--accent-orange-dim)' : '1px solid transparent',
                letterSpacing: '0.06em',
              }}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex', gap: 0,
        borderBottom: '1px solid var(--border-dim)',
        flexShrink: 0,
      }}>
        {[
          { label: 'Open', value: fmt(quote.open) },
          { label: 'High', value: fmt(quote.high) },
          { label: 'Low', value: fmt(quote.low) },
          { label: 'Volume', value: quote.volume ? (quote.volume / 1e6).toFixed(1) + 'M' : '--' },
          { label: 'Avg Vol', value: quote.avgVolume ? (quote.avgVolume / 1e6).toFixed(1) + 'M' : '--' },
          { label: 'Support', value: quote.support || '--' },
          { label: 'Resistance', value: quote.resistance || '--' },
          { label: '52W High', value: fmt(quote.week52High) },
          { label: '52W Low', value: fmt(quote.week52Low) },
          { label: 'MA50', value: fmt(quote.ma50) },
          { label: 'MA200', value: fmt(quote.ma200) },
          { label: 'P/E', value: quote.pe ? Number(quote.pe).toFixed(1) : '--' },
        ].map((item, i) => (
          <div key={i} style={{
            padding: '6px 10px',
            borderRight: '1px solid var(--border-dim)',
            flex: '0 0 auto',
          }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-bright)' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ flex: 1, padding: 8, minHeight: 0 }}>
        {chartData && chartData.length > 0 ? (
          <CandlestickChart data={chartData} />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            Loading chart data...
          </div>
        )}
      </div>
    </div>
  )
}
