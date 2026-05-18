import { useState, useEffect } from 'react'
import { getPastLaunches } from '../api/spacex'
import './PastLaunches.css'

const ROCKET_FILTERS = [
  { label: 'ALL',          value: 'all' },
  { label: 'STARSHIP',     value: 'Starship' },
  { label: 'FALCON 9',     value: 'Falcon 9' },
  { label: 'FALCON HEAVY', value: 'Falcon Heavy' },
]

// LL2 status IDs: 3 = Success, 4 = Failure, 7 = Partial Failure
function getOutcome(status) {
  if (status?.id === 3) return { label: '✓ SUCCESS', cls: 'success' }
  if (status?.id === 7) return { label: '~ PARTIAL',  cls: 'partial' }
  if (status?.id === 4) return { label: '✕ FAILURE',  cls: 'failure' }
  return { label: '— UNKNOWN', cls: 'unknown' }
}

const IL_TZ = 'Asia/Jerusalem'

function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    timeZone: IL_TZ,
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function PastLaunches({ filter, setFilter }) {
  const [launches, setLaunches]       = useState([])
  const [offset, setOffset]           = useState(0)
  const [hasMore, setHasMore]         = useState(true)
  const [loading, setLoading]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    getPastLaunches(50, 0)
      .then(data => {
        setLaunches(data.results)
        setOffset(50)
        setHasMore(!!data.next)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadMore = () => {
    if (!hasMore) return
    setLoadingMore(true)
    getPastLaunches(50, offset)
      .then(data => {
        setLaunches(prev => [...prev, ...data.results])
        setOffset(prev => prev + 50)
        setHasMore(!!data.next)
      })
      .catch(console.error)
      .finally(() => setLoadingMore(false))
  }

  const filtered = filter === 'all'
    ? launches
    : launches.filter(l => l.rocket?.configuration?.name?.includes(filter))

  return (
    <div className="past-launches">
      <p className="section-label">History</p>
      <h2>PAST LAUNCHES</h2>

      <div className="filter-row">
        {!loading && (
          <span className="launch-count">{filtered.length} LOADED</span>
        )}
      </div>

      {loading ? (
        <p className="state-msg">Loading launches...</p>
      ) : (
        <>
          <div className="launches-table">
            <div className="table-header">
              <span>MISSION</span>
              <span>ROCKET</span>
              <span>DATE</span>
              <span>OUTCOME</span>
            </div>
            {filtered.map(launch => {
              const outcome = getOutcome(launch.status)
              return (
                <div key={launch.id} className="launch-row">
                  <span className="mission-name">{launch.mission?.name ?? launch.name.split(' | ').pop()}</span>
                  <span className="rocket-label">{launch.rocket?.configuration?.name ?? '—'}</span>
                  <span className="date-label">{formatShortDate(launch.net)}</span>
                  <span className={`outcome ${outcome.cls}`}>{outcome.label}</span>
                </div>
              )
            })}
          </div>

          {hasMore && (
            <button className="load-more" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? 'LOADING...' : 'LOAD MORE LAUNCHES'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
