import { useState, useEffect, Fragment } from 'react'
import ClickDetails from './ClickDetails'

export default function Dashboard({ refreshKey }) {
  const [links, setLinks] = useState([])
  const [search, setSearch] = useState('')
  const [expandedCode, setExpandedCode] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    fetch(`/api/links${params}`)
      .then((res) => res.json())
      .then(setLinks)
      .finally(() => setLoading(false))
  }, [search, refreshKey])

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString()
  }

  function toggleExpand(shortCode) {
    setExpandedCode(expandedCode === shortCode ? null : shortCode)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by URL, campaign, or source..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-8">Loading links...</p>
      ) : links.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg font-medium">No links yet</p>
          <p className="text-sm mt-1">Create your first UTM link to get started</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600 border-b border-slate-200">
                <th className="px-4 py-3 font-medium">Short Code</th>
                <th className="px-4 py-3 font-medium">Base URL</th>
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium text-center">Clicks</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <Fragment key={link.shortCode}>
                  <tr
                    onClick={() => toggleExpand(link.shortCode)}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-indigo-600">{link.shortCode}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">{link.baseUrl}</td>
                    <td className="px-4 py-3 text-slate-600">{link.params?.utm_campaign || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        link.clickCount > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {link.clickCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(link.createdAt)}</td>
                  </tr>
                  {expandedCode === link.shortCode && (
                    <tr>
                      <td colSpan={5}>
                        <ClickDetails shortCode={link.shortCode} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
