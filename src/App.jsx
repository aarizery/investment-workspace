import React, { useState } from 'react'
import TopBar from './components/TopBar'
import MacroDriverBoard from './components/MacroDriverBoard'
import Watchlist from './components/Watchlist'
import StockChart from './components/StockChart'
import StockDetail from './components/StockDetail'
import NewsPanel from './components/NewsPanel'
import HeatMap from './components/HeatMap'
import SectorRotation from './components/SectorRotation'
import AlertSystem from './components/AlertSystem'
import PortfolioTracker from './components/PortfolioTracker'
import { useMarketData } from './hooks/useMarketData'

const TABS = [
  { key: 'terminal', label: 'TERMINAL' },
  { key: 'heatmap', label: 'HEATMAP' },
  { key: 'sectors', label: 'SECTORS' },
  { key: 'portfolio', label: 'PORTFOLIO' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('terminal')

  const {
    macroData, watchlist, watchlistData,
    focusSymbol, setFocusSymbol,
    focusChart, focusQuote,
    news, loading, lastUpdate,
    chartRange, setChartRange,
    addToWatchlist, removeFromWatchlist,
    refresh,
  } = useMarketData()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--bg-void)',
      overflow: 'hidden',
    }}>
      <TopBar
        macroData={macroData}
        lastUpdate={lastUpdate}
        loading={loading}
        onRefresh={refresh}
      />

      {/* Tab bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-dim)',
        padding: '0 12px',
        flexShrink: 0,
        height: 32,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0 14px',
              height: '100%',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: activeTab === tab.key ? 'var(--accent-orange)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.key ? '2px solid var(--accent-orange)' : '2px solid transparent',
              background: 'transparent',
              transition: 'all var(--transition)',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="pulse-dot" style={{ width: 5, height: 5 }} />
          <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>LIVE · 15S POLL</span>
        </div>
      </div>

      {/* TERMINAL TAB */}
      {activeTab === 'terminal' && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
          {/* LEFT */}
          <div style={{
            width: 440, flexShrink: 0, display: 'flex', flexDirection: 'column',
            borderRight: '1px solid var(--border-dim)', overflow: 'hidden',
          }}>
            <div style={{ flexShrink: 0 }}>
              <MacroDriverBoard data={macroData} onSelectLinked={setFocusSymbol} />
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <NewsPanel news={news} />
            </div>
          </div>

          {/* CENTER */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            overflow: 'hidden', borderRight: '1px solid var(--border-dim)', minWidth: 0,
          }}>
            <div style={{ flexShrink: 0, borderBottom: '1px solid var(--border-dim)' }}>
              <AlertSystem watchlistData={watchlistData} focusSymbol={focusSymbol} />
            </div>
            <div style={{ flex: '0 0 300px', borderBottom: '1px solid var(--border-dim)', overflow: 'hidden' }}>
              <StockChart
                quote={focusQuote}
                chartData={focusChart}
                range={chartRange}
                onRangeChange={setChartRange}
                onFocusChange={setFocusSymbol}
                watchlist={watchlist}
              />
            </div>
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <Watchlist
                data={watchlistData}
                watchlist={watchlist}
                focusSymbol={focusSymbol}
                onSelectFocus={setFocusSymbol}
                onAdd={addToWatchlist}
                onRemove={removeFromWatchlist}
              />
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ width: 260, flexShrink: 0, overflow: 'hidden' }}>
            <StockDetail quote={focusQuote} />
          </div>
        </div>
      )}

      {activeTab === 'heatmap' && (
        <div style={{ flex: 1, overflow: 'auto', padding: 8, minHeight: 0 }}>
          <HeatMap
            watchlistData={watchlistData}
            onSelectFocus={(sym) => { setFocusSymbol(sym); setActiveTab('terminal') }}
          />
        </div>
      )}

      {activeTab === 'sectors' && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
          <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
            <SectorRotation watchlistData={watchlistData} />
          </div>
          <div style={{ width: 440, borderLeft: '1px solid var(--border-dim)', overflow: 'auto', padding: 8 }}>
            <NewsPanel news={news} />
          </div>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div style={{ flex: 1, overflow: 'auto', padding: 8, minHeight: 0 }}>
          <PortfolioTracker watchlistData={watchlistData} />
        </div>
      )}

      {/* Status bar */}
      <div style={{
        height: 22, background: 'var(--bg-base)',
        borderTop: '1px solid var(--border-dim)',
        display: 'flex', alignItems: 'center',
        padding: '0 12px', gap: 16, flexShrink: 0,
      }}>
        {['ATLASIO WORKSPACE v1.1', 'DATA: YAHOO FINANCE', 'REGIME: MA50/MA200', `${watchlist.length} SYMBOLS`].map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: 'var(--border-bright)' }}>|</span>}
            <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>{item}</span>
          </React.Fragment>
        ))}
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>NOT FINANCIAL ADVICE</span>
      </div>
    </div>
  )
}
