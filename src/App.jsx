import { useState } from 'react'
import LinkGenerator from './components/LinkGenerator'
import Dashboard from './components/Dashboard'

const TABS = ['Generator', 'Dashboard']

export default function App() {
  const [activeTab, setActiveTab] = useState('Generator')
  const [refreshKey, setRefreshKey] = useState(0)

  function handleLinkCreated() {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-slate-900">UTM Link Generator</h1>
          <p className="text-sm text-slate-500">Generate tracked short links and monitor clicks</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'Generator' ? (
          <LinkGenerator onLinkCreated={handleLinkCreated} />
        ) : (
          <Dashboard refreshKey={refreshKey} />
        )}
      </main>
    </div>
  )
}
