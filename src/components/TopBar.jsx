import React, { useState, useEffect } from 'react'
import { RefreshCw, Wifi, WifiOff, Bell, Settings, Activity } from 'lucide-react'
import { fmtPct } from '../lib/dataService'

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const utc = time.toUTCString().slice(17, 25)
  const local = time.toLocaleTimeString('en-US', { hour12: false })
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>UTC</span>
      <span style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>{utc}</span>
      <span style={{ color: 'var(--border-bright)' }}>|</span>
      <span style={{ color: 'var(--text-secondary)' }}>{local}</span>
    </div>
  )
}

function TickerTape({ data }) {
  if (!data.length) return null
  const items = [...data, ...data]
  return (
    <div className="ticker-tape-container" style={{ flex: 1, overflow: 'hidden', margin: '0 16px' }}>
      <div className="ticker-tape" style={{ display: 'inline-flex', gap: 32 }}>
        {items.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
            <span style={{ color: 'var(--accent-orange)', fontWeight: 600, fontSize: 11 }}>{item.label || item.symbol}</span>
            <span style={{ color: 'var(--text-bright)', fontWeight: 500 }}>
              {item.price ? Number(item.price).toFixed(2) : '--'}
            </span>
            <span style={{ color: item.changePct >= 0 ? 'var(--green)' : 'var(--red)', fontSize: 11 }}>
              {fmtPct(item.changePct)}
            </span>
            <span style={{ color: 'var(--border-bright)', margin: '0 4px' }}>·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function TopBar({ macroData, lastUpdate, loading, onRefresh }) {
  const marketOpen = (() => {
    const now = new Date()
    const utcH = now.getUTCHours()
    const utcM = now.getUTCMinutes()
    const day = now.getUTCDay()
    if (day === 0 || day === 6) return false
    const mins = utcH * 60 + utcM
    return mins >= 870 && mins <= 1230 // 14:30–20:30 UTC
  })()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      height: 38,
      background: 'var(--bg-base)',
      borderBottom: '1px solid var(--border-dim)',
      padding: '0 12px',
      gap: 12,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{
          width: 22, height: 22,
          background: 'var(--accent-orange)',
          borderRadius: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Activity size={13} color="#000" strokeWidth={2.5} />
        </div>
        <span style={{
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: '0.08em',
          color: 'var(--text-white)',
        }}>ATLASIO</span>
        <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>WORKSPACE</span>
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--border-dim)' }} />

      {/* Ticker */}
      <TickerTape data={macroData} />

      <div style={{ width: 1, height: 20, background: 'var(--border-dim)' }} />

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <Clock />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: marketOpen ? 'var(--green)' : 'var(--red)',
            boxShadow: marketOpen ? '0 0 6px var(--green)' : 'none',
          }} />
          <span style={{ fontSize: 10, color: marketOpen ? 'var(--green)' : 'var(--red)' }}>
            {marketOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
          </span>
        </div>

        {lastUpdate && (
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            UPD {lastUpdate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}

        <button
          onClick={onRefresh}
          style={{ color: 'var(--text-dim)', padding: 4, borderRadius: 2 }}
          title="Refresh data"
        >
          <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>

        <Bell size={12} style={{ color: 'var(--text-dim)', cursor: 'pointer' }} />
        <Settings size={12} style={{ color: 'var(--text-dim)', cursor: 'pointer' }} />
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
