import { useState } from 'react'
import { useApiLogger } from '../context/ApiLoggerContext'
import './ApiLogDrawer.css'

function parseUrl(url) {
  try {
    const u   = new URL(url)
    const src = u.hostname.includes('thespacedevs') ? 'LL2' : 'SpaceX-API'
    const path = u.pathname
      .replace('/2.3.0', '')
      .replace('/v4', '')
      .replace(/\/$/, '') || '/'
    return { src, path }
  } catch {
    return { src: '?', path: url.slice(0, 50) }
  }
}

function StatusBadge({ status }) {
  const cls = status === 0 ? 'err' : status < 300 ? 'ok' : 'err'
  return <span className={`log-status ${cls}`}>{status || 'ERR'}</span>
}

function MethodBadge({ method }) {
  return <span className={`log-method ${method.toLowerCase()}`}>{method}</span>
}

export default function ApiLogDrawer() {
  const { logs, isOpen, setIsOpen, clearLogs } = useApiLogger()
  const [expandedId, setExpandedId] = useState(null)

  const toggle = (id) => setExpandedId(prev => prev === id ? null : id)

  return (
    <div className={`api-drawer ${isOpen ? 'open' : ''}`}>

      {/* ── Tab ── */}
      <div className="drawer-tab" onClick={() => setIsOpen(o => !o)}>
        <span className="tab-label">⬡ API LOG</span>
        <span className="tab-count">{logs.length} requests</span>
        <span className="tab-chevron">{isOpen ? '▼' : '▲'}</span>
      </div>

      {/* ── Body ── */}
      {isOpen && (
        <div className="drawer-body">
          <div className="drawer-toolbar">
            <span className="toolbar-title">REQUEST LOG</span>
            <div className="toolbar-legend">
              <span className="legend-item"><span className="log-method get">GET</span> read data</span>
              <span className="legend-item"><span className="log-method post">POST</span> filtered query</span>
            </div>
            <button className="clear-btn" onClick={clearLogs}>CLEAR</button>
          </div>

          <div className="log-table">
            <div className="log-header">
              <span>METHOD</span>
              <span>SOURCE</span>
              <span>ENDPOINT</span>
              <span>STATUS</span>
              <span>DURATION</span>
              <span>TIME (IL)</span>
            </div>

            {logs.length === 0 && (
              <p className="log-empty">No requests fired yet. Reload the page to capture them.</p>
            )}

            {logs.map(entry => {
              const { src, path } = parseUrl(entry.url)
              const isExpanded    = expandedId === entry.id
              return (
                <div key={entry.id} className="log-entry">
                  <div
                    className={`log-row ${isExpanded ? 'active' : ''} ${!entry.ok ? 'failed' : ''}`}
                    onClick={() => toggle(entry.id)}
                  >
                    <MethodBadge method={entry.method} />
                    <span className="log-src">{src}</span>
                    <span className="log-url" title={entry.url}>{path}</span>
                    <StatusBadge status={entry.status} />
                    <span className="log-duration">{entry.duration}ms</span>
                    <span className="log-time">{entry.timestamp}</span>
                  </div>

                  {isExpanded && (
                    <div className="log-payload">
                      {entry.body && (
                        <div className="payload-section">
                          <p className="payload-label">REQUEST BODY</p>
                          <pre>{JSON.stringify(entry.body, null, 2)}</pre>
                        </div>
                      )}
                      <div className="payload-section">
                        <p className="payload-label">RESPONSE</p>
                        <pre>{JSON.stringify(entry.data, null, 2).slice(0, 3000)}{JSON.stringify(entry.data).length > 3000 ? '\n... (truncated)' : ''}</pre>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
