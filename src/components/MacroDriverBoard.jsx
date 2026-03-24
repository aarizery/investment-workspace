import React, { useState } from 'react'
import { fmt, fmtPct } from '../lib/dataService'
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react'

function RegimeBadge({ regime }) {
  if (!regime || regime === 'unknown') return <span style={{ color: 'var(--text-muted)' }}>—</span>
  const map = {
    uptrend: { label: 'Uptrend', cls: 'uptrend' },
    breakdown: { label: 'Breakdown', cls: 'breakdown' },
    transition: { label: 'Transition', cls: 'transition' },
    ranging: { label: 'Ranging', cls: 'ranging' },
  }
  const r = map[regime] || { label: regime, cls: 'ranging' }
  return <span className={`regime-badge ${r.cls}`}>{r.label}</span>
}

function MiniSparkbar({ changePct }) {
  const w = Math.min(48, Math.abs(changePct || 0) * 8)
  const positive = (changePct || 0) >= 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: 48, height: 4, background: 'var(--border-dim)', borderRadius: 2, overflow: 'hidden'
      }}>
        <div style={{
          width: `${w}px`, height: '100%',
          background: positive ? 'var(--green)' : 'var(--red)',
          borderRadius: 2,
          marginLeft: positive ? 0 : `${48 - w}px`,
        }} />
      </div>
    </div>
  )
}

const CATEGORY_COLORS = {
  equity: 'var(--accent-blue)',
  commodity: 'var(--accent-yellow)',
  energy: 'var(--accent-orange)',
  rates: 'var(--accent-cyan)',
  fx: 'var(--text-secondary)',
  crypto: '#9b59b6',
  volatility: 'var(--red)',
}

export default function MacroDriverBoard({ data, onSelectLinked }) {
  const [sortKey, setSortKey] = useState('category')
  const [expanded, setExpanded] = useState(true)

  const headers = [
    { key: 'label', label: 'Asset', w: 100 },
    { key: 'price', label: 'Last', w: 80 },
    { key: 'changePct', label: 'Chg%', w: 80 },
    { key: 'regime', label: 'Regime', w: 100 },
    { key: 'sr', label: 'S&R', w: 120 },
    { key: 'linked', label: 'Linked', w: 60 },
    { key: 'bar', label: '', w: 60 },
  ]

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-dim)',
      borderRadius: 'var(--panel-radius)',
      overflow: 'hidden',
      flex: 1,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-dim)',
        background: 'var(--bg-elevated)',
      }}>
        <span className="panel-label">Macro Driver Board</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{data.length} assets</span>
          <button onClick={() => setExpanded(!expanded)} style={{ color: 'var(--text-muted)' }}>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: headers.map(h => `${h.w}px`).join(' '),
            padding: '6px 12px',
            borderBottom: '1px solid var(--border-dim)',
            background: 'var(--bg-elevated)',
          }}>
            {headers.map(h => (
              <span key={h.key} style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: sortKey === h.key ? 'var(--accent-orange)' : 'var(--text-muted)',
                textTransform: 'uppercase',
                cursor: h.key !== 'bar' && h.key !== 'sr' ? 'pointer' : 'default',
              }} onClick={() => h.key !== 'bar' && h.key !== 'sr' && setSortKey(h.key)}>
                {h.label}
              </span>
            ))}
          </div>

          {/* Rows */}
          <div style={{ overflowY: 'auto', maxHeight: 280 }}>
            {data.map((item, i) => {
              const up = (item.changePct || 0) >= 0
              return (
                <div key={item.symbol}
                  className="fade-in"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: headers.map(h => `${h.w}px`).join(' '),
                    padding: '7px 12px',
                    borderBottom: '1px solid var(--border-dim)',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background var(--transition)',
                    animationDelay: `${i * 30}ms`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Asset */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 3, height: 20, borderRadius: 2,
                      background: CATEGORY_COLORS[item.category] || 'var(--text-muted)',
                    }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-bright)' }}>{item.label}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                        {item.category?.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Last */}
                  <span style={{ color: 'var(--text-bright)', fontWeight: 500 }}>
                    {fmt(item.price)}
                  </span>

                  {/* Change */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {up ? <TrendingUp size={11} color="var(--green)" /> : <TrendingDown size={11} color="var(--red)" />}
                    <span style={{ color: up ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                      {fmtPct(item.changePct)}
                    </span>
                  </div>

                  {/* Regime */}
                  <RegimeBadge regime={item.regime} />

                  {/* S&R */}
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {item.support ? `${item.support} / ${item.resistance}` : '--'}
                  </span>

                  {/* Linked */}
                  <button
                    onClick={() => onSelectLinked && onSelectLinked(item.linked)}
                    style={{
                      fontSize: 11, fontWeight: 600,
                      color: 'var(--accent-cyan)',
                      padding: '2px 6px',
                      border: '1px solid var(--accent-cyan-dim)',
                      borderRadius: 2,
                      background: 'rgba(0,212,212,0.06)',
                      cursor: 'pointer',
                    }}
                  >
                    {item.linked}
                  </button>

                  {/* Bar */}
                  <MiniSparkbar changePct={item.changePct} />
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
