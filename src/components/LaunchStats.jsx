import { useState, useEffect } from 'react'
import { getPastLaunches } from '../api/spacex'
import './LaunchStats.css'

// Derive stats from the already-loaded past launches page (no extra API calls)
function deriveStats(data) {
  const currentYear = new Date().getFullYear()
  const results     = data.results ?? []
  const thisYear    = results.filter(l => new Date(l.net).getFullYear() === currentYear).length
  const successCount = results.filter(l => l.status?.id === 3).length
  return {
    total:       data.count,
    thisYear,
    successRate: results.length > 0
      ? ((successCount / results.length) * 100).toFixed(1)
      : '—',
  }
}

export default function LaunchStats() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // getPastLaunches('past-50-0') is shared with PastLaunches component —
    // if it's already cached, this costs zero network requests.
    getPastLaunches(50, 0)
      .then(data => setStats(deriveStats(data)))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="stats-row"><p className="state-msg">Loading stats...</p></div>
  if (!stats)  return null

  return (
    <div className="stats-row">
      {[
        { label: 'TOTAL LAUNCHES',                      value: stats.total },
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
