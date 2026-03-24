import React from 'react'
import { fmt, fmtPct, fmtLarge } from '../lib/dataService'
import { TrendingUp, TrendingDown, AlertTriangle, BarChart2, Target } from 'lucide-react'

function MetricRow({ label, value, highlight }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '5px 0',
      borderBottom: '1px solid var(--border-dim)',
    }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{ fontSize: 11, fontWeight: 600, color: highlight || 'var(--text-bright)' }}>
        {value}
      </span>
    </div>
  )
}

function RegimeMeter({ regime }) {
  const score = { uptrend: 85, transition: 50, breakdown: 15, ranging: 40 }[regime] || 50
  const color = { uptrend: 'var(--green)', transition: 'var(--amber)', breakdown: 'var(--red)', ranging: 'var(--accent-blue)' }[regime] || 'var(--text-muted)'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Regime Score</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{score}/100</span>
      </div>
      <div style={{ height: 6, background: 'var(--border-dim)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${score}%`,
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          borderRadius: 3,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
        <span style={{ fontSize: 9, color: 'var(--red)' }}>BREAK</span>
        <span style={{ fontSize: 9, color: 'var(--amber)' }}>TRANS</span>
        <span style={{ fontSize: 9, color: 'var(--green)' }}>TREND</span>
      </div>
    </div>
  )
}

function BiasGauge({ bias }) {
  const norm = Math.max(-20, Math.min(20, bias || 0))
  const pct = ((norm + 20) / 40) * 100
  const color = norm >= 3 ? 'var(--green)' : norm <= -3 ? 'var(--red)' : 'var(--text-secondary)'
  const label = norm >= 5 ? 'BULLISH' : norm >= 2 ? 'MILD BULL' : norm <= -5 ? 'BEARISH' : norm <= -2 ? 'MILD BEAR' : 'NEUTRAL'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bias Signal</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{label}</span>
      </div>
      <div style={{ height: 6, background: 'var(--border-dim)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', left: '50%', top: 0,
          width: 1, height: '100%', background: 'var(--border-bright)',
        }} />
        <div style={{
          height: '100%',
          width: `${Math.abs(norm) / 20 * 50}%`,
          background: color,
          borderRadius: 3,
          position: 'absolute',
          left: norm >= 0 ? '50%' : `${50 - Math.abs(norm) / 20 * 50}%`,
          transition: 'all 0.5s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
        <span style={{ fontSize: 9, color: 'var(--red)' }}>BEAR</span>
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>NEUT</span>
        <span style={{ fontSize: 9, color: 'var(--green)' }}>BULL</span>
      </div>
    </div>
  )
}

export default function StockDetail({ quote }) {
  if (!quote) return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-dim)',
      borderRadius: 'var(--panel-radius)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, color: 'var(--text-muted)', fontSize: 11,
    }}>
      No stock selected
    </div>
  )

  const relVol = quote.volume && quote.avgVolume ? (quote.volume / quote.avgVolume) : null

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
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-dim)',
        background: 'var(--bg-elevated)',
      }}>
        <span className="panel-label">Stock Detail — {quote.symbol}</span>
      </div>

      <div style={{ padding: '10px 12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Key metrics */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--accent-orange)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 6, textTransform: 'uppercase' }}>
            Key Metrics
          </div>
          <MetricRow label="Market Cap" value={fmtLarge(quote.marketCap)} />
          <MetricRow label="P/E Ratio" value={quote.pe ? Number(quote.pe).toFixed(1) : '--'} />
          <MetricRow label="EPS (TTM)" value={fmt(quote.eps)} />
          <MetricRow label="Rel. Volume"
            value={relVol ? `${relVol.toFixed(2)}x` : '--'}
            highlight={relVol > 1.5 ? 'var(--accent-orange)' : undefined}
          />
          <MetricRow label="52W High" value={fmt(quote.week52High)} />
          <MetricRow label="52W Low" value={fmt(quote.week52Low)} />
          <MetricRow label="MA50" value={fmt(quote.ma50)} highlight={quote.price > quote.ma50 ? 'var(--green)' : 'var(--red)'} />
          <MetricRow label="MA200" value={fmt(quote.ma200)} highlight={quote.price > quote.ma200 ? 'var(--green)' : 'var(--red)'} />
        </div>

        {/* Regime */}
        <RegimeMeter regime={quote.regime} />

        {/* Bias */}
        <BiasGauge bias={quote.bias} />

        {/* Support / Resistance */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--accent-orange)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 6, textTransform: 'uppercase' }}>
            S&R Levels
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
          }}>
            <div style={{
              padding: '8px', background: 'rgba(0,200,150,0.06)',
              border: '1px solid rgba(0,200,150,0.15)', borderRadius: 2,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 9, color: 'var(--green)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Support</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>{quote.support || '--'}</div>
            </div>
            <div style={{
              padding: '8px',
              background: 'rgba(255,69,96,0.06)',
              border: '1px solid rgba(255,69,96,0.15)', borderRadius: 2,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 9, color: 'var(--red)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Resistance</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--red)' }}>{quote.resistance || '--'}</div>
            </div>
          </div>
        </div>

        {/* Signal summary */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--accent-orange)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 6, textTransform: 'uppercase' }}>
            Analyst Summary
          </div>
          <div style={{
            fontSize: 11, lineHeight: 1.6, color: 'var(--text-secondary)',
            background: 'var(--bg-card)', padding: 10, borderRadius: 2,
            border: '1px solid var(--border-dim)',
          }}>
            {quote.regime === 'uptrend' && `${quote.symbol} is in a confirmed uptrend with price above both MA50 and MA200. Momentum is ${(quote.changePct || 0) > 0 ? 'positive' : 'fading'}. Watch ${quote.resistance} as key resistance.`}
            {quote.regime === 'breakdown' && `${quote.symbol} is in breakdown with price below key moving averages. Bias is bearish. Monitor ${quote.support} as critical support.`}
            {quote.regime === 'transition' && `${quote.symbol} is in transition — mixed signals between MA50 and MA200. Directional bias is unclear. Range: ${quote.support}–${quote.resistance}.`}
            {(!quote.regime || quote.regime === 'ranging') && `${quote.symbol} is ranging. No clear directional bias. Watch for breakout above ${quote.resistance} or breakdown below ${quote.support}.`}
          </div>
        </div>
      </div>
    </div>
  )
}
