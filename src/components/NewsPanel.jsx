import React, { useState } from 'react'
import { fmtDate } from '../lib/dataService'
import { ExternalLink, Newspaper, Radio, ChevronDown } from 'lucide-react'

const SIGNAL_KEYWORDS = {
  bullish: ['buyback', 'upgrade', 'beat', 'rally', 'surge', 'gain', 'outperform', 'strong', 'record', 'high'],
  bearish: ['downgrade', 'miss', 'decline', 'drop', 'fall', 'weak', 'loss', 'cut', 'warning', 'concern', 'tariff'],
}

function classifySignal(title) {
  const lower = title.toLowerCase()
  const bull = SIGNAL_KEYWORDS.bullish.filter(k => lower.includes(k)).length
  const bear = SIGNAL_KEYWORDS.bearish.filter(k => lower.includes(k)).length
  if (bull > bear) return 'bullish'
  if (bear > bull) return 'bearish'
  return 'neutral'
}

function NewsItem({ item, i }) {
  const signal = classifySignal(item.title)
  const colors = { bullish: 'var(--green)', bearish: 'var(--red)', neutral: 'var(--accent-orange)' }
  const color = colors[signal]

  return (
    <div
      className="fade-in"
      style={{
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-dim)',
        cursor: 'pointer',
        animationDelay: `${i * 40}ms`,
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      onClick={() => item.link && window.open(item.link, '_blank')}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <div style={{
          width: 3, height: 36, borderRadius: 2, flexShrink: 0,
          background: color, marginTop: 2,
        }} />
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 11, lineHeight: 1.4,
            color: 'var(--text-primary)',
            marginBottom: 4,
          }}>
            {item.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {item.publisher && (
              <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {item.publisher}
              </span>
            )}
            {item.time && (
              <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                {fmtDate(item.time)}
              </span>
            )}
            <span style={{
              fontSize: 9, fontWeight: 700,
              color, textTransform: 'uppercase',
              padding: '1px 4px',
              border: `1px solid ${color}30`,
              borderRadius: 2,
              background: `${color}10`,
            }}>
              {signal}
            </span>
          </div>
        </div>
        <ExternalLink size={10} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
      </div>
    </div>
  )
}

export default function NewsPanel({ news }) {
  const [tab, setTab] = useState('news')

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
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-dim)',
        background: 'var(--bg-elevated)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { key: 'news', icon: Newspaper, label: 'Market News' },
            { key: 'macro', icon: Radio, label: 'Macro Events' },
          ].map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px',
              fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: tab === key ? 'var(--accent-orange)' : 'var(--text-muted)',
              borderBottom: tab === key ? '2px solid var(--accent-orange)' : '2px solid transparent',
              marginBottom: -1,
            }}>
              <Icon size={10} /> {label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="pulse-dot" />
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>LIVE</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {tab === 'news' && (
          news.length > 0
            ? news.map((item, i) => <NewsItem key={i} item={item} i={i} />)
            : (
              <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 11, textAlign: 'center' }}>
                Loading news...
              </div>
            )
        )}
        {tab === 'macro' && (
          <MacroEvents />
        )}
      </div>
    </div>
  )
}

function MacroEvents() {
  const events = [
    { date: 'WED', time: '08:30', name: 'US CPI MoM', prior: '0.2%', forecast: '0.3%', impact: 'HIGH' },
    { date: 'WED', time: '14:00', name: 'FOMC Minutes', prior: '--', forecast: '--', impact: 'HIGH' },
    { date: 'THU', time: '08:30', name: 'Initial Jobless Claims', prior: '219K', forecast: '222K', impact: 'MED' },
    { date: 'THU', time: '10:00', name: 'Philly Fed Index', prior: '-4.0', forecast: '-5.0', impact: 'MED' },
    { date: 'FRI', time: '08:30', name: 'Retail Sales MoM', prior: '-0.9%', forecast: '0.6%', impact: 'HIGH' },
    { date: 'FRI', time: '09:15', name: 'Industrial Production', prior: '-0.1%', forecast: '0.2%', impact: 'MED' },
    { date: 'FRI', time: '10:00', name: 'Consumer Sentiment', prior: '57.9', forecast: '58.5', impact: 'LOW' },
  ]
  const impactColor = { HIGH: 'var(--red)', MED: 'var(--accent-orange)', LOW: 'var(--accent-blue)' }

  return (
    <div>
      {events.map((e, i) => (
        <div key={i} style={{
          display: 'grid',
          gridTemplateColumns: '32px 44px 1fr 60px 60px 44px',
          padding: '7px 12px',
          borderBottom: '1px solid var(--border-dim)',
          alignItems: 'center',
          gap: 8,
        }}
          onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent-orange)' }}>{e.date}</span>
          <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{e.time}</span>
          <span style={{ fontSize: 11, color: 'var(--text-primary)' }}>{e.name}</span>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>PRIOR</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{e.prior}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>EST</div>
            <div style={{ fontSize: 11, color: 'var(--accent-blue)' }}>{e.forecast}</div>
          </div>
          <span style={{
            fontSize: 9, fontWeight: 700,
            color: impactColor[e.impact],
            padding: '1px 5px',
            border: `1px solid ${impactColor[e.impact]}40`,
            borderRadius: 2,
            background: `${impactColor[e.impact]}10`,
            textAlign: 'center',
          }}>
            {e.impact}
          </span>
        </div>
      ))}
    </div>
  )
}
