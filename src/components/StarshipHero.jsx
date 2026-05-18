import { useState, useEffect } from 'react'
import { getStarship, getStarshipFlightCount } from '../api/spacex'
import './StarshipHero.css'

export default function StarshipHero() {
  const [starship, setStarship] = useState(null)
  const [flightCount, setFlightCount] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getStarship(),
      getStarshipFlightCount().catch(() => null),
    ]).then(([ship, count]) => {
      setStarship(ship)
      setFlightCount(count)
    }).finally(() => setLoading(false))
  }, [])

  const leoPayload = starship?.payload_weights?.find(p => p.id === 'leo')?.kg
  // API data is outdated (shows 37+6). SpaceX website confirms: 33 (Super Heavy) + 6 (Starship) = 39
  const SUPER_HEAVY_ENGINES = 33
  const STARSHIP_ENGINES     = 6
  const totalEngines         = SUPER_HEAVY_ENGINES + STARSHIP_ENGINES

  return (
    <div className="starship-hero">
      <div className="hero-glow" />
      <div className="hero-content container">
        {loading ? (
          <p className="hero-loading">Loading...</p>
        ) : (
          <>
            <p className="section-label">Featured Vehicle</p>
            <h1 className="hero-title">STARSHIP</h1>
            <p className="hero-tagline">MAKING LIFE MULTIPLANETARY</p>
            <p className="hero-description">{starship?.description}</p>

            <div className="hero-specs">
              {[
                { label: 'HEIGHT',               value: starship?.height?.meters ? `${starship.height.meters}m / ${starship.height.feet}ft` : null },
                { label: 'DIAMETER',             value: starship?.diameter?.meters ? `${starship.diameter.meters}m / ${starship.diameter.feet}ft` : null },
                { label: 'PAYLOAD — LEO',        value: leoPayload ? `${leoPayload.toLocaleString()} kg` : null },
                { label: 'SUPER HEAVY ENGINES',  value: `${SUPER_HEAVY_ENGINES} RAPTOR` },
                { label: 'STARSHIP ENGINES',     value: `${STARSHIP_ENGINES} RAPTOR` },
                { label: 'PROPELLANT',           value: 'LCH₄ / LOX' },
                { label: 'REUSABILITY',          value: 'FULLY REUSABLE' },
                { label: 'LAUNCHES TO DATE',     value: flightCount != null ? String(flightCount) : null },
              ].filter(item => item.value != null)
               .map(({ label, value }) => (
                <div key={label} className="hero-spec-item">
                  <span className="hero-spec-label">{label}</span>
                  <span className="hero-spec-value">{value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
