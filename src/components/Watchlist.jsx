import React, { useState } from 'react'
import { fmt, fmtPct } from '../lib/dataService'
import { Plus, X, Search, ArrowUpDown, ScanLine } from 'lucide-react'

function RegimeTag({ regime }) {
  const map = {
    uptrend: { color: 'var(--regime-uptrend)', label: 'Up' },
    breakdown: { color: 'var(--regime-breakdown)', label: 'Break' },
    transition: { color: 'var(--regime-transition)', label: 'Trans' },
    ranging: { color: 'var(--regime-ranging)', label: 'Range' },
  }
  const r = map[regime] || { color: 'var(--text-muted)', label: '?' }
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, color: r.color,
      padding: '1px 5px', borderRadius: 2,
      background: `${r.color}18`,
      border: `1px solid ${r.color}30`,
    }}>{r.label}</span>
  )
}

function BiasBar({ bias }) {
  const abs = Math.abs(bias || 0)
  const pos = (bias || 0) >= 0
  const width = Math.min(40, abs * 2)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{
        fontSize: 11, fontWeight: 700, minWidth: 28, textAlign: 'right',
        color: pos ? 'var(--green)' : 'var(--red)',
      }}>
        {pos ? '+' : ''}{bias}
      </span>
      <div style={{ width: 40, height: 4, background: 'var(--border-dim)', borderRadius: 2, position: 'relative' }}>
        <div style={{
          position: 'absolute',
          height: '100%',
          width: `${width}px`,
          background: pos ? 'var(--green)' : 'var(--red)',
          borderRadius: 2,
          left: pos ? '50%' : `calc(50% - ${width}px)`,
        }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, width: 1, height: '100%', background: 'var(--border-bright)' }} />
      </div>
    </div>
  )
}

export default function Watchlist({ data, watchlist, focusSymbol, onSelectFocus, onAdd, onRemove }) {
  const [input, setInput] = useState(watchlist.join(','))
  const [editMode, setEditMode] = useState(false)
  const [sortBy, setSortBy] = useState('symbol')
  const [sortDir, setSortDir] = useState(1)

  const handleSort = (key) => {
    if (sortBy === key) setSortDir(d => -d)
    else { setSortBy(key); setSortDir(1) }
  }

  const sorted = [...data].sort((a, b) => {
    const av = a[sortBy] ?? ''
    const bv = b[sortBy] ?? ''
    if (typeof av === 'string') return av.localeCompare(bv) * sortDir
    return (av - bv) * sortDir
  })

  const applyEdit = () => {
    const syms = input.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
    syms.forEach(s => {
      if (!watchlist.includes(s)) onAdd(s)
    })
    watchlist.forEach(s => {
      if (!syms.includes(s)) onRemove(s)
    })
    setEditMode(false)
  }

  const cols = [
    { key: 'symbol', label: 'Ticker', w: '70px' },
    { key: 'price', label: 'Last', w: '70px' },
    { key: 'changePct', label: 'Chg%', w: '70px' },
    { key: 'regime', label: 'Regime', w: '72px' },
    { key: 'support', label: 'Support', w: '68px' },
    { key: 'resistance', label: 'Resist.', w: '68px' },
    { key: 'impact', label: 'Impact', w: '60px' },
    { key: 'bias', label: 'Bias', w: '90px' },
    { key: '_del', label: '', w: '24px' },
  ]

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-dim)',
      borderRadius: 'var(--panel-radius)',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-dim)',
        background: 'var(--bg-elevated)',
      }}>
        <span className="panel-label">Watchlist</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setEditMode(!editMode)}
            style={{
              fontSize: 10, fontWeight: 600, color: editMode ? 'var(--accent-orange)' : 'var(--text-dim)',
              padding: '2px 8px', border: '1px solid var(--border-default)',
              borderRadius: 2, background: editMode ? 'rgba(245,166,35,0.1)' : 'transparent',
            }}
          >
            {editMode ? 'APPLY' : 'EDIT'}
          </button>
          <button
            style={{
              fontSize: 10, fontWeight: 600, color: 'var(--accent-cyan)',
              padding: '2px 8px', border: '1px solid var(--accent-cyan-dim)',
              borderRadius: 2, background: 'rgba(0,212,212,0.06)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <ScanLine size={10} /> SCAN
          </button>
        </div>
      </div>

      {/* Ticker input */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-dim)', background: 'var(--bg-elevated)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={11} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyEdit()}
            placeholder="AAPL,NVDA,MSFT,TSLA..."
            style={{
              width: '100%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-bright)',
              fontSize: 11,
              padding: '5px 8px 5px 26px',
              borderRadius: 2,
              outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-orange)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
          />
        </div>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: cols.map(c => c.w).join(' '),
        padding: '5px 12px',
        borderBottom: '1px solid var(--border-dim)',
        background: 'var(--bg-elevated)',
        gap: 4,
      }}>
        {cols.map(c => (
          <span key={c.key}
            onClick={() => c.key !== '_del' && handleSort(c.key)}
            style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: sortBy === c.key ? 'var(--accent-orange)' : 'var(--text-muted)',
              cursor: c.key !== '_del' ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', gap: 2,
            }}>
            {c.label}
            {sortBy === c.key && <ArrowUpDown size={9} />}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {sorted.map((item, i) => {
          const isFocus = item.symbol === focusSymbol
          const up = (item.changePct || 0) >= 0
          return (
            <div key={item.symbol}
              className="fade-in"
              onClick={() => onSelectFocus(item.symbol)}
              style={{
                display: 'grid',
                gridTemplateColumns: cols.map(c => c.w).join(' '),
                padding: '6px 12px',
                borderBottom: '1px solid var(--border-dim)',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                background: isFocus ? 'rgba(245,166,35,0.06)' : 'transparent',
                borderLeft: isFocus ? '2px solid var(--accent-orange)' : '2px solid transparent',
                transition: 'all var(--transition)',
                animationDelay: `${i * 25}ms`,
              }}
              onMouseEnter={e => !isFocus && (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => !isFocus && (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontWeight: 700, color: isFocus ? 'var(--accent-orange)' : 'var(--text-bright)', fontSize: 12 }}>
                {item.symbol}
              </span>
              <span style={{ color: 'var(--text-bright)', fontWeight: 500 }}>{fmt(item.price)}</span>
              <span style={{ color: up ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                {fmtPct(item.changePct)}
              </span>
              <RegimeTag regime={item.regime} />
              <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{item.support || '--'}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{item.resistance || '--'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.impact || '--'}</span>
                <div style={{
                  width: Math.min(20, (item.impact || 0) / 5), height: 3,
                  background: 'var(--accent-blue)', borderRadius: 2,
                }} />
              </div>
              <BiasBar bias={item.bias} />
              <button
                onClick={e => { e.stopPropagation(); onRemove(item.symbol) }}
                style={{ color: 'var(--text-muted)', padding: 2, borderRadius: 2 }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <X size={11} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
