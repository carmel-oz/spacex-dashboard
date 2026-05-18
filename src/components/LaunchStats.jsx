import { useState, useEffect } from 'react'
import { getPastLaunches, getFalcon9Launches, getFalconHeavyLaunches, getStarshipLaunches } from '../api/spacex'
import './LaunchStats.css'

const FETCH_MAP = {
  'all':          getPastLaunches,
  'Falcon 9':     getFalcon9Launches,
  'Falcon Heavy': getFalconHeavyLaunches,
  'Starship':     getStarshipLaunches,
}

function deriveStats(data, filter) {
  const currentYear  = new Date().getFullYear()
  const results      = data.results ?? []
  const thisYear     = results.filter(l => new Date(l.net).getFullYear() === currentYear).length
  const successCount = results.filter(l => l.status?.id === 3).length
  const label        = filter === 'all' ? 'TOTAL LAUNCHES' : `${filter.toUpperCase()} LAUNCHES`
  return {
    total:       data.count,
    totalLabel:  label,
    thisYear,
    successRate: results.length > 0
      ? ((successCount / results.length) * 100).toFixed(1)
      : '—',
  }
}

export default function LaunchStats({ filter = 'all' }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [retry, setRetry]     = useState(0)

  useEffect(() => {
    setLoading(true)
    setData(null)
    setError(null)
    const fetchFn = FETCH_MAP[filter] ?? getPastLaunches
    fetchFn()
      .then(setData)
      .catch(err => {
        const status = err?.response?.status
        setError(status === 429 ? '429' : 'error')
      })
      .finally(() => setLoading(false))
  }, [filter, retry])

  if (loading) return <div className="stats-row"><p className="state-msg">Loading stats...</p></div>

  if (error) return (
    <div className="stats-row">
      <p className="state-msg">
        {error === '429' ? '⚠ Rate limited by API (429). Wait a moment then ' : '⚠ Failed to load stats. '}
        <button
          onClick={() => setRetry(r => r + 1)}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline', font: 'inherit' }}
        >retry</button>
      </p>
    </div>
  )

  if (!data) return null

  const stats = deriveStats(data, filter)

  return (
    <div className="stats-row">
      {[
        { label: stats.totalLabel,                      value: stats.total },
        { label: `LAUNCHES ${new Date().getFullYear()}`, value: stats.thisYear },
        { label: 'RECENT SUCCESS RATE',                 value: `${stats.successRate}%` },
      ].map(({ label, value }) => (
        <div key={label} className="stat-card">
          <span className="stat-label">{label}</span>
          <span className="stat-value">{value}</span>
        </div>
      ))}
    </div>
  )
}
