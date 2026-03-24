import React, { useState } from 'react'
import { fmt, fmtPct, fmtLarge } from '../lib/dataService'
import { Plus, X, TrendingUp, TrendingDown } from 'lucide-react'

let posId = 1

export default function PortfolioTracker({ watchlistData }) {
  const [positions, setPositions] = useState([
    { id: posId++, symbol: 'AAPL', qty: 100, avgCost: 210.00 },
    { id: posId++, symbol: 'NVDA', qty: 50, avgCost: 140.00 },
    { id: posId++, symbol: 'MSFT', qty: 30, avgCost: 370.00 },
  ])
  const [form, setForm] = useState({ symbol: '', qty: '', cost: '' })
  const [showAdd, setShowAdd] = useState(false)
  const [minimized, setMinimized] = useState(false)

  const lookup = {}
  watchlistData.forEach(q => { lookup[q.symbol] = q })

  const enriched = positions.map(p => {
    const q = lookup[p.symbol]
    const currentPrice = q?.price ?? null
    const marketValue = currentPrice ? currentPrice * p.qty : null
    const costBasis = p.avgCost * p.qty
    const pnl = marketValue != null ? marketValue - costBasis : null
    const pnlPct = costBasis > 0 && pnl != null ? (pnl / costBasis) * 100 : null
    return { ...p, currentPrice, marketValue, costBasis, pnl, pnlPct, changePct: q?.changePct }
  })

  const totalValue = enriched.reduce((s, p) => s + (p.marketValue ?? p.costBasis), 0)
  const totalCost = enriched.reduce((s, p) => s + p.costBasis, 0)
  const totalPnL = enriched.reduce((s, p) => s + (p.pnl ?? 0), 0)
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0

  const addPosition = () => {
    if (!form.symbol || !form.qty || !form.cost) return
    setPositions(p => [...p, {
      id: posId++,
      symbol: form.symbol.toUpperCase(),
      qty: parseFloat(form.qty),
      avgCost: parseFloat(form.cost),
    }])
    setForm({ symbol: '', qty: '', cost: '' })
    setShowAdd(false)
  }

  const removePosition = (id) => setPositions(p => p.filter(x => x.id !== id))

  const inputStyle = {
    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
    color: 'var(--text-bright)', fontSize: 11, padding: '4px 6px',
    borderRadius: 2, outline: 'none', width: '100%',
  }

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-dim)',
      borderRadius: 'var(--panel-radius)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px', borderBottom: '1px solid var(--border-dim)',
        background: 'var(--bg-elevated)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="panel-label">Portfolio</span>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: totalPnL >= 0 ? 'var(--green)' : 'var(--red)',
          }}>
            {totalPnL >= 0 ? '+' : ''}{fmtLarge(totalPnL)} ({fmtPct(totalPnLPct)})
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => setShowAdd(!showAdd)} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 9, fontWeight: 700, color: 'var(--accent-cyan)',
            border: '1px solid var(--accent-cyan-dim)', padding: '2px 6px',
            borderRadius: 2, background: 'rgba(0,212,212,0.06)',
          }}>
            <Plus size={9} /> ADD
          </button>
          <button onClick={() => setMinimized(!minimized)} style={{ color: 'var(--text-muted)' }}>
            {minimized ? '▸' : '▾'}
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Summary row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            borderBottom: '1px solid var(--border-dim)',
            flexShrink: 0,
          }}>
            {[
              { label: 'Portfolio Value', value: `$${fmtLarge(totalValue)}` },
              { label: 'Total Cost', value: `$${fmtLarge(totalCost)}` },
              { label: 'Total P&L', value: `${totalPnL >= 0 ? '+' : ''}$${fmtLarge(totalPnL)}`, color: totalPnL >= 0 ? 'var(--green)' : 'var(--red)' },
              { label: 'Return', value: fmtPct(totalPnLPct), color: totalPnLPct >= 0 ? 'var(--green)' : 'var(--red)' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '6px 10px',
                borderRight: i < 3 ? '1px solid var(--border-dim)' : 'none',
              }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: item.color || 'var(--text-bright)' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Add form */}
          {showAdd && (
            <div style={{
              padding: 10, borderBottom: '1px solid var(--border-dim)',
              background: 'var(--bg-card)',
              display: 'grid', gridTemplateColumns: '80px 80px 90px auto',
              gap: 6, alignItems: 'flex-end',
            }}>
              <div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 3 }}>SYMBOL</div>
                <input style={inputStyle} value={form.symbol} placeholder="AAPL"
                  onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} />
              </div>
              <div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 3 }}>SHARES</div>
                <input style={inputStyle} value={form.qty} placeholder="100" type="number"
                  onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} />
              </div>
              <div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 3 }}>AVG COST</div>
                <input style={inputStyle} value={form.cost} placeholder="210.00" type="number"
                  onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
              </div>
              <button onClick={addPosition} style={{
                padding: '5px 12px', background: 'var(--accent-orange)',
                color: '#000', fontWeight: 700, fontSize: 10, borderRadius: 2,
              }}>ADD</button>
            </div>
          )}

          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '55px 45px 65px 65px 75px 75px 55px 28px',
            padding: '4px 10px', borderBottom: '1px solid var(--border-dim)',
            background: 'var(--bg-elevated)', gap: 4,
          }}>
            {['SYMBOL', 'QTY', 'COST', 'PRICE', 'MKT VAL', 'P&L', 'CHG%', ''].map((h, i) => (
              <span key={i} style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                color: 'var(--text-muted)', textTransform: 'uppercase',
              }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div style={{ overflowY: 'auto', maxHeight: 180 }}>
            {enriched.map((p, i) => {
              const pnlUp = (p.pnl ?? 0) >= 0
              const dayUp = (p.changePct ?? 0) >= 0
              return (
                <div key={p.id}
                  className="fade-in"
                  style={{
                    display: 'grid', gridTemplateColumns: '55px 45px 65px 65px 75px 75px 55px 28px',
                    padding: '5px 10px', borderBottom: '1px solid var(--border-dim)',
                    alignItems: 'center', gap: 4,
                    animationDelay: `${i * 30}ms`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 700, color: 'var(--accent-orange)', fontSize: 11 }}>{p.symbol}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{p.qty}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>${fmt(p.avgCost)}</span>
                  <span style={{ color: 'var(--text-bright)', fontSize: 11 }}>
                    {p.currentPrice ? `$${fmt(p.currentPrice)}` : '--'}
                  </span>
                  <span style={{ color: 'var(--text-bright)', fontSize: 11 }}>
                    {p.marketValue ? `$${fmtLarge(p.marketValue)}` : '--'}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 11, color: pnlUp ? 'var(--green)' : 'var(--red)' }}>
                    {p.pnl != null ? `${pnlUp ? '+' : ''}$${fmtLarge(p.pnl)}` : '--'}
                  </span>
                  <span style={{ fontSize: 11, color: dayUp ? 'var(--green)' : 'var(--red)' }}>
                    {p.changePct != null ? fmtPct(p.changePct) : '--'}
                  </span>
                  <button onClick={() => removePosition(p.id)}
                    style={{ color: 'var(--text-muted)', padding: 2 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <X size={10} />
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
