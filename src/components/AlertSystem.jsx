import React, { useState, useEffect, useCallback } from 'react'
import { Bell, BellOff, Plus, X, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react'

const ALERT_TYPES = [
  { key: 'price_above', label: 'Price >' },
  { key: 'price_below', label: 'Price <' },
  { key: 'change_pct_above', label: 'Change% >' },
  { key: 'change_pct_below', label: 'Change% <' },
  { key: 'regime_change', label: 'Regime Changes' },
]

function checkAlert(alert, quote) {
  if (!quote || quote.symbol !== alert.symbol) return false
  switch (alert.type) {
    case 'price_above': return quote.price >= alert.value
    case 'price_below': return quote.price <= alert.value
    case 'change_pct_above': return quote.changePct >= alert.value
    case 'change_pct_below': return quote.changePct <= alert.value
    case 'regime_change': return alert.lastRegime && alert.lastRegime !== quote.regime
    default: return false
  }
}

let alertIdCounter = 1

export default function AlertSystem({ watchlistData, focusSymbol }) {
  const [alerts, setAlerts] = useState([])
  const [triggered, setTriggered] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ symbol: focusSymbol || '', type: 'price_above', value: '' })
  const [notifPerm, setNotifPerm] = useState('default')
  const [minimized, setMinimized] = useState(false)

  useEffect(() => {
    if ('Notification' in window) setNotifPerm(Notification.permission)
  }, [])

  const requestNotif = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission()
      setNotifPerm(perm)
    }
  }

  // Check alerts against live data
  useEffect(() => {
    if (!watchlistData.length) return
    setAlerts(prev => prev.map(alert => {
      const quote = watchlistData.find(q => q.symbol === alert.symbol)
      if (!quote) return alert
      const fires = checkAlert(alert, quote)

      if (fires && !alert.fired) {
        const msg = `${alert.symbol}: ${ALERT_TYPES.find(t => t.key === alert.type)?.label} ${alert.value ?? ''}`
        setTriggered(t => [{ id: alert.id, msg, time: new Date(), symbol: alert.symbol }, ...t].slice(0, 20))
        if (notifPerm === 'granted') {
          new Notification('Atlasio Alert', { body: msg, icon: '/favicon.ico' })
        }
        return { ...alert, fired: true, firedAt: new Date(), lastRegime: quote.regime }
      }
      // Track regime for regime_change alerts
      if (alert.type === 'regime_change') {
        return { ...alert, lastRegime: quote.regime, fired: false }
      }
      return alert
    }))
  }, [watchlistData, notifPerm])

  const addAlert = () => {
    if (!form.symbol) return
    const newAlert = {
      id: alertIdCounter++,
      symbol: form.symbol.toUpperCase(),
      type: form.type,
      value: form.type === 'regime_change' ? null : parseFloat(form.value),
      fired: false,
      createdAt: new Date(),
      lastRegime: null,
    }
    setAlerts(a => [...a, newAlert])
    setShowAdd(false)
    setForm({ symbol: focusSymbol || '', type: 'price_above', value: '' })
  }

  const removeAlert = (id) => setAlerts(a => a.filter(x => x.id !== id))
  const clearTriggered = () => setTriggered([])

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="panel-label">Alert System</span>
          {alerts.filter(a => a.fired).length > 0 && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '1px 5px',
              background: 'var(--red)', color: '#fff', borderRadius: 2,
            }}>
              {alerts.filter(a => a.fired).length} FIRED
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {notifPerm !== 'granted' && (
            <button onClick={requestNotif} style={{
              fontSize: 9, color: 'var(--amber)', border: '1px solid var(--amber)',
              padding: '2px 6px', borderRadius: 2, background: 'rgba(245,166,35,0.08)',
            }}>
              ENABLE NOTIFS
            </button>
          )}
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
          {/* Add alert form */}
          {showAdd && (
            <div style={{
              padding: 10, borderBottom: '1px solid var(--border-dim)',
              background: 'var(--bg-card)',
              display: 'flex', gap: 6, alignItems: 'flex-end', flexWrap: 'wrap',
            }}>
              <div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 3 }}>SYMBOL</div>
                <input value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))}
                  placeholder="AAPL"
                  style={{
                    width: 60, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    color: 'var(--text-bright)', fontSize: 11, padding: '4px 6px', borderRadius: 2, outline: 'none',
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 3 }}>TYPE</div>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    color: 'var(--text-bright)', fontSize: 11, padding: '4px 6px', borderRadius: 2,
                    outline: 'none',
                  }}
                >
                  {ALERT_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              {form.type !== 'regime_change' && (
                <div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 3 }}>VALUE</div>
                  <input value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                    placeholder="250.00"
                    type="number"
                    style={{
                      width: 80, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                      color: 'var(--text-bright)', fontSize: 11, padding: '4px 6px', borderRadius: 2, outline: 'none',
                    }}
                  />
                </div>
              )}
              <button onClick={addAlert} style={{
                padding: '5px 12px', background: 'var(--accent-orange)', color: '#000',
                fontWeight: 700, fontSize: 10, borderRadius: 2, letterSpacing: '0.06em',
              }}>
                SET
              </button>
            </div>
          )}

          {/* Active alerts */}
          <div style={{ overflowY: 'auto', maxHeight: 160 }}>
            {alerts.length === 0 && (
              <div style={{ padding: '12px 12px', color: 'var(--text-muted)', fontSize: 11, textAlign: 'center' }}>
                No alerts set
              </div>
            )}
            {alerts.map(alert => {
              const quote = watchlistData.find(q => q.symbol === alert.symbol)
              const typeLabel = ALERT_TYPES.find(t => t.key === alert.type)?.label
              return (
                <div key={alert.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '5px 12px',
                  borderBottom: '1px solid var(--border-dim)',
                  background: alert.fired ? 'rgba(245,166,35,0.05)' : 'transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {alert.fired
                      ? <CheckCircle size={11} color="var(--accent-orange)" />
                      : <Bell size={11} color="var(--text-muted)" />
                    }
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-bright)' }}>{alert.symbol}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{typeLabel}</span>
                    {alert.value != null && (
                      <span style={{ fontSize: 10, color: 'var(--accent-orange)' }}>{alert.value}</span>
                    )}
                    {quote && (
                      <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                        now: {Number(quote.price || 0).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <button onClick={() => removeAlert(alert.id)} style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <X size={11} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Triggered log */}
          {triggered.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-dim)' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '4px 12px', background: 'var(--bg-elevated)',
              }}>
                <span style={{ fontSize: 9, color: 'var(--accent-orange)', fontWeight: 700, letterSpacing: '0.06em' }}>
                  TRIGGERED LOG
                </span>
                <button onClick={clearTriggered} style={{ fontSize: 9, color: 'var(--text-muted)' }}>CLEAR</button>
              </div>
              <div style={{ maxHeight: 80, overflowY: 'auto' }}>
                {triggered.map(t => (
                  <div key={t.id} style={{
                    padding: '4px 12px',
                    borderBottom: '1px solid var(--border-dim)',
                    display: 'flex', gap: 8, alignItems: 'center',
                  }}>
                    <AlertTriangle size={10} color="var(--accent-orange)" />
                    <span style={{ fontSize: 10, color: 'var(--accent-orange)' }}>{t.msg}</span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      {t.time.toLocaleTimeString('en-US', { hour12: false })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
