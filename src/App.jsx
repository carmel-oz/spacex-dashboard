import { useState } from 'react'
import './App.css'
import StarshipHero from './components/StarshipHero'
import NextLaunch from './components/NextLaunch'
import LaunchStats from './components/LaunchStats'
import PastLaunches from './components/PastLaunches'
import RocketSpecs from './components/RocketSpecs'
import ApiLogDrawer from './components/ApiLogDrawer'
import { useApiLogger } from './context/ApiLoggerContext'

const TABS = [
  { id: 'launches',  label: 'Launches' },
  { id: 'starship',  label: 'Starship' },
  { id: 'rockets',   label: 'Rockets'  },
]

function App() {
  const { logs, isOpen, setIsOpen } = useApiLogger()
  const [activeTab, setActiveTab] = useState('launches')
  const [rocketFilter, setRocketFilter] = useState('all')

  return (
    <div className="app">
      <header className="site-header">
        <div className="container">
          <a
            className="avatar-link"
            href="https://www.linkedin.com/in/oz-carmel-automation/?skipRedirect=true"
            target="_blank"
            rel="noreferrer"
            title="Oz Carmel — LinkedIn"
          >
            <img className="avatar-img" src="/oz_profile.png" alt="Oz Carmel" />
          </a>
          <div className="logo">SPACEX</div>
          <nav className="nav">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <button
            className={`api-log-btn ${isOpen ? 'active' : ''}`}
            onClick={() => setIsOpen(o => !o)}
          >
            API LOG {logs.length > 0 && <span className="log-badge">{logs.length}</span>}
          </button>
        </div>
      </header>

      <main>
        {activeTab === 'starship' && (
          <section id="starship">
            <StarshipHero />
          </section>
        )}

        {activeTab === 'launches' && (
          <div className="container">
            <section id="launches">
              <NextLaunch filter={rocketFilter} setFilter={setRocketFilter} />
              <LaunchStats filter={rocketFilter} />
              <PastLaunches filter={rocketFilter} setFilter={setRocketFilter} />
            </section>
          </div>
        )}

        {activeTab === 'rockets' && (
          <div className="container">
            <section id="rockets">
              <RocketSpecs />
            </section>
          </div>
        )}
      </main>

      <footer className="site-footer">
        <div className="container">
          <span>SpaceX Dashboard — Data sourced from ll.thespacedevs.com &amp; api.spacexdata.com</span>
        </div>
      </footer>

      <ApiLogDrawer />
    </div>
  )
}

export default App
