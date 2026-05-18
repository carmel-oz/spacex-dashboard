import { useState, useEffect } from 'react'
import { getRockets } from '../api/spacex'
import './RocketSpecs.css'

const DISPLAY_ROCKETS = ['Falcon 9', 'Falcon Heavy', 'Starship']

export default function RocketSpecs() {
  const [rockets, setRockets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRockets()
      .then(data => setRockets(data.filter(r => DISPLAY_ROCKETS.includes(r.name))))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="state-msg">Loading rocket specs...</p>

  return (
    <div className="rocket-specs">
      <p className="section-label">Fleet</p>
      <h2>ROCKET SPECIFICATIONS</h2>

      <div className="rockets-grid">
        {rockets.map(rocket => {
          const leoPayload = rocket.payload_weights?.find(p => p.id === 'leo')
          return (
            <div key={rocket.id} className={`rocket-card ${rocket.name === 'Starship' ? 'featured' : ''}`}>
              <div className="rocket-header">
                <span className={`status-badge ${rocket.active ? 'active' : 'development'}`}>
                  {rocket.active ? 'ACTIVE' : 'IN DEVELOPMENT'}
                </span>
                <h3>{rocket.name}</h3>
                <p className="rocket-type">{rocket.type.toUpperCase()}</p>
              </div>

              <p className="rocket-description">{rocket.description}</p>

              <div className="specs-list">
                {(rocket.name === 'Starship' ? [
                  { label: 'HEIGHT',          value: `${rocket.height?.meters}m` },
                  { label: 'DIAMETER',        value: `${rocket.diameter?.meters}m` },
                  { label: 'MASS',            value: `${(rocket.mass?.kg / 1000).toFixed(0)}t` },
                  { label: 'SUPER HEAVY ENG', value: '33× RAPTOR' },
                  { label: 'STARSHIP ENG',    value: '6× RAPTOR VAC' },
                  { label: 'PROPELLANT',      value: 'LCH₄ / LOX' },
                  { label: 'SUCCESS RATE',    value: `${rocket.success_rate_pct}%` },
                  { label: 'LEO PAYLOAD',     value: leoPayload ? `${leoPayload.kg.toLocaleString()} kg` : 'N/A' },
                ] : [
                  { label: 'HEIGHT',          value: `${rocket.height?.meters}m` },
                  { label: 'DIAMETER',        value: `${rocket.diameter?.meters}m` },
                  { label: 'MASS',            value: `${(rocket.mass?.kg / 1000).toFixed(0)}t` },
                  { label: '1ST STG ENGINES', value: `${rocket.first_stage?.engines}× ${rocket.engines?.type}` },
                  { label: 'PROPELLANT',      value: `${rocket.engines?.propellant_1} / ${rocket.engines?.propellant_2}` },
                  { label: 'COST / LAUNCH',   value: `$${(rocket.cost_per_launch / 1_000_000).toFixed(0)}M` },
                  { label: 'SUCCESS RATE',    value: `${rocket.success_rate_pct}%` },
                  { label: 'LEO PAYLOAD',     value: leoPayload ? `${leoPayload.kg.toLocaleString()} kg` : 'N/A' },
                ]).map(({ label, value }) => (
                  <div key={label} className="spec-row">
                    <span className="spec-key">{label}</span>
                    <span className="spec-val">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
