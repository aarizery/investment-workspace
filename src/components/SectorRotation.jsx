import React, { useState } from 'react'
import { fmtPct } from '../lib/dataService'

const SECTOR_ETFS = [
  { symbol: 'XLK', name: 'Technology', color: '#4a9eff' },
  { symbol: 'XLF', name: 'Financials', color: '#f5a623' },
  { symbol: 'XLV', name: 'Healthcare', color: '#00c896' },
  { symbol: 'XLY', name: 'Consumer Disc.', color: '#9b59b6' },
  { symbol: 'XLE', name: 'Energy', color: '#e74c3c' },
  { symbol: 'XLI', name: 'Industrials', color: '#1abc9c' },
  { symbol: 'XLC', name: 'Comm. Svcs', color: '#e67e22' },
  { symbol: 'XLP', name: 'Consumer Stap.', color: '#95a5a6' },
  { symbol: 'XLU', name: 'Utilities', color: '#3498db' },
  { symbol: 'XLRE', name: 'Real Estate', color: '#f39c12' },
  { symbol: 'XLB', name: 'Materials', color: '#27ae60' },
]

export default function SectorRotation({ watchlistData }) {
  const [sort, setSort] = useState('changePct')

  const lookup = {}
  watchlistData.forEach(q => { lookup[q.symbol] = q })

  // Enrich sectors and sort
  const sectors = SECTOR_ETFS
    .map(s => ({
      ...s,
      price: lookup[s.symbol]?.price,
      changePct: lookup[s.symbol]?.changePct ?? null,
      regime: lookup[s.symbol]?.regime ?? 'unknown',
    }))
    .sort((a, b) => {
      if (sort === 'changePct') return (b.changePct ?? -999) - (a.changePct ?? -999)
      return a.name.localeCompare(b.name)
    })

  const maxAbs = Math.max(...sectors.map(s => Math.abs(s.changePct ?? 0)))

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-dim)',
      borderRadius: 'var(--panel-radius)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-dim)',
        background: 'var(--bg-elevated)',
        flexShrink: 0,
      }}>
        <span className="panel-label">Sector Rotation</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['changePct', '% CHG'], ['name', 'A–Z']].map(([k, l]) => (
            <button key={k} onClick={() => setSort(k)} style={{
              fontSize: 9, fontWeight: 700, padding: '2px 6px',
              borderRadius: 2, letterSpacing: '0.06em',
              color: sort === k ? 'var(--accent-orange)' : 'var(--text-muted)',
              background: sort === k ? 'rgba(245,166,35,0.1)' : 'transparent',
              border: sort === k ? '1px solid var(--accent-orange-dim)' : '1px solid transparent',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Bars */}
      <div style={{ overflowY: 'auto', padding: '6px 10px', flex: 1 }}>
        {sectors.map((sec, i) => {
          const pct = sec.changePct
          const positive = (pct ?? 0) >= 0
          const barWidth = maxAbs > 0 ? (Math.abs(pct ?? 0) / maxAbs) * 45 : 0

          return (
            <div key={sec.symbol}
              className="fade-in"
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 60px 100px 50px',
                alignItems: 'center',
                gap: 8,
                padding: '5px 2px',
                borderBottom: '1px solid var(--border-dim)',
                animationDelay: `${i * 30}ms`,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Name */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-bright)' }}>{sec.symbol}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{sec.name}</div>
              </div>

              {/* % change */}
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: positive ? 'var(--green)' : pct != null ? 'var(--red)' : 'var(--text-muted)',
                textAlign: 'right',
              }}>
                {pct != null ? fmtPct(pct) : '--'}
              </span>

              {/* Bar */}
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative', height: 8 }}>
                {/* Center line */}
                <div style={{
                  position: 'absolute', left: '50%', top: 0,
                  width: 1, height: '100%',
                  background: 'var(--border-bright)',
                }} />
                {/* Full track */}
                <div style={{
                  position: 'absolute', left: 0, right: 0, top: '50%',
                  height: 1, background: 'var(--border-dim)',
                  transform: 'translateY(-50%)',
                }} />
                {/* Bar */}
                {pct != null && (
                  <div style={{
                    position: 'absolute',
                    height: 6,
                    width: `${barWidth}%`,
                    borderRadius: 3,
                    background: positive ? 'var(--green)' : 'var(--red)',
                    left: positive ? '50%' : `calc(50% - ${barWidth}%)`,
                    top: '50%', transform: 'translateY(-50%)',
                    transition: 'width 0.4s ease',
                  }} />
                )}
              </div>

              {/* Regime */}
              <span style={{
                fontSize: 9, fontWeight: 700,
                color: {
                  uptrend: 'var(--green)',
                  breakdown: 'var(--red)',
                  transition: 'var(--amber)',
                }[sec.regime] || 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                {sec.regime === 'uptrend' ? 'UP' : sec.regime === 'breakdown' ? 'BREAK' : sec.regime === 'transition' ? 'TRANS' : '--'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{
        padding: '5px 12px',
        borderTop: '1px solid var(--border-dim)',
        display: 'flex', gap: 12,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
          Add XLK, XLF, XLV etc. to watchlist for live data
        </span>
      </div>
    </div>
  )
}
