import { useState, useEffect } from 'react'
import { getUpcomingLaunches } from '../api/spacex'
import './NextLaunch.css'

const ROCKET_OPTIONS = [
  { label: 'ALL ROCKETS',  value: 'all' },
  { label: 'STARSHIP',     value: 'Starship' },
  { label: 'FALCON 9',     value: 'Falcon 9' },
  { label: 'FALCON HEAVY', value: 'Falcon Heavy' },
]

const IL_TZ = 'Asia/Jerusalem'

function formatDate(dateStr) {
  if (!dateStr) return 'TBD'
  const date = new Date(dateStr)
  const main = date.toLocaleString('en-US', {
    timeZone: IL_TZ,
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  const offset = date.toLocaleString('en-US', { timeZone: IL_TZ, timeZoneName: 'shortOffset' }).split(' ').pop()
  return { main, offset }
}

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({})

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetDate) - new Date()
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    calculate()
    const id = setInterval(calculate, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return (
    <div className="countdown">
      {[['DAYS', timeLeft.days], ['HRS', timeLeft.hours], ['MIN', timeLeft.minutes], ['SEC', timeLeft.seconds]].map(
        ([label, val]) => (
          <div key={label} className="countdown-unit">
            <span className="countdown-value">{String(val ?? 0).padStart(2, '0')}</span>
            <span className="countdown-label">{label}</span>
          </div>
        )
      )}
    </div>
  )
}

export default function NextLaunch({ filter = 'all', setFilter }) {
  const [launches, setLaunches] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    getUpcomingLaunches()
      .then(data => setLaunches([...data].sort((a, b) => new Date(a.net) - new Date(b.net))))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered   = filter === 'all'
    ? launches
    : launches.filter(l => l.rocket?.configuration?.name?.includes(filter))
  const nextLaunch = filtered[0]

  return (
    <div className="next-launch">
      <p className="section-label">Upcoming Mission</p>
      <h2>NEXT LAUNCH</h2>

      <div className="rocket-selector">
        {ROCKET_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`rocket-btn ${filter === opt.value ? 'active' : ''}`}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading && <p className="state-msg">Loading...</p>}
      {!loading && !nextLaunch && (
        <p className="state-msg">No upcoming launches found for this rocket.</p>
      )}

      {!loading && nextLaunch && (
        <div className="launch-card">
          <div className="launch-meta">
            <span className="flight-number">{nextLaunch.rocket?.configuration?.full_name ?? nextLaunch.rocket?.configuration?.name}</span>
            <span className="launch-date-text">
              {formatDate(nextLaunch.net).main}
              <span className="tz-offset">{formatDate(nextLaunch.net).offset}</span>
            </span>
          </div>
          <h3 className="launch-name">{nextLaunch.mission?.name ?? nextLaunch.name.split(' | ').pop()}</h3>
          <p className="launch-details">
            {nextLaunch.mission?.description ?? 'Mission details not yet available.'}
          </p>
          <Countdown targetDate={nextLaunch.net} />
          {nextLaunch.vidURLs?.[0]?.url && (
            <a className="watch-btn" href={nextLaunch.vidURLs[0].url} target="_blank" rel="noreferrer">
              WATCH WEBCAST →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
